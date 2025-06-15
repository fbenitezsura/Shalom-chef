// app/(country)/order/confirmed/page.tsx

import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import OrderCompletedTemplate from "@modules/order/templates/order-completed-template"
import { enrichLineItems, placeOrder } from "@lib/data/cart"
import { retrieveOrder } from "@lib/data/orders"
import type { HttpTypes } from "@medusajs/types"

/* ---------- helpers ---------- */
async function getOrder(id: string) {
  const order = await retrieveOrder(id)
  if (!order) return

  const enrichedItems = await enrichLineItems(order.items, order.region_id!)
  return { ...order, items: enrichedItems } as unknown as HttpTypes.StoreOrder
}

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "Your purchase was successful",
}

type Props = {
  /** /order/confirmed?preference_id=<cart_id>&… */
  searchParams: { preference_id?: string }
}

export default async function OrderConfirmedPage({ searchParams }: Props) {
  const orderId = searchParams.preference_id;
  console.log("orderId", orderId)

  const order = await getOrder(orderId)
  if (!order) return notFound()

  return <OrderCompletedTemplate order={order} />
}
