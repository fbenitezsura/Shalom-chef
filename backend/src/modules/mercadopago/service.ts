import { MercadoPagoConfig, Preference } from 'mercadopago';
import { AbstractPaymentProvider } from "@medusajs/framework/utils"
import {
    Logger,
    AuthorizePaymentInput,
    AuthorizePaymentOutput,
    PaymentSessionStatus,
    CapturePaymentInput,
    CapturePaymentOutput,
    CancelPaymentInput,
    CancelPaymentOutput,
    CreateAccountHolderInput,
    DeletePaymentInput,
    DeletePaymentOutput,
    GetPaymentStatusInput,
    GetPaymentStatusOutput,
    InitiatePaymentInput,
    InitiatePaymentOutput,
    ListPaymentMethodsInput,
    RefundPaymentInput,
    RefundPaymentOutput,
    RetrievePaymentInput,
    RetrievePaymentOutput,
    SavePaymentMethodInput,
    UpdateAccountHolderInput,
    UpdatePaymentInput,
    UpdatePaymentOutput
} from "@medusajs/framework/types";
import { MedusaError } from "@medusajs/framework/utils";
import {
    BigNumber
} from "@medusajs/framework/utils"

type Options = {
    apiKey: string
    successUrl: string;
    failureUrl: string;
    pendingUrl: string;
}

type InjectedDependencies = {
    logger: Logger
}

class MercadopagoService extends AbstractPaymentProvider<Options> {
    static identifier = "mercadpago";

    protected client;
    protected preferenceClient: Preference;
    protected logger_: Logger;
    protected options_: Options;

    constructor(
        container: InjectedDependencies,
        options: Options
    ) {
        super(container, options);
        this.options_ = options;
        this.client = new MercadoPagoConfig({ accessToken: options.apiKey });
        this.preferenceClient = new Preference(this.client);
        this.logger_ = container.logger;
    }

    protected async createPreference(
        amount: number,
        description: string,
        externalReference?: string
    ): Promise<{ id: string; init_point: string }> {
        const body: Record<string, any> = {
            items: [
                {
                    title: description,
                    quantity: 1,
                    unit_price: amount,
                },
            ],
            back_urls: {
                success: this.options_.successUrl,
                failure: this.options_.failureUrl,
                pending: this.options_.pendingUrl,
            },
            auto_return: 'approved',
        };
        if (externalReference) {
            body.external_reference = externalReference;
        }

        const response = await this.preferenceClient.create({ body });
        return {
            id: response.body.id,
            init_point: response.body.init_point,
        };
    }

