import { MercadoPagoConfig, Preference } from 'mercadopago';
import { randomUUID } from 'crypto';
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
    UpdatePaymentOutput,
    ProviderWebhookPayload,
    WebhookActionResult
} from "@medusajs/framework/types";
import { MedusaError } from "@medusajs/framework/utils";
import {
    BigNumber
} from "@medusajs/framework/utils"
import type { PreferenceRequest } from "mercadopago/dist/clients/preference/commonTypes";

type Options = {
    apiKey: string
    webhookApiKey: string;
    successUrl: string;
    failureUrl: string;
    pendingUrl: string;
    webhookUrl: string;
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

        console.log("autorizando el pago", input);

        const externalId =
            (input.data?.sessionId as string | undefined) ??
            (input.data?.sessionId as string | undefined)

        if (!externalId) {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                "Falta sessionId en data; revisa initiatePayment"
            )
        }

        return {
            data: { preference_id: externalId },
            status: "authorized",
        }
    }

    async capturePayment(
        input: CapturePaymentInput
    ): Promise<CapturePaymentOutput> {
         console.log("informacion que llega en el capturePayment", input)
        const paymentId = input.data?.id
        if (!paymentId) {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                "paymentId missing in capturePayment"
            )
        }
        const mpPayment = await this.client.getPayment(paymentId)
        if (mpPayment.status !== "approved") {
            return { data: { id: paymentId, mpStatus: mpPayment.status } }
        }
        return {
            data: {
                id: paymentId,
                external_reference: mpPayment.external_reference,
                mpStatus: mpPayment.status
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

    async getPaymentStatus(
        input: GetPaymentStatusInput
    ): Promise<GetPaymentStatusOutput> {
        console.log("informacion que llega en el getPaymentStatus", input)
        const paymentId = input.data?.id
        const mp = await this.client.getPayment(paymentId)

        switch (mp.status) {
            case "approved":
                return { status: "captured" }
            case "authorized":
                return { status: "authorized" }
            case "in_process":
                return { status: "pending" }
            default:
                return { status: "canceled" }
        }
    }

    async deletePayment(input: DeletePaymentInput): Promise<Record<string, unknown>> {
        try {
            await this.client.cancelPayment(input.data?.id)
        } catch {
            // ignoramos cualquier error de cancelación
        }
        // devolver {} le indica al workflow que puede continuar
        return {}
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
        console.log("entrada", input);
        const { amount, currency_code, data } = input

        const sessionId = (data?.session_id as string) ?? ""
        if (!sessionId) {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                "`session_id` es obligatorio para Mercado Pago"
            )
        }

        const numericAmount = Number(amount)
        const description =
            typeof data?.description === "string"
                ? data.description
                : `Pago por ${numericAmount} ${currency_code}`

        return {
            id: randomUUID(),
            data: { amount: numericAmount, description, sessionId },
        }
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

        const numericAmount = Number(amount);

        const response = await this.client.update(data.id!, {
            amount: numericAmount,
            currency_code,
            customer: context.customer,
        });

        return response;
    }

}

export default MercadopagoService;