import Stripe from "stripe";
import { env } from "@/lib/env";

if (!env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  typescript: true,
});
