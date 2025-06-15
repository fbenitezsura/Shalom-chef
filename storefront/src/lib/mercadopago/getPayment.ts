// utils/mercadopago.ts
/**
 * Returns payments that match an external reference.
 * Move the access token to an env var (e.g.  MP_ACCESS_TOKEN).
 */
export async function searchPaymentsByReference(
  externalReference: string
) {
  const url = new URL(
    "https://api.mercadopago.com/v1/payments/search"
  );

  url.searchParams.set("external_reference", externalReference);

  const res = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer APP_USR-7376383145276933-060600-60a7ab6d0ffdef28f9fc7548ae27ec10-2463322099`,
    },
  });

  if (!res.ok) {
    throw new Error(
      `MercadoPago search failed: ${res.status} ${res.statusText}`
    );
  }

  return res.json(); // full API response
}
