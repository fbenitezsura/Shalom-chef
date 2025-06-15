// app/(country)/order/confirmed/page.tsx
import { Metadata } from "next"
import { notFound } from "next/navigation"

import OrderCompletedTemplate from "@modules/order/templates/order-completed-template"
import { enrichLineItems } from "@lib/data/cart"
import { retrieveOrder } from "@lib/data/orders"
import type { HttpTypes } from "@medusajs/types"

/* ------------------------------------------------------------------ */
/*  Helper                                                            */
/* ------------------------------------------------------------------ */
async function getOrder(id: string) {
  const order = await retrieveOrder(id)
  if (!order) return null

  const items = await enrichLineItems(order.items, order.region_id!)
  return { ...order, items } as unknown as HttpTypes.StoreOrder
}

/* ------------------------------------------------------------------ */
/*  Metadata                                                          */
/* ------------------------------------------------------------------ */
export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "Your purchase was successful",
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */
type Props = {
  /** /order/confirmed?preference_id=<ORDER_ID> */
  searchParams: { preference_id?: string }
}

export default async function OrderConfirmedPage({ searchParams }: Props) {
  const orderId = searchParams.preference_id
  if (!orderId) return notFound()

  const order = await getOrder(orderId);
  console.log("ordenes",order);
  if (!order) return notFound()

  return <OrderCompletedTemplate order={order} />
}
