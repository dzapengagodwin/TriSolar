import { createCipheriv, createDecipheriv } from 'node:crypto'
import https from 'node:https'
import http from 'node:http'
import { AbstractPaymentProvider, PaymentActions, MedusaError, ContainerRegistrationKeys } from '@medusajs/framework/utils'
import {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from '@medusajs/framework/types'

type PesepayOptions = {
  integrationKey?: string
  encryptionKey?: string
  baseUrl?: string
  environment?: 'sandbox' | 'production'
  callbackUrl?: string
  webhookSecret?: string
}

type PesepayEncryptedEnvelope = {
  payload?: string
  message?: string
  error?: string
}

type PesepayTransaction = {
  redirectUrl?: string
  redirect_url?: string
  referenceNumber?: string
  reference_number?: string
  transactionStatus?: string
  status?: string
  amountDetails?: {
    amount?: number
    currencyCode?: string
  }
  [key: string]: unknown
}

class PesepayProviderService extends AbstractPaymentProvider<PesepayOptions> {
  static identifier = 'pesepay'

  protected container_: any
  protected readonly options_: PesepayOptions

  constructor(
    container: any,
    options: PesepayOptions = {}
  ) {
    super(container, options)
    this.container_ = container
    this.options_ = options
  }

  static validateOptions(_options: Record<string, unknown>) {
    // Dynamic credentials can be resolved at runtime from PostgreSQL pesepay_config table
  }

  protected async getActiveConfig(): Promise<{
    integrationKey: string
    encryptionKey: string
    baseUrl: string
    environment: 'sandbox' | 'production'
    callbackUrl?: string
    webhookSecret?: string
  }> {
    let dbConfig: any = null
    try {
      // Payment providers run in an isolated module container that cannot
      // resolve other custom modules (like pesepayConfig). Instead, use
      // the shared PostgreSQL connection (__pg_connection__), a Knex
      // instance available in every Medusa v2 module container.
      const pgConnection =
        this.container_?.[ContainerRegistrationKeys.PG_CONNECTION] ||
        (typeof this.container_?.resolve === 'function'
          ? this.container_.resolve(ContainerRegistrationKeys.PG_CONNECTION)
          : null)

      if (pgConnection) {
        const rows = await pgConnection
          .select('*')
          .from('pesepay_config')
          .where('is_active', true)
          .orderBy('created_at', 'desc')
          .limit(1)

        if (rows && rows.length > 0) {
          dbConfig = rows[0]
          console.log('[Pesepay] DB config found, id:', dbConfig.id)
        } else {
          console.log('[Pesepay] No active config row in pesepay_config table')
        }
      } else {
        console.warn('[Pesepay] __pg_connection__ not available in container')
      }
    } catch (err: any) {
      console.warn('[Pesepay] DB lookup failed:', err?.message || err)
    }

    const integrationKey =
      dbConfig?.integration_key ||
      this.options_.integrationKey ||
      process.env.PESEPAY_INTEGRATION_KEY ||
      ''

    const encryptionKey =
      dbConfig?.encryption_key ||
      this.options_.encryptionKey ||
      process.env.PESEPAY_ENCRYPTION_KEY ||
      ''

    const environment =
      (
        dbConfig?.environment ||
        this.options_.environment ||
        process.env.PESEPAY_ENV ||
        'sandbox'
      ).toLowerCase() === 'production'
        ? 'production'
        : 'sandbox'

    const callbackUrl =
      dbConfig?.callback_url ||
      this.options_.callbackUrl ||
      process.env.PESEPAY_CALLBACK_URL ||
      'http://localhost:8000/zw/payment-callback'

    const webhookSecret =
      dbConfig?.webhook_secret ||
      this.options_.webhookSecret ||
      process.env.PESEPAY_WEBHOOK_SECRET ||
      ''

    const baseUrl =
      this.options_.baseUrl ||
      (environment === 'production'
        ? 'https://api.pesepay.com/api/payments-engine/v1'
        : 'https://api.test.sandbox.pesepay.com/payments-engine/v1')

    console.log(
      `[Pesepay] Using config from: ${dbConfig ? 'Admin Database' : '.env file'} | Env: ${environment} | Key: ${
        integrationKey ? integrationKey.slice(0, 8) + '...' : 'MISSING'
      } | BaseUrl: ${baseUrl}`
    )

    return {
      integrationKey,
      encryptionKey,
      baseUrl: baseUrl.replace(/\/+$/, ''),
      environment,
      callbackUrl,
      webhookSecret,
    }
  }

  protected encryptPayload(
    payload: Record<string, unknown>,
    encryptionKey: string
  ): string {
    if (!encryptionKey) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'Pesepay encryptionKey is not configured. Please set PESEPAY_ENCRYPTION_KEY in your backend .env file.'
      )
    }
    const key = encryptionKey
    const iv = key.slice(0, 16)
    const cipher = createCipheriv(
      'aes-256-cbc',
      Buffer.from(key.padEnd(32, '0').slice(0, 32), 'utf8'),
      Buffer.from(iv.padEnd(16, '0').slice(0, 16), 'utf8')
    )

    const encrypted = Buffer.concat([
      cipher.update(Buffer.from(JSON.stringify(payload), 'utf8')),
      cipher.final(),
    ])

    return encrypted.toString('base64')
  }

  protected decryptPayload(
    payload: string,
    encryptionKey: string
  ): Record<string, unknown> {
    if (!encryptionKey) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'Pesepay encryptionKey is not configured. Please set PESEPAY_ENCRYPTION_KEY in your backend .env file.'
      )
    }
    const key = encryptionKey
    const iv = key.slice(0, 16)
    const decipher = createDecipheriv(
      'aes-256-cbc',
      Buffer.from(key.padEnd(32, '0').slice(0, 32), 'utf8'),
      Buffer.from(iv.padEnd(16, '0').slice(0, 16), 'utf8')
    )

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(payload, 'base64')),
      decipher.final(),
    ])

    return JSON.parse(decrypted.toString('utf8')) as Record<string, unknown>
  }

  protected normalizeAmount(amount: string | number | bigint | null | undefined): number {
    if (amount === null || amount === undefined) {
      return 0
    }

    if (typeof amount === 'number') {
      return isNaN(amount) ? 0 : Number(amount.toFixed(2))
    }

    const parsed = String(amount).trim()
    const cleaned = parsed.replace(/,/g, '').replace(/[^0-9.-]/g, '')
    const num = parseFloat(cleaned)

    return isNaN(num) ? 0 : Number(num.toFixed(2))
  }
  /**
   * Low-level HTTP request using Node.js https/http modules.
   * Uses insecureHTTPParser to tolerate Pesepay's non-compliant
   * HTTP response headers (HPE_INVALID_HEADER_TOKEN).
   */
  protected httpRequest(
    url: URL,
    method: string,
    headers: Record<string, string>,
    body?: string
  ): Promise<{ ok: boolean; status: number; text: () => Promise<string> }> {
    return new Promise((resolve, reject) => {
      const transport = url.protocol === "https:" ? https : http
      const req = transport.request(
        url,
        {
          method,
          headers,
          insecureHTTPParser: true,
        },
        (res) => {
          const chunks: Buffer[] = []
          res.on("data", (chunk: Buffer) => chunks.push(chunk))
          res.on("end", () => {
            const responseText = Buffer.concat(chunks).toString("utf8")
            resolve({
              ok: (res.statusCode ?? 0) >= 200 && (res.statusCode ?? 0) < 300,
              status: res.statusCode ?? 0,
              text: () => Promise.resolve(responseText),
            })
          })
          res.on("error", reject)
        }
      )
      req.on("error", reject)
      if (body) {
        req.write(body)
      }
      req.end()
    })
  }

  protected async request<T>(
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    body?: Record<string, unknown>,
    query?: Record<string, string>
  ): Promise<T> {
    const config = await this.getActiveConfig()
    const url = new URL(`${config.baseUrl}${path}`)

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        url.searchParams.set(key, value)
      }
    }

    const requestBody =
      body !== undefined
        ? JSON.stringify({ payload: this.encryptPayload(body, config.encryptionKey) })
        : undefined

    if (!config.integrationKey) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'Pesepay integrationKey is not configured. Please set PESEPAY_INTEGRATION_KEY in your backend .env file.'
      )
    }

    const response = await this.httpRequest(
      url,
      method,
      {
        Authorization: config.integrationKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      requestBody
    )

    const text = await response.text()

    if (!response.ok) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        text || `Pesepay request failed with status ${response.status}`
      )
    }

    if (!text) {
      return {} as T
    }

    try {
      const parsed = JSON.parse(text) as PesepayEncryptedEnvelope | Record<string, unknown>
      const payload =
        parsed && typeof parsed === 'object' && 'payload' in parsed
          ? String((parsed as PesepayEncryptedEnvelope).payload)
          : typeof parsed === 'string'
          ? parsed
          : JSON.stringify(parsed)

      if (typeof payload === 'string' && payload.length > 0) {
        const decrypted = this.decryptPayload(payload, config.encryptionKey)
        return decrypted as T
      }

      return parsed as T
    } catch {
      return text as unknown as T
    }
  }

  protected mapStatus(status?: string): GetPaymentStatusOutput['status'] {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'successful':
      case 'captured':
      case 'completed':
        return 'captured'
      case 'initiated':
      case 'pending':
        return 'pending'
      case 'failed':
      case 'error':
        return 'error'
      case 'canceled':
      case 'cancelled':
        return 'canceled'
      default:
        return 'pending'
    }
  }

  async initiatePayment(
    input: InitiatePaymentInput
  ): Promise<InitiatePaymentOutput> {
    const config = await this.getActiveConfig()
    const amount = this.normalizeAmount(
      input.amount as string | number | bigint
    )
    const cartId = String(
      input.data?.cart_id ??
      input.data?.cartId ??
      (input as any).cart_id ??
      ''
    )

    let callbackUrl = String(
      input.data?.callback_url ||
      config.callbackUrl ||
      'http://localhost:8000/zw/payment-callback'
    )

    if (cartId && !callbackUrl.includes('cart_id=')) {
      const sep = callbackUrl.includes('?') ? '&' : '?'
      callbackUrl = `${callbackUrl}${sep}cart_id=${encodeURIComponent(cartId)}`
    }

    let response: PesepayTransaction
    try {
      response = await this.request<PesepayTransaction>('/payments/initiate', 'POST', {
        amountDetails: {
          amount,
          currencyCode: (input.currency_code || 'USD').toUpperCase(),
        },
        reasonForPayment:
          (input.data?.reasonForPayment as string) ?? 'Medusa order payment',
        resultUrl: callbackUrl,
        returnUrl: callbackUrl,
        paymentMetadata: {
          source: 'medusa',
          cart_id: cartId,
        },
      })
    } catch (err: any) {
      console.error(`Pesepay initiatePayment failed: ${err.message || err}`)
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Pesepay error: ${err.message || err}`
      )
    }

    const referenceNumber =
      response.referenceNumber ??
      response.reference_number ??
      `pesepay-${Date.now()}`

    return {
      id: referenceNumber,
      status: 'pending',
      data: {
        ...response,
        provider: 'pesepay',
        referenceNumber,
        redirectUrl: response.redirectUrl ?? response.redirect_url,
        cart_id: cartId,
      },
    }
  }

  async authorizePayment(
    input: AuthorizePaymentInput
  ): Promise<AuthorizePaymentOutput> {
    const referenceNumber = String(
      input.data?.referenceNumber ??
        input.data?.reference_number ??
        input.data?.id ??
        ''
    ).trim()

    console.log(
      `[Pesepay] authorizePayment called | ref: ${referenceNumber || 'NONE'} | webhookConfirmed: ${!!input.data?.webhookConfirmed} | session data keys: ${Object.keys(input.data ?? {}).join(', ')}`
    )

    // Always verify payment status with Pesepay; callback payloads are not authoritative.
    if (referenceNumber) {
      try {
        const statusResult = await this.getPaymentStatus({
          data: input.data ?? {},
        } as GetPaymentStatusInput)

        console.log(
          `[Pesepay] authorizePayment status check result | ref: ${referenceNumber} | status: ${statusResult.status} | transactionStatus: ${(statusResult.data as any)?.transactionStatus ?? 'N/A'}`
        )

        if (
          statusResult.status === 'captured' ||
          statusResult.status === 'authorized'
        ) {
          return {
            status: 'authorized',
            data: {
              ...(input.data ?? {}),
              ...(statusResult.data ?? {}),
            },
          }
        }

        if (statusResult.status === 'pending') {
          return {
            status: 'pending',
            data: {
              ...(input.data ?? {}),
              ...(statusResult.data ?? {}),
            },
          }
        }

        // Status was 'error' or 'canceled' from getPaymentStatus
        console.warn(
          `[Pesepay] authorizePayment: unexpected status "${statusResult.status}" for ref ${referenceNumber}`
        )
      } catch (err: any) {
        console.error(
          `[Pesepay] authorizePayment status check failed for ref ${referenceNumber}:`,
          err?.message || err
        )
      }
    } else {
      console.warn('[Pesepay] authorizePayment: no reference number found in session data')
    }

    return {
      status: 'error',
      data: input.data ?? {},
    }
  }

  async capturePayment(
    input: CapturePaymentInput
  ): Promise<CapturePaymentOutput> {
    return { data: input.data ?? {} }
  }

  async refundPayment(
    input: RefundPaymentInput
  ): Promise<RefundPaymentOutput> {
    return { data: input.data ?? {} }
  }

  async retrievePayment(
    input: RetrievePaymentInput
  ): Promise<RetrievePaymentOutput> {
    return { data: input.data ?? {} }
  }

  async updatePayment(
    input: UpdatePaymentInput
  ): Promise<UpdatePaymentOutput> {
    return {
      status: 'pending',
      data: input.data ?? {},
    }
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return { data: input.data ?? {} }
  }

  async cancelPayment(
    input: CancelPaymentInput
  ): Promise<CancelPaymentOutput> {
    return { data: input.data ?? {} }
  }

  async getPaymentStatus(
    input: GetPaymentStatusInput
  ): Promise<GetPaymentStatusOutput> {
    const referenceNumber = String(
      input.data?.referenceNumber ??
        input.data?.reference_number ??
        input.data?.id ??
        ''
    ).trim()

    if (!referenceNumber) {
      return { status: 'pending', data: input.data ?? {} }
    }

    try {
      const response = await this.request<PesepayTransaction>(
        '/payments/check-payment',
        'GET',
        undefined,
        { referenceNumber: encodeURIComponent(referenceNumber) }
      )

      return {
        status: this.mapStatus(response.transactionStatus ?? response.status),
        data: {
          ...(input.data ?? {}),
          ...response,
          provider: 'pesepay',
        },
      }
    } catch (err: any) {
      return {
        status: 'error',
        data: {
          ...(input.data ?? {}),
          error: err.message || 'Status check failed',
          provider: 'pesepay',
        },
      }
    }
  }

  async getWebhookActionAndData(
    data: ProviderWebhookPayload['payload']
  ): Promise<WebhookActionResult> {
    const payload = ((data?.data ?? data) as Record<string, unknown>) || {}
    const status = String(payload?.transactionStatus ?? payload?.status ?? 'pending')
    const mappedStatus = this.mapStatus(status)

    let action: WebhookActionResult['action'] = PaymentActions.NOT_SUPPORTED

    if (mappedStatus === 'captured') {
      action = PaymentActions.SUCCESSFUL
    } else if (mappedStatus === 'canceled') {
      action = PaymentActions.CANCELED
    } else if (mappedStatus === 'error') {
      action = PaymentActions.FAILED
    } else if (mappedStatus === 'pending') {
      action = PaymentActions.PENDING
    }

    return {
      action,
      data: {
        session_id: String(
          payload?.referenceNumber ??
            payload?.reference_number ??
            payload?.session_id ??
            ''
        ),
        amount: Number(
          ((payload?.amountDetails as { amount?: number } | undefined)?.amount ?? 0)
        ),
      },
    }
  }
}

export default PesepayProviderService
