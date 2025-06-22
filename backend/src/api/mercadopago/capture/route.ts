import { MedusaError } from "@medusajs/framework/utils";
import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { Modules } from "@medusajs/framework/utils";

export async function POST(
    req: MedusaRequest,
    res: MedusaResponse,
): Promise<void> {
    try {
        console.log("req body", req.body);
        const payload: any = req.body;

        console.log('payload que llega', payload);

        const paymentId = payload.data.resource || payload.data.data.id;

        console.log("paymentId", paymentId);

        const topic = payload.data.topic;

        console.log("topic", topic);

        if (!paymentId || typeof paymentId !== 'string') {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                'Invalid payload: missing paymentId'
            );
        }

        if (topic !== 'payment') {
            throw new MedusaError(
                MedusaError.Types.NOT_ALLOWED,
                'Topic not allowed'
            );
        }

        const mercadoPagPayment = new Payment(new MercadoPagoConfig({ accessToken: 'APP_USR-7376383145276933-060600-60a7ab6d0ffdef28f9fc7548ae27ec10-2463322099' }));

        console.log("paymentId obtenido", paymentId);
        //paymentId -> 115497439700

        const mpPayment = await mercadoPagPayment.get({ id: paymentId });

        console.log('mpPayment', mpPayment);

        if (mpPayment.status === 'approved') {
            const paymentModuleService = req.scope.resolve(
                Modules.PAYMENT,
            )

            const paymentCollection = await paymentModuleService.retrievePaymentCollection(
                mpPayment.metadata.session_id,
                { relations: ["payments"] },
            )

            const paymentIdMedusa = paymentCollection.payments[0].id;

            const login = await fetch(`https://backend-production-d28a.up.railway.app/auth/user/emailpass`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: "admin@yourmail.com",
                    password: "supersecret",
                }),
            });

            const { token } = await login.json();

            const result = await fetch(`https://backend-production-d28a.up.railway.app/admin/payments/${paymentIdMedusa}/capture`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            console.log("capturado", result);

            const paymentCapture = result.json();

            res.status(200).json({ paymentCapture });
        } else {
            res
                .status(500)
                .json({ message: "payment not authorized" })
        }

    } catch (err: any) {
        res
            .status(500)
            .json({ message: "", error: err.message })
    }
}
