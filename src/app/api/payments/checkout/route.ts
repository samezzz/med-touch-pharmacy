import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { initializePaystackTransaction } from "@/api/payments/paystack-service";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, planCode, metadata } = body;

    if (!amount || !user.email) {
      return NextResponse.json(
        { error: "Amount and user email are required" },
        { status: 400 }
      );
    }

    // Initialize Paystack transaction
    const result = await initializePaystackTransaction(
      user.id,
      amount, // Amount in kobo
      user.email,
      planCode,
      metadata
    );

    return NextResponse.json({
      success: true,
      authorizationUrl: result.authorizationUrl,
      reference: result.reference,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
