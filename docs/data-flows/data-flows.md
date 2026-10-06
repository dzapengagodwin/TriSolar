# Data Flow Architecture

> **Scope**: Detailed sequence flows and lifecycle models for Product Ingestion, Cart Management, Checkout & Payment, Order Processing & Notifications, and Cache Synchronization in Laptopzone.

---

## 1. Product Lifecycle & Catalog Flow

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Merchant / Admin
    participant AdminUI as Medusa Admin (/app)
    participant Medusa as Medusa Server (:9000)
    participant S3 as AWS S3 Storage
    participant DB as PostgreSQL Database
    participant Subscriber as Cache Invalidation Subscriber
    participant Storefront as Next.js Storefront (:8000)
    actor Customer as Shopper

    Admin->>AdminUI: Uploads images & creates laptop product
    AdminUI->>Medusa: POST /admin/products (with S3 files)
    Medusa->>S3: Upload and store image assets
    Medusa->>DB: Insert product, variants, prices, inventory
    Medusa->>DB: Link brand & insert SEO metadata
    Medusa-->>Subscriber: Emit 'product.created' event via Redis
    Subscriber->>Storefront: POST /api/revalidate (x-revalidation-secret)
    Storefront->>Storefront: Invalidate Next.js ISR tags (products, categories)
    Customer->>Storefront: GET /products/lenovo-thinkpad-t480
    Storefront->>Medusa: GET /store/products?handle=...
    Medusa->>DB: Read product with prices, options, brand, SEO
    Medusa-->>Storefront: Return hydrated Product JSON
    Storefront-->>Customer: Render server-side HTML + JSON-LD
```

---

## 2. Cart Management Flow

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Shopper
    participant Storefront as Next.js Storefront
    participant Cookie as Customer Browser Cookie
    participant Medusa as Medusa Cart Engine
    participant DB as PostgreSQL

    Customer->>Storefront: Clicks "Add to Cart" on Product Detail Page
    Storefront->>Cookie: Check for '_medusa_cart_id'
    alt Cart does not exist
        Storefront->>Medusa: POST /store/carts (region_id for 'zw')
        Medusa->>DB: Insert empty cart linked to USD currency
        Medusa-->>Storefront: Return cart object (id: 'cart_...')
        Storefront->>Cookie: Set '_medusa_cart_id'
    end
    Storefront->>Medusa: POST /store/carts/:id/line-items (variant_id, quantity: 1)
    Medusa->>DB: Validate variant stock & price
    Medusa->>DB: Insert/update cart line item
    Medusa->>DB: Recalculate cart subtotal, 15% VAT, and total
    Medusa-->>Storefront: Return updated Cart JSON
    Storefront-->>Customer: Mini-cart updates, badge counter increments
```

---

## 3. Checkout & Payment Flow (Pesepay Gateway)

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Shopper
    participant Storefront as Next.js Storefront
    participant Medusa as Medusa Backend
    participant PesepayProvider as Pesepay Payment Provider
    participant PesepayGateway as Pesepay API (Sandbox / Live)
    participant WebhookHandler as POST /store/pesepay/webhook

    Customer->>Storefront: Fills shipping address & selects Delivery method
    Storefront->>Medusa: POST /store/carts/:id (shipping_address)
    Storefront->>Medusa: POST /store/carts/:id/shipping-methods
    Customer->>Storefront: Chooses "Pesepay" (EcoCash, OneMoney, Card)
    Storefront->>Medusa: POST /store/payment-collections/:id/payment-sessions (provider_id: "pesepay")
    Medusa->>PesepayProvider: authorizePayment()
    PesepayProvider->>PesepayGateway: Initiates transaction with reference & returnUrl
    PesepayGateway-->>PesepayProvider: Returns redirectUrl & transaction reference
    PesepayProvider-->>Medusa-->>Storefront: Return redirectUrl
    Storefront-->>Customer: Redirect to Pesepay secure payment gateway
    Customer->>PesepayGateway: Completes PIN / OTP mobile money authorization

    par Direct Callback / Return
        PesepayGateway-->>Customer: Redirect to /payment-callback?cart_id=...&status=SUCCESS
        Customer->>Storefront: Lands on /payment-callback
        Storefront->>Medusa: POST /store/carts/:id/complete
        Medusa-->>Storefront: Returns confirmed Order object
        Storefront-->>Customer: Redirect to /order/confirmed/[id]
    and Asynchronous Webhook
        PesepayGateway->>WebhookHandler: POST /store/pesepay/webhook (AES-256 payload)
        WebhookHandler->>WebhookHandler: Decrypt payload using PESEPAY_ENCRYPTION_KEY
        WebhookHandler->>Medusa: Run processPesepayWebhookWorkflow
        Medusa->>Medusa: Verify payment status & capture payment
    end
```

---

## 4. Order Completion & Notification Flow

```mermaid
sequenceDiagram
    autonumber
    participant Medusa as Medusa Core Engine
    participant DB as PostgreSQL
    participant OrderPlacedSub as order-placed.ts Subscriber
    participant SendGrid as SendGrid Mail Service
    actor Customer as Shopper
    actor Admin as Store Owner / Operations Team

    Medusa->>DB: Transition Cart to Order (generate display_id, e.g. #1004)
    Medusa->>Medusa: Emit 'order.placed' event on Redis event bus
    Medusa-->>OrderPlacedSub: Receive 'order.placed' with order ID
    OrderPlacedSub->>DB: Fetch order graph (items, prices, shipping address, taxes)
    OrderPlacedSub->>DB: Fetch store settings for notification recipients

    par Customer Email
        OrderPlacedSub->>OrderPlacedSub: Render renderOrderConfirmation() HTML
        OrderPlacedSub->>SendGrid: Send order confirmation to customer email
        SendGrid-->>Customer: Deliver branded HTML order receipt
    and Store Owner Alert
        OrderPlacedSub->>OrderPlacedSub: Render renderOwnerOrderNotification() HTML
        OrderPlacedSub->>SendGrid: Dispatch alert to notification recipients (e.g. orders@laptopzone.co.zw)
        SendGrid-->>Admin: Deliver "New Order Placed" operational alert
    end
```

---

## 5. Fulfillment & Shipping Flow

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Warehouse Staff
    participant AdminUI as Medusa Admin (/app)
    participant Medusa as Medusa Server
    participant FulfillmentSub as order-fulfillment-created.ts Subscriber
    participant SendGrid as SendGrid Mail Service
    actor Customer as Shopper

    Admin->>AdminUI: Opens Order details -> Clicks "Create Fulfillment"
    AdminUI->>Medusa: POST /admin/orders/:id/fulfillments (tracking_number, items)
    Medusa->>Medusa: Decrement stocked inventory at Harare Warehouse
    Medusa->>Medusa: Mark order fulfillment_status = 'fulfilled'
    Medusa-->>FulfillmentSub: Emit 'order.fulfillment_created' event
    FulfillmentSub->>SendGrid: Send shipping notification email with tracking info
    SendGrid-->>Customer: Deliver "Your Laptopzone order is on its way!"
```
