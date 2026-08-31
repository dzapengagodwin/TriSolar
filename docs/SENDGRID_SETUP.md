# SendGrid Email Integration Guide for LaptopZone (MedusaJS v2)

This document provides complete instructions for setting up, configuring, testing, and deploying **SendGrid Transactional Emails** in the LaptopZone MedusaJS v2 backend.

---

## 1. How SendGrid Works in LaptopZone

Our implementation uses MedusaJS v2's native event-driven notification architecture:

```
[ Medusa Ecommerce Events ]
       │ (order.placed, payment.captured, order.fulfillment_created, customer.created, auth.password_reset)
       ▼
[ Event Subscribers ] (apps/backend/src/subscribers/*.ts)
       │
       ▼
[ Notification Module Service ] (@medusajs/medusa/notification)
       │
       ▼
[ SendGrid Provider ] (apps/backend/src/modules/sendgrid)
       │ (Renders responsive LaptopZone-branded HTML + plain-text fallback)
       ▼
[ SendGrid Mail API ] (@sendgrid/mail)
       │
       ▼
[ Customer Inbox ]
```

---

## 2. SendGrid Account Setup & Credentials

### Step 1: Create a SendGrid Account
1. Go to [https://signup.sendgrid.com/](https://signup.sendgrid.com/) and register an account.
2. Complete your organization verification.

### Step 2: Authenticate Your Sending Domain
To ensure high deliverability and prevent emails from landing in spam:
1. Navigate to **Settings** $\rightarrow$ **Sender Authentication** $\rightarrow$ **Authenticate Your Domain**.
2. Select your DNS host and enter your domain (e.g. `laptopzone.co.zw`).
3. Add the provided DNS records (usually 3 CNAME records for DKIM/SPF) to your DNS management panel (Cloudflare, cPanel, Namecheap, etc.):
   - `emXXXX.laptopzone.co.zw` $\rightarrow$ `uXXXX.wl.sendgrid.net`
   - `s1._domainkey.laptopzone.co.zw` $\rightarrow$ `s1.domainkey.uXXXX.wl.sendgrid.net`
   - `s2._domainkey.laptopzone.co.zw` $\rightarrow$ `s2.domainkey.uXXXX.wl.sendgrid.net`
4. Click **Verify** in SendGrid until all records are marked as verified.

### Step 3: Create a Dedicated API Key
1. Go to **Settings** $\rightarrow$ **API Keys** $\rightarrow$ **Create API Key**.
2. Name the key: `LaptopZone-Medusa-Backend`.
3. Set permissions to **Restricted Access** and grant **Full Access** to **Mail Send** only (for optimal security).
4. Copy the API key (starts with `SG.`) immediately.

---

## 3. Environment Variables Configuration

In `apps/backend/.env`:

```env
# SendGrid Credentials & Sender Addresses
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=orders@laptopzone.co.zw
SENDGRID_ORDER_FROM_EMAIL=orders@laptopzone.co.zw
SENDGRID_ACCOUNT_FROM_EMAIL=noreply@laptopzone.co.zw
SENDGRID_FROM_NAME=LaptopZone
SENDGRID_SANDBOX=false

# Storefront & Admin URLs (used in email buttons)
STOREFRONT_URL=http://localhost:8000
ADMIN_URL=http://localhost:9000/app
```

### Sender Address Routing:
- **`orders@laptopzone.co.zw`** is used for order confirmations, payment receipts, and shipping notifications.
- **`noreply@laptopzone.co.zw`** is used for account creation welcomes, password reset tokens, and staff invitations.
- Both addresses are automatically routed based on the email template, or can be customized via the respective environment variables above.

> [!WARNING]
> Never commit `SENDGRID_API_KEY` to Git and never prefix it with `NEXT_PUBLIC_` (it must only exist in the Medusa backend environment).

---

## 4. Supported Transactional Emails

| Email Type | Sender Address | Trigger Event | Description |
|---|---|---|---|
| **Order Confirmation** | `orders@laptopzone.co.zw` | `order.placed` | Complete order receipt with items, thumbnails, unit prices, discounts, shipping fee, total, delivery address, and "View Order" CTA. |
| **Payment Receipt** | `orders@laptopzone.co.zw` | `order.payment_captured` | Payment confirmation showing amount paid, currency, payment date, and transaction status. |
| **Shipment Notification** | `orders@laptopzone.co.zw` | `order.fulfillment_created` | Dispatch notification with tracking number, carrier, items in shipment, and tracking link. |
| **Password Reset** | `noreply@laptopzone.co.zw` | `auth.password_reset` | Secure password reset email containing a tokenized link with 24-hour expiration. |
| **Welcome Email** | `noreply@laptopzone.co.zw` | `customer.created` | Friendly welcome email introducing LaptopZone perks and store link. |
| **Admin Invite** | `noreply@laptopzone.co.zw` | `invite.created` / `invite.resent` | Staff invitation email with a secure token to join the admin dashboard. |

---

## 5. Local Testing & Development

### A. Sandbox Mode (No emails sent)
Set in `apps/backend/.env`:
```env
SENDGRID_SANDBOX=true
```
When `SENDGRID_SANDBOX=true` (or if `SENDGRID_API_KEY` is omitted in development), the notification service will simulate sending emails by logging the full envelope, recipient, and subject in the terminal without contacting SendGrid.

### B. Live Test Email
Set in `apps/backend/.env`:
```env
SENDGRID_API_KEY=SG.your_actual_key
SENDGRID_FROM_EMAIL=your_verified_sender@laptopzone.co.zw
SENDGRID_SANDBOX=false
```
Placing an order on the storefront or registering an account will immediately trigger real emails.

### C. Running Unit Tests
To run the automated SendGrid unit test suite:
```bash
# In PowerShell:
cd apps/backend
$env:TEST_TYPE="unit"; npx jest src/modules/sendgrid/__tests__/sendgrid.unit.spec.ts --runInBand --forceExit
```

---

## 6. Production Deployment (VPS)

1. SSH into your VPS:
   ```bash
   ssh user@your-vps-ip
   cd /path/to/my-medusa-store
   ```
2. Pull the latest code:
   ```bash
   git pull origin main
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Ensure `apps/backend/.env` contains your verified production credentials:
   ```env
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   SENDGRID_FROM_EMAIL=orders@laptopzone.co.zw
   SENDGRID_FROM_NAME=LaptopZone
   SENDGRID_SANDBOX=false
   STOREFRONT_URL=https://laptopzone.co.zw
   ADMIN_URL=https://admin.laptopzone.co.zw/app
   ```
5. Build and restart the Medusa backend:
   ```bash
   npm run build
   pm2 restart medusa-backend # or systemctl restart medusa
   ```

---

## 7. Troubleshooting

- **`401 Unauthorized`**: Check that `SENDGRID_API_KEY` in `apps/backend/.env` is correct and active.
- **`403 Forbidden` / Sender Identity Not Verified**: Ensure `SENDGRID_FROM_EMAIL` exactly matches a domain or single sender verified in SendGrid $\rightarrow$ Sender Authentication.
- **Emails going to Spam**: Verify that your domain's SPF, DKIM, and DMARC DNS records are properly configured and verified in SendGrid.
- **Duplicate emails**: All subscribers include an `idempotency_key` (e.g. `order_placed_${order.id}`) to ensure notifications are never sent twice for the same event.
