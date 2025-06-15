// app/(country)/order/confirmed/page.tsx

import { Metadata } from "next"
import { notFound } from "next/navigation"
import { MercadoPagoConfig, MerchantOrderClient } from "mercadopago"

import OrderCompletedTemplate from "@modules/order/templates/order-completed-template"
import { enrichLineItems } from "@lib/data/cart"
import { retrieveOrder } from "@lib/data/orders"
import { sdk } from "@lib/config"
import type { HttpTypes } from "@medusajs/types"

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Devuelve la merchant-order asociada a un preference_id */
async function getMerchantOrder(preferenceId: string) {
  const mp = new MercadoPagoConfig({
    accessToken: 'APP_USR-321cfb8d-9e6d-467a-92cf-1d9a3fc96ba0', // token privado de MP
  })
  const moClient = new MerchantOrderClient(mp)

  const { elements } = await moClient.search({
    qs: { preference_id: preferenceId },
  })

  return elements?.[0] ?? null
}

async function getOrder(id: string) {
  const order = await retrieveOrder(id)
  if (!order) return
  const items = await enrichLineItems(order.items, order.region_id!)
  return { ...order, items } as unknown as HttpTypes.StoreOrder
}

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "Your purchase was successful",
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */
type Props = {
  /** /order/confirmed?preference_id=xxx */
  searchParams: { preference_id?: string }
}

export default async function OrderConfirmedPage({ searchParams }: Props) {
  const preferenceId = searchParams.preference_id
  if (!preferenceId) return notFound()

  /* 1. Consulta Mercado Pago para obtener la merchant-order */
  const mpOrder = await getMerchantOrder(preferenceId)
  if (!mpOrder) return notFound()

  /* 2. El external_reference lo dejamos igual a cart_id al crear la Preference */
  const cartId = mpOrder.external_reference as string | undefined
  if (!cartId) return notFound()

  /* 3. Completa el carrito (si aún no lo está) y obtén el order_id */
  const completeRes = await sdk.store.cart.complete(cartId).catch(() => null)
  const orderId =
    completeRes?.order?.id || completeRes?.id || cartId /* fallback */

  /* 4. Recupera la orden de Medusa */
  const order = await getOrder(orderId)
  if (!order) return notFound()

  /* 5. Renderiza la página de confirmación */
  return <OrderCompletedTemplate order={order} />
}