    static validateOptions(options: Record<any, any>) {
        if (!options.apiKey) {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                "API key is required in the provider's options."
            )
        }
    }

    async authorizePayment(
        input: AuthorizePaymentInput
    ): Promise<AuthorizePaymentOutput> {
        const externalId = input.data?.id

        // assuming you have a client that authorizes the payment
        const paymentData = await this.client.authorizePayment(externalId)

        return {
            data: paymentData,
            status: "authorized"
        }
    }

    async capturePayment(
        input: CapturePaymentInput
    ): Promise<CapturePaymentOutput> {
        const externalId = input.data?.id

        // assuming you have a client that captures the payment
        const newData = await this.client.capturePayment(externalId)
        return {
            data: {
                ...newData,
                id: externalId,
            }
        }
    }

    async cancelPayment(
        input: CancelPaymentInput
    ): Promise<CancelPaymentOutput> {
        const externalId = input.data?.id

        // assuming you have a client that cancels the payment
        const paymentData = await this.client.cancelPayment(externalId)
        return { data: paymentData }
    }

    async createAccountHolder({ context, data }: CreateAccountHolderInput) {
        const { account_holder, customer } = context

        if (account_holder?.data?.id) {
            return { id: account_holder.data.id as string }
        }

        if (!customer) {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                "Missing customer data."
            )
        }

        // assuming you have a client that creates the account holder
        const providerAccountHolder = await this.client.createAccountHolder({
            email: customer.email,
            ...data
        })

        return {
            id: providerAccountHolder.id,
            data: providerAccountHolder as unknown as Record<string, unknown>
        }
    }

    async getPaymentStatus(
        input: GetPaymentStatusInput
    ): Promise<GetPaymentStatusOutput> {
        const externalId = input.data?.id

        // assuming you have a client that retrieves the payment status
        const status = await this.client.getStatus(externalId)

        switch (status) {
            case "requires_capture":
                return { status: "authorized" }
            case "success":
                return { status: "captured" }
            case "canceled":
                return { status: "canceled" }
            default:
                return { status: "pending" }
        }
    }

    async deletePayment(
        input: DeletePaymentInput
    ): Promise<DeletePaymentOutput> {
        const externalId = input.data?.id

        // assuming you have a client that cancels the payment
        await this.client.cancelPayment(externalId)
        return {
            data: input.data
        }
    }

    async getWebhookActionAndData(
        payload: ProviderWebhookPayload["payload"]
    ): Promise<WebhookActionResult> {
        const {
            data,
            rawData,
            headers
        } = payload

        try {
            switch (data.event_type) {
                case "authorized_amount":
                    return {
                        action: "authorized",
                        data: {
                            // assuming the session_id is stored in the metadata of the payment
                            // in the third-party provider
                            session_id: (data.metadata as Record<string, any>).session_id,
                            amount: new BigNumber(data.amount as number)
                        }
                    }
                case "success":
                    return {
                        action: "captured",
                        data: {
                            // assuming the session_id is stored in the metadata of the payment
                            // in the third-party provider
                            session_id: (data.metadata as Record<string, any>).session_id,
                            amount: new BigNumber(data.amount as number)
                        }
                    }
                default:
                    return {
                        action: "not_supported",
                        data: {
                            session_id: "",
                            amount: new BigNumber(0)
                        }
                    }
            }
        } catch (e) {
            return {
                action: "failed",
                data: {
                    // assuming the session_id is stored in the metadata of the payment
                    // in the third-party provider
                    session_id: (data.metadata as Record<string, any>).session_id,
                    amount: new BigNumber(data.amount as number)
                }
            }
        }
    }

    async initiatePayment(
        input: InitiatePaymentInput
    ): Promise<InitiatePaymentOutput> {
        const { amount, context, data } = input;

        const description = data?.description || `Pago por ${amount} ${input.currency_code}`;

        const { id: preferenceId, init_point } = await this.createPreference(
            amount,
            description,
            data?.order_id?.toString()
        );

        return {
            id: preferenceId,
            data: { init_point },
        };
    }

    async listPaymentMethods({ context }: ListPaymentMethodsInput) {
        const { account_holder } = context
        const accountHolderId = account_holder?.data?.id as string | undefined

        if (!accountHolderId) {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                "Missing account holder ID."
            )
        }

        // assuming you have a client that lists the payment methods
        const paymentMethods = await this.client.listPaymentMethods({
            customer_id: accountHolderId
        })

        return paymentMethods.map((pm) => ({
            id: pm.id,
            data: pm as unknown as Record<string, unknown>
        }))
    }

    async refundPayment(
        input: RefundPaymentInput
    ): Promise<RefundPaymentOutput> {
        const externalId = input.data?.id

        // assuming you have a client that refunds the payment
        const newData = await this.client.refund(
            externalId,
            input.amount
        )

        return {
            data: input.data,
        }
    }

    async retrievePayment(
        input: RetrievePaymentInput
    ): Promise<RetrievePaymentOutput> {
        const externalId = input.data?.id

        // assuming you have a client that retrieves the payment
        return await this.client.retrieve(externalId)
    }

    async savePaymentMethod({ context, data }: SavePaymentMethodInput) {
        const accountHolderId = context?.account_holder?.data?.id as
            | string
            | undefined

        if (!accountHolderId) {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                "Missing account holder ID."
            )
        }

        // assuming you have a client that saves the payment method
        const paymentMethod = await this.client.savePaymentMethod({
            customer_id: accountHolderId,
            ...data
        })

        return {
            id: paymentMethod.id,
            data: paymentMethod as unknown as Record<string, unknown>
        }
    }

    async updateAccountHolder({ context, data }: UpdateAccountHolderInput) {
        const { account_holder, customer } = context

        if (!account_holder?.data?.id) {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                "Missing account holder ID."
            )
        }

        // assuming you have a client that updates the account holder
        const providerAccountHolder = await this.client.updateAccountHolder({
            id: account_holder.data.id,
            ...data
        })

        return {
            id: providerAccountHolder.id,
            data: providerAccountHolder as unknown as Record<string, unknown>
        }
    }

    async updatePayment(
        input: UpdatePaymentInput
    ): Promise<UpdatePaymentOutput> {
        const { amount, currency_code, context, data } = input;
        const externalId = data?.id;

        // Validate context.customer
        if (!context?.customer) {
            throw new Error("Context must include a valid customer.");
        }

        // assuming you have a client that updates the payment
        const customer = context.customer;
        const response = await this.client.update(
            externalId,
            {
                amount,
                currency_code,
                customer,
            }
        );

        return response;
    }


}

export default MercadopagoService;