# Bug Report: Payment Flows & Pesepay Integration

## Critical Bugs Found

### 1. **CRITICAL: Insecure Environment File Write (Security Vulnerability)**
**File:** [apps/backend/src/api/admin/pesepay/settings/route.ts](apps/backend/src/api/admin/pesepay/settings/route.ts#L1)  
**Severity:** 🔴 CRITICAL

**Issue:**
- The `POST` endpoint writes directly to `.env` file without any authentication
- `AUTHENTICATE = false` allows unauthenticated access to modify payment provider credentials
- Credentials are written in plain text to the `.env` file
- This allows attackers to change payment provider keys and redirect payments to their accounts

**Code:**
```typescript
export const AUTHENTICATE = false  // ❌ ANYONE can call this endpoint

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { integrationKey, encryptionKey, environment, callbackUrl } = req.body
  updateEnvFile(updates)  // ❌ Writes directly to .env without validation
}
```

**Impact:** Complete payment system compromise, unauthorized payment redirection

**Fix:** 
- Require proper admin authentication
- Remove `AUTHENTICATE = false`
- Validate and hash sensitive values
- Store credentials in secure secret management system (not .env)

---

### 2. **CRITICAL: Missing Webhook Handler for Payment Confirmation**
**File:** Backend missing webhook route  
**Severity:** 🔴 CRITICAL

**Issue:**
- No webhook handler exists to process Pesepay payment callbacks
- Payment status is never updated when Pesepay sends webhook notifications
- Customers redirected back from Pesepay but order creation may fail silently
- `getPaymentStatus()` polls the API but webhook confirmations are never received

**Evidence:**
- `medusa-config.ts` defines `webhookSecret` but it's never used
- No API route handles `/payments/webhook` or similar
- Pesepay callback is set to `PESEPAY_CALLBACK_URL` but this is a storefront redirect URL, not a webhook endpoint
- No subscriber listening to payment webhook events

**Impact:** Payment confirmations are lost, orders not created for successful payments

**Fix:**
- Create webhook handler: `/api/admin/pesepay/webhook/route.ts`
- Implement webhook signature verification using `PESEPAY_WEBHOOK_SECRET`
- Update payment status based on webhook payload
- Trigger order creation workflow on successful payment notification

---

### 3. **CRITICAL: Broken Payment Flow - No Order Created After Pesepay Redirect**
**File:** [apps/storefront/src/modules/checkout/components/payment-button/index.tsx](apps/storefront/src/modules/checkout/components/payment-button/index.tsx#L168)  
**Severity:** 🔴 CRITICAL

**Issue:**
- `PesepayPaymentButton` redirects to Pesepay but **never creates an order**
- After customer pays on Pesepay and is redirected back, nothing happens
- Order creation relies entirely on webhook confirmation (which doesn't exist - see Bug #2)
- No way for customer to know if payment succeeded or failed

**Code:**
```typescript
const handlePayment = async () => {
  if (redirectUrl) {
    window.location.href = redirectUrl  // ❌ Redirects away, no order created
    return
  }
  // Fallback only if no redirectUrl - but this should never be reached
  await placeOrder()
}
```

**Comparison:** Stripe button calls `confirmCardPayment()` and then `onPaymentCompleted()`, but Pesepay just redirects.

**Impact:** Customers pay but no orders are created (without webhook fix)

**Fix:**
- Implement callback URL route that processes payment confirmation
- Check payment status before creating order
- Provide clear user feedback on payment status

---

### 4. **HIGH: Insufficient Encryption Key Validation**
**File:** [apps/backend/src/modules/pesepay/service.ts](apps/backend/src/modules/pesepay/service.ts#L93)  
**Severity:** 🟠 HIGH

**Issue:**
- Encryption key must be at least 16 characters (checked in test-connection route)
- But IV is derived from first 16 chars of key: `const iv = key.slice(0, 16)`
- Keys between 16-32 characters are padded with `"0"` to reach 32 bytes
- Weak key material can result from short keys + padding with zeros

**Code:**
```typescript
protected encryptPayload(payload: Record<string, unknown>): string {
  const key = this.getEncryptionKey()
  const iv = key.slice(0, 16)  // ❌ Static IV derived from key
  const cipher = createCipheriv(
    'aes-256-cbc',
    Buffer.from(key.padEnd(32, '0').slice(0, 32), 'utf8'),  // ❌ Padding with zeros
    Buffer.from(iv.padEnd(16, '0').slice(0, 16), 'utf8')
  )
}
```

**Problems:**
- Static IV makes encryption deterministic (same plaintext = same ciphertext)
- Padding with zeros is cryptographically weak
- IV and key derived from user input creates cryptographic vulnerability

**Impact:** Encrypted payloads may be predictable and vulnerable to cryptanalysis

**Fix:**
- Use random IV for each encryption
- Prepend IV to ciphertext
- Use proper key derivation (PBKDF2, Argon2) if key is user-provided
- Store IV separately or with ciphertext

---

### 5. **HIGH: Payment Redirect URL Not Validated**
**File:** [apps/storefront/src/modules/checkout/components/payment-button/index.tsx](apps/storefront/src/modules/checkout/components/payment-button/index.tsx#L176)  
**Severity:** 🟠 HIGH

**Issue:**
- `redirectUrl` is taken directly from payment session data without validation
- Could be injected with malicious URL from compromised payment provider response
- `window.location.href = redirectUrl` redirects without checking if it's a valid Pesepay domain

**Code:**
```typescript
const redirectUrl =
  ((paymentSession?.data as Record<string, unknown>)?.redirectUrl as string | undefined) ??
  ((paymentSession?.data as Record<string, unknown>)?.redirect_url as string | undefined) ??
  undefined

const handlePayment = async () => {
  if (redirectUrl) {
    window.location.href = redirectUrl  // ❌ No validation of URL origin
  }
}
```

**Impact:** Open redirect vulnerability, potential phishing attacks

**Fix:**
- Validate redirect URL origin matches Pesepay domain
- Use URL constructor to parse and validate
- Whitelist allowed redirect hosts

---

### 6. **HIGH: Missing Error Handling in Payment Status Check**
**File:** [apps/backend/src/modules/pesepay/service.ts](apps/backend/src/modules/pesepay/service.ts#L320)  
**Severity:** 🟠 HIGH

**Issue:**
- `getPaymentStatus()` uses query parameter for reference number without URL encoding
- Network errors during status check are not handled
- Empty `referenceNumber` returns 'pending' status silently

**Code:**
```typescript
async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
  const referenceNumber = String(input.data?.referenceNumber ?? '')
  
  if (!referenceNumber) {
    return { status: 'pending', data: input.data ?? {} }  // ❌ Silently returns pending
  }

  const response = await this.request<PesepayTransaction>(
    '/payments/check-payment',
    'GET',
    undefined,
    { referenceNumber }  // ❌ No URL encoding
  )
  // ❌ No error handling for network failures
}
```

**Impact:** Invalid payments return as "pending", orders stuck in processing

**Fix:**
- URL encode reference number in query params
- Add error handling and retry logic
- Log payment status check failures
- Return explicit error status instead of silently returning 'pending'

---

### 7. **MEDIUM: Race Condition - Payment Session May Not Have Redirect URL**
**File:** [apps/storefront/src/modules/checkout/components/payment-button/index.tsx](apps/storefront/src/modules/checkout/components/payment-button/index.tsx#L168)  
**Severity:** 🟡 MEDIUM

**Issue:**
- Payment button expects `redirectUrl` to be present in payment session
- But `initiatePayment()` may not be called yet or may fail
- Fallback `placeOrder()` in else branch creates order without payment (order before payment confirmed)

**Code:**
```typescript
const handlePayment = async () => {
  if (redirectUrl) {
    window.location.href = redirectUrl
    return
  }

  // ❌ This places an order without payment verification!
  await placeOrder().catch((err) => {
    setErrorMessage(err.message)
  })
}
```

**Impact:** Orders can be created without verified payment

**Fix:**
- Ensure payment session is initialized before showing button
- Disable button if redirectUrl is missing
- Show error if payment initialization fails

---

### 8. **MEDIUM: Type Safety Issue - Payment Data Casting**
**File:** [apps/storefront/src/lib/data/payment.ts](apps/storefront/src/lib/data/payment.ts) (not shown but referenced)  
**Severity:** 🟡 MEDIUM

**Issue:**
- Payment session data is cast to `Record<string, unknown>` without validation
- `redirectUrl` or `redirect_url` may not exist, could be null/undefined
- No type checking before accessing nested properties

**Code from Bug #5:**
```typescript
const redirectUrl =
  ((paymentSession?.data as Record<string, unknown>)?.redirectUrl as string | undefined) ??
  ((paymentSession?.data as Record<string, unknown>)?.redirect_url as string | undefined) ??
  undefined
```

**Impact:** TypeScript false safety, runtime errors possible

**Fix:**
- Create proper PaymentSessionData type
- Use type guards
- Validate response schema from backend

---

### 9. **MEDIUM: Settings Endpoint Exposes Encryption Key**
**File:** [apps/backend/src/api/admin/pesepay/settings/route.ts](apps/backend/src/api/admin/pesepay/settings/route.ts#L29)  
**Severity:** 🟡 MEDIUM

**Issue:**
- `GET` endpoint returns full encryption key in response
- Even though admin should be authenticated, this is exposed in response logs/monitoring
- `encryptionKey` should never be returned to client, only a masked version

**Code:**
```typescript
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  return res.status(200).json({
    integrationKey,
    encryptionKey,  // ❌ Full key exposed
    environment,
    callbackUrl,
  })
}
```

**Impact:** Encryption key may be logged/exposed in monitoring systems

**Fix:**
- Never return full encryption key to client
- Return only `isConfigured: boolean`
- Only return integration key if necessary

---

### 10. **LOW: Inconsistent Amount Normalization**
**File:** [apps/backend/src/modules/pesepay/service.ts](apps/backend/src/modules/pesepay/service.ts#L151)  
**Severity:** 🟢 LOW

**Issue:**
- `normalizeAmount()` uses regex `/[^0-9.-]/g` which allows multiple decimal points
- `"10.50.99"` would become `10.50.99` then parse to `10.50` (silently truncated)
- Amount normalization should validate currency decimals (USD = 2, JPY = 0)

**Code:**
```typescript
protected normalizeAmount(amount: string | number | bigint | null | undefined) {
  const sanitized = parsed.replace(/[^0-9.-]/g, '')  // ❌ Allows invalid formats
  return Number(sanitized || 0)
}
```

**Impact:** Amount validation issues, potentially incorrect charges

**Fix:**
- Validate against proper decimal places for currency
- Use BigInt or Decimal library for money
- Reject invalid amounts instead of silently normalizing

---

## Summary Table

| # | Bug | Severity | Type | Impact |
|---|-----|----------|------|--------|
| 1 | Unauthenticated credential write | 🔴 CRITICAL | Security | Payment system hijack |
| 2 | Missing webhook handler | 🔴 CRITICAL | Architecture | Orders never created |
| 3 | No order creation after redirect | 🔴 CRITICAL | Business Logic | Customers pay but no order |
| 4 | Weak encryption key handling | 🟠 HIGH | Cryptography | Predictable encryption |
| 5 | Open redirect in payment URL | 🟠 HIGH | Security | Phishing attacks |
| 6 | Missing error handling in status check | 🟠 HIGH | Reliability | Silent failures |
| 7 | Race condition - missing redirect | 🟡 MEDIUM | Logic | Unverified orders |
| 8 | Type safety in payment data | 🟡 MEDIUM | Code Quality | Runtime errors |
| 9 | Encryption key exposed in response | 🟡 MEDIUM | Security | Key exposure |
| 10 | Weak amount normalization | 🟢 LOW | Validation | Rare amount issues |

## Recommended Fix Priority

1. **IMMEDIATE (Blocks Pesepay):**
   - Bug #1: Add authentication to settings endpoint
   - Bug #2: Implement webhook handler
   - Bug #3: Add post-redirect order creation flow

2. **URGENT (Security):**
   - Bug #5: Validate redirect URLs
   - Bug #9: Stop exposing encryption key

3. **HIGH (Reliability):**
   - Bug #4: Fix encryption implementation
   - Bug #6: Add error handling

4. **NORMAL (Quality):**
   - Bug #7: Prevent race conditions
   - Bug #8: Add proper typing
   - Bug #10: Improve amount validation
