import { NextRequest, NextResponse } from "next/server";

import { verifyPaystackTransaction } from "@/api/payments/paystack-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?payment=error&message=No reference provided`
      );
    }

    // Verify the transaction
    const transaction = await verifyPaystackTransaction(reference);

    if (transaction.status === "success") {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?payment=success&reference=${reference}`
      );
    } else {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?payment=failed&reference=${reference}`
      );
    }
  } catch (error) {
    console.error("Payment callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?payment=error&message=Verification failed`
    );
  }
}
