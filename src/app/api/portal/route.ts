import { NextRequest, NextResponse } from "next/server";

// Redirect to billing page for Paystack customer management
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/dashboard/billing", request.url));
}


