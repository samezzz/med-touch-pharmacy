import { NextRequest, NextResponse } from "next/server";

// Redirect to new Paystack webhook endpoint
export async function POST(request: NextRequest) {
  return NextResponse.redirect(new URL("/api/payments/webhook", request.url));
}


