"use client"

import { Button } from "@medusajs/ui"
import { useRouter } from "next/navigation"
import type { HttpTypes } from "@medusajs/types"
import { placeOrder } from "@lib/data/cart"
import { createMpPreference } from "./../../../../app/actions/create-mp-preference";

type Props = {
  cart: HttpTypes.StoreCart
  "data-testid"?: string
}

export const MercadoPagoButton: React.FC<Props> = ({
  cart,
  "data-testid": dataTestId,
}) => {
  const router = useRouter()

  /** Mercado Pago guarda el init_point dentro de la session */
  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending",
  )

  console.log("session", session);

  if (!session?.amount) return null

  const redirectToMP = async () => {
    // 1) Completar carrito → obtener orden
    const order = await placeOrder();

    console.log("la orden creda", order);

    // 2) Crear preferencia en el servidor Next (sin CORS)
    const { init_point } = await createMpPreference({
      sessionId: cart.id,
      orderId: order.order.id,
      amount: cart.total,
      description: `Orden #${order.display_id ?? order.id}`,
    })

    // 3) Redirigir a Mercado Pago
    router.push(init_point)
  }

  return (
    <Button onClick={redirectToMP} data-testid={dataTestId}>
      Pagar con Mercado Pago
    </Button>
  )
}
