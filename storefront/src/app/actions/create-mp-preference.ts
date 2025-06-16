// app/actions/create-mp-preference.ts
"use server"

export async function createMpPreference(input: {
  sessionId: string
  orderId: string
  amount: number
  description: string
}) {
  const res = await fetch("https://backend-production-d28a.up.railway.app/mercadopago/payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  })

  console.log("res", res);

  if (!res.ok) throw new Error(await res.text())

  return res.json() as Promise<{ init_point: string }>
}
