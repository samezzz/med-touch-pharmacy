"use client";

import { useState } from "react";

import { Button } from "@/ui/primitives/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/primitives/card";
import { Alert, AlertDescription, AlertTitle } from "@/ui/primitives/alert";
import { Input } from "@/ui/primitives/input";
import { Label } from "@/ui/primitives/label";

interface PaystackPaymentFormProps {
  planName?: string;
  planCode?: string;
  amount?: number; // Amount in GHS
  buttonText?: string;
  title?: string;
  description?: string;
  onSuccess?: () => void;
}

export function PaystackPaymentForm({
  planName = "Pro Plan",
  planCode,
  amount = 50, // Default 50 GHS
  buttonText = "Pay Now",
  title = "Upgrade to Pro",
  description = "Get access to all premium features and support the project.",
  onSuccess: _onSuccess,
}: PaystackPaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [customAmount, setCustomAmount] = useState(amount.toString());

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const paymentAmount = parseInt(customAmount) * 100; // Convert to kobo
      
      if (paymentAmount < 100) { // Minimum 1 GHS
        throw new Error("Minimum payment amount is 1 GHS");
      }

      if (!email) {
        throw new Error("Email is required");
      }

      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: paymentAmount,
          planCode,
          metadata: {
            plan_name: planName,
            email,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to initialize payment");
      }

      const data = await response.json();
      
      if (data.success && data.authorizationUrl) {
        // Redirect to Paystack payment page
        window.location.href = data.authorizationUrl;
      } else {
        throw new Error("Failed to get payment URL");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setError(error instanceof Error ? error.message : "Failed to process payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount (GHS)</Label>
          <Input
            id="amount"
            type="number"
            min="1"
            step="0.01"
            placeholder="Enter amount"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            required
          />
        </div>

        {planCode && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">
              <strong>Plan:</strong> {planName}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Code:</strong> {planCode}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handlePayment} 
          disabled={isLoading || !email || !customAmount}
          className="w-full"
        >
          {isLoading ? "Processing..." : `${buttonText} - GHS ${customAmount}`}
        </Button>
      </CardFooter>
    </Card>
  );
}
