import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { getCustomerState } from "@/api/payments/service";

export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customerState = await getCustomerState(user.id);

    if (!customerState) {
      return NextResponse.json({
        id: null,
        email: user.email,
        subscriptions: [],
      });
    }

    return NextResponse.json(customerState);
  } catch (error) {
    console.error("Error fetching customer state:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer state" },
      { status: 500 }
    );
  }
}