import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import { PAYSTACK_CONFIG } from "@/lib/paystack";
import { verifyPaystackTransaction } from "@/api/payments/paystack-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature provided" }, { status: 400 });
    }

    // Verify webhook signature
    const hash = crypto
      .createHmac("sha512", PAYSTACK_CONFIG.webhookSecret)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);

    // Handle different webhook events
    switch (event.event) {
      case "charge.success":
        // Transaction was successful
        if (event.data.reference) {
          await verifyPaystackTransaction(event.data.reference);
        }
        break;

      case "subscription.create":
        // Subscription was created
        console.log("Subscription created:", event.data);
        break;

      case "subscription.disable":
        // Subscription was disabled
        console.log("Subscription disabled:", event.data);
        break;

      case "subscription.enable":
        // Subscription was enabled
        console.log("Subscription enabled:", event.data);
        break;

      default:
        console.log("Unhandled webhook event:", event.event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
