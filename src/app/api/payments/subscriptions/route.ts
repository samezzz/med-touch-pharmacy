import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { getUserPaystackSubscriptions } from "@/api/payments/paystack-service";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscriptions = await getUserPaystackSubscriptions(user.id);

    return NextResponse.json({
      subscriptions: subscriptions.map(sub => ({
        id: sub.id,
        productId: (() => {
          try {
            const plan = sub.plan ? JSON.parse(sub.plan as unknown as string) : null;
            return plan?.plan_code ?? plan?.planCode ?? null;
          } catch {
            return null;
          }
        })(),
        subscriptionId: sub.subscriptionCode,
        status: sub.status,
        amount: sub.amount,
        nextPaymentDate: sub.nextPaymentDate,
      })),
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}