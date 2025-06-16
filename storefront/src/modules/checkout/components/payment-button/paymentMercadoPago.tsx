"use client"

import { Button } from "@medusajs/ui"
import { useRouter } from "next/navigation"
import type { HttpTypes } from "@medusajs/types"
import { placeOrder } from "@lib/data/cart"

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

  if (!session?.amount) return null

  const redirectToMP = async () => {
    const res = await placeOrder("mercadopago")

    console.log("esta es la respuesta del boton", res);

    if (res?.init_point) {
      window.location.href = res.init_point;
    }
  }

  return (
    <Button onClick={redirectToMP} data-testid={dataTestId}>
      Pagar con Mercado Pago
    </Button>
  )
}
