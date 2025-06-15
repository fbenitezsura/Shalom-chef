// app/(country)/order/confirmed/page.tsx

import { Metadata } from "next"
import { notFound } from "next/navigation"
import { MercadoPagoConfig, Payment } from "mercadopago"          // ← Payment

import OrderCompletedTemplate from "@modules/order/templates/order-completed-template"
import { enrichLineItems } from "@lib/data/cart"
import { retrieveOrder } from "@lib/data/orders"
import { sdk } from "@lib/config"
import type { HttpTypes } from "@medusajs/types"

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Busca el primer pago asociado a un `preference_id`.
 * (El objeto de pago incluye `external_reference` = cart_id).
 */
async function getPaymentByPreference(preferenceId: string) {
  const mp = new MercadoPagoConfig({
    accessToken: 'APP_USR-321cfb8d-9e6d-467a-92cf-1d9a3fc96ba0', // token privado en ENV
  })
  const paymentClient = new Payment(mp)

  // El SDK acepta un objeto con la query directamente
  const { results } = await paymentClient.search({
    preference_id: preferenceId,
  } as any)                                         // `as any` para silenciar TS

  return results?.[0] ?? null
}

async function getOrder(id: string) {
  const order = await retrieveOrder(id)
  if (!order) return null
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

  /* 1. Consulta Mercado Pago por el pago */
  const mpPayment = await getPaymentByPreference(preferenceId)
  if (!mpPayment) return notFound()

  /* 2. `external_reference` = cart_id que grabaste al crear la Preference */
  const cartId = mpPayment.external_reference as string | undefined
  if (!cartId) return notFound()

  /* 3. Completa el carrito (ignora error si ya está cerrado) */
  let orderId: string | undefined
  try {
    const res = await sdk.store.cart.complete(cartId)
    orderId = res?.order?.id
  } catch {
    /* carrito ya completado o no completable desde frontend */
  }

  /* fallback: busca orden existente por cart_id (línea opcional) */
  if (!orderId) {
    const search = await sdk.admin.orders.list({ cart_id: cartId }).catch(() => null)
    orderId = search?.orders?.[0]?.id
  }

  if (!orderId) return notFound()

  /* 4. Recupera la orden de Medusa */
  const order = await getOrder(orderId)
  if (!order) return notFound()

  /* 5. Renderiza la confirmación */
  return <OrderCompletedTemplate order={order} />
}
