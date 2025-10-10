# Paystack Integration Setup

This document explains how to set up Paystack payments for your Med-Touch Pharmacy application.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Paystack Configuration
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_test_your_public_key_here"
PAYSTACK_SECRET_KEY="sk_test_your_secret_key_here"
PAYSTACK_WEBHOOK_SECRET="your_webhook_secret_here"
```

### Getting Your Paystack Keys

1. **Sign up for Paystack**: Go to [paystack.com](https://paystack.com) and create an account
2. **Get your API keys**: 
   - Go to Settings > API Keys & Webhooks
   - Copy your Test Public Key and Test Secret Key
   - For production, use the Live keys instead

3. **Set up webhooks**:
   - Go to Settings > API Keys & Webhooks
   - Add a new webhook with URL: `https://yourdomain.com/api/payments/webhook`
   - Copy the webhook secret

## Database Migration

The Paystack integration requires new database tables. Run the following command to create the migration:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

## Features Implemented

### 1. Payment Processing
- ✅ Initialize transactions with Paystack
- ✅ Verify payment status
- ✅ Handle payment callbacks
- ✅ Store transaction data in database

### 2. Customer Management
- ✅ Create customers in Paystack
- ✅ Link customers to users
- ✅ Store customer data locally

### 3. Subscription Management
- ✅ Create subscription plans
- ✅ Handle recurring payments
- ✅ Track subscription status

### 4. Webhook Handling
- ✅ Verify webhook signatures
- ✅ Handle payment events
- ✅ Update transaction status

### 5. User Interface
- ✅ Payment forms with Paystack integration
- ✅ Billing dashboard
- ✅ Subscription management
- ✅ Transaction history

## API Endpoints

### Payment Endpoints
- `POST /api/payments/checkout` - Initialize payment
- `GET /api/payments/callback` - Handle payment callback
- `POST /api/payments/webhook` - Handle Paystack webhooks

### Customer Endpoints
- `GET /api/payments/customer-state` - Get customer information
- `GET /api/payments/subscriptions` - Get user subscriptions

## Usage Examples

### Initialize a Payment

```typescript
const response = await fetch('/api/payments/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 5000, // 50 GHS in kobo
    planCode: 'pro_plan',
    metadata: { plan_name: 'Pro Plan' }
  })
});

const { authorizationUrl } = await response.json();
window.location.href = authorizationUrl;
```

### Handle Payment Success

```typescript
// The callback URL will redirect to:
// /dashboard/billing?payment=success&reference=tx_123456
```

## Testing

### Test Cards (Ghana)
- **Successful payment**: 4084084084084081
- **Failed payment**: 4084084084084085
- **Insufficient funds**: 4084084084084086

### Test Amounts
- Use amounts in kobo (1 GHS = 100 kobo)
- Minimum amount: 100 kobo (1 GHS)

## Production Deployment

1. **Update environment variables** with live Paystack keys
2. **Set up webhook URL** in Paystack dashboard
3. **Test webhook** to ensure it's working
4. **Update callback URLs** to use your production domain

## Security Notes

- Never expose your secret key in client-side code
- Always verify webhook signatures
- Use HTTPS in production
- Validate all payment data server-side

## Support

For Paystack-specific issues, refer to:
- [Paystack Documentation](https://paystack.com/docs)
- [Paystack API Reference](https://paystack.com/docs/api)
- [Paystack Support](https://paystack.com/contact)
