import { Metadata } from "next"
import OrderCompletedTemplate from "@modules/order/templates/order-completed-template"
import { enrichLineItems } from "@lib/data/cart"
import { retrieveOrder } from "@lib/data/orders"
import { HttpTypes } from "@medusajs/types"

export const metadata: Metadata = {
  title: "Order",
  description: "Your purchase is procesing...",
}

type Props = {
  searchParams: {
    external_reference?: string,
    preference_id: string
  }
}

async function getOrder(id: string) {
  const order = await retrieveOrder(id)

  if (!order) {
    return
  }

  const enrichedItems = await enrichLineItems(order.items, order.region_id!)

  return {
    ...order,
    items: enrichedItems,
  } as unknown as HttpTypes.StoreOrder
}

export default async function OrderConfirmedPage({ searchParams }: Props) {
  const orderId : string = searchParams.external_reference || '';

  const order = await getOrder(orderId);
  if (!order) {
    return (
      <div className="my-10 h-[400px] w-full flex items-center justify-center " >
        <p>No se ha realizado el pago</p>
      </div>
    )
  }

  return <OrderCompletedTemplate order={order} />

}
