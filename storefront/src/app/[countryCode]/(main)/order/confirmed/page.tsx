import { Metadata } from "next"
import { notFound } from "next/navigation"
import { placeOrder } from "@lib/data/cart";
import OrderCompletedTemplate from "@modules/order/templates/order-completed-template"
import { enrichLineItems } from "@lib/data/cart"
import { retrieveOrder } from "@lib/data/orders"
import type { HttpTypes } from "@medusajs/types"
import { searchPaymentsByReference } from './../../../../../lib/mercadopago/getPayment';

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

type Props = {
  /** /order/confirmed?preference_id=<ORDER_ID> */
  searchParams: { 
    external_reference?: string, //payment session id
    preference_id: string // reference id mercado pago
   }
}

export default async function OrderConfirmedPage({ searchParams }: Props) {
  const sessionId = searchParams.external_reference;
  const preference_id = searchParams.preference_id;
  console.log("preference id usado", preference_id)
  const payment = await searchPaymentsByReference(preference_id);
  console.log("pago encontrado", payment);
  if(payment.result > 0) {
    await placeOrder();
  } else {

  }
  return (
    <div className="my-10 h-[400px] w-full flex items-center justify-center " >
      <p>No se ha realizado el pago</p>
    </div>
  )
}
