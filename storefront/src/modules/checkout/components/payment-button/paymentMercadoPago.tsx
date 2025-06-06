"use client"

import { Button } from "@medusajs/ui"
import { useRouter } from "next/navigation"
import type { HttpTypes } from "@medusajs/types"

type Props = {
  cart: HttpTypes.StoreCart
  "data-testid"?: string
}

/**
 * Renderiza un único botón que envía al usuario al `init_point`
 * provisto por Mercado Pago (session.data.init_point).
 */
export const MercadoPagoButton: React.FC<Props> = ({
  cart,
  "data-testid": dataTestId,
}) => {
  const router = useRouter()

  // Medusa pone el init_point dentro del objeto data de la sesión
  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )
  const initPoint = session?.data?.init_point as string | undefined

  if (!initPoint) return null // aún no hay preferencia generada

  const redirectToMP = () => {
    // Si prefieres en la misma pestaña:
    window.location.href = initPoint
    // o en una nueva:
    // window.open(initPoint, "_blank")
  }

  return (
    <Button onClick={redirectToMP} data-testid={dataTestId}>
      Pagar con Mercado Pago
    </Button>
  )
}
