import { NextRequest, NextResponse } from "next/server";

// Redirect to new Paystack checkout endpoint
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productSlug = searchParams.get("productSlug");
  
  // Redirect to the new checkout endpoint
  const redirectUrl = productSlug 
    ? `/api/payments/checkout?productSlug=${productSlug}`
    : "/api/payments/checkout";
    
  return NextResponse.redirect(new URL(redirectUrl, request.url));
}


