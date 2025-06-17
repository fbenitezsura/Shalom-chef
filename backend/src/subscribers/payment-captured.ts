import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"

export default async function paymentCapturedHandler({ event: { data }, container }: SubscriberArgs<{ id: string }>) {
  console.log("data", data);
  const logger = container.resolve("logger")
  logger.info(`¡Pago capturado! ID del pago: ${data.id}`)
  // Aquí puedes agregar cualquier lógica adicional que necesites
}

export const config: SubscriberConfig = {
  event: "payment.captured",
}