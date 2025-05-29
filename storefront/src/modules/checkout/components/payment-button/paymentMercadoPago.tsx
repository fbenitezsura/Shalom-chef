"use client";

import React, { useEffect } from "react";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import type { HttpTypes } from "@medusajs/types";

type MercadoPagoCheckoutProps = {
  cart: HttpTypes.StoreCart;
};

export const MercadoPagoButton: React.FC<MercadoPagoCheckoutProps> = ({ cart }) => {
  // 1) Inicializar SDK con tu Public Key (sandbox o prod)
  useEffect(() => {
    initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_KEY, {
      locale: "es-CL",
    });
  }, []);

  console.log("cart", cart);
  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  );
  if (!session) {
    return null; // o un fallback
  }
  console.log("session", session);
  // 3) Usa el preferenceId de la sesión para renderizar el Wallet
  return (
    <Wallet
      initialization={{ preferenceId: session?.data?.preference_id  }}
      onError={(err) => console.error("MP Error:", err)}
      onReady={() => console.log("MP Checkout listo")}
    />
  );
};
