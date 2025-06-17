import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { randomUUID } from "crypto"
import { MercadoPagoConfig, Preference } from "mercadopago"
import type { PreferenceRequest } from "mercadopago/dist/clients/preference/commonTypes";

const mp = new Preference(
    new MercadoPagoConfig({
        accessToken: 'APP_USR-7376383145276933-060600-60a7ab6d0ffdef28f9fc7548ae27ec10-2463322099',
    }),
)

export async function POST(
    req: MedusaRequest,
    res: MedusaResponse,
): Promise<void> {
    try {

        console.log("asi llega el body", req.body)

        const {
            amount,
            description,
            sessionId,
            orderId,
        } = req.body as {
            amount: number
            description: string
            sessionId: string
            orderId: string
        }

        if (!amount || !description || !sessionId) {
            res
                .status(400)
                .json({ message: "amount, description & sessionId required" })
            return
        }

        const body: PreferenceRequest = {
            items: [
                {
                    id: "item_id",
                    title: description,
                    quantity: 1,
                    unit_price: amount,
                },
            ],
            back_urls: {
                success: 'https://shalomchef.cl/cl/order/confirmed',
                failure: 'https://shalomchef.cl/cl/order/confirmed',
                pending: 'https://shalomchef.cl/cl/order/confirmed',
            },
            notification_url: `https://backend-production-d28a.up.railway.app/hooks/payment/mercadpago_mercadpago`,
            external_reference: orderId,
            metadata: { session_id: sessionId, orderId },
        }

        console.log("body", body);

        const { id, init_point } = await mp.create({
            body,
            requestOptions: { idempotencyKey: randomUUID() },
        })

        res.status(200).json({ id, init_point })
    } catch (err) {
        res.status(500).json({ message: "Unable to create MP preference" })
    }
}
