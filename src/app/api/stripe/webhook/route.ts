import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Stripe appelle cette adresse quand un paiement est réussi : elle active l'offre du couple.
export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new NextResponse("Signature manquante", { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return new NextResponse("Signature invalide", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const weddingId = session.metadata?.wedding_id;
    const plan = session.metadata?.plan;
    if (weddingId && (plan === "custom" || plan === "logistics") && session.payment_status === "paid") {
      const db = supabaseAdmin();
      await db.from("payments").upsert(
        { wedding_id: weddingId, stripe_session_id: session.id, plan, amount_cents: session.amount_total ?? 0, status: "paid" },
        { onConflict: "stripe_session_id" }
      );
      await db.from("weddings").update({ plan }).eq("id", weddingId);
    }
  }
  return NextResponse.json({ received: true });
}
