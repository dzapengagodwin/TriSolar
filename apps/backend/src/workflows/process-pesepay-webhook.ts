import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { completeCartWorkflow } from "@medusajs/medusa/core-flows"

export type ProcessPesepayWebhookInput = {
  referenceNumber: string
  isSuccessful: boolean
}

export type ProcessPesepayWebhookOutput = {
  processed: boolean
  sessionId?: string
  referenceNumber?: string
  cartId?: string
  orderId?: string
  note?: string
}

export const processPesepayWebhookStep = createStep(
  "process-pesepay-webhook",
  async (
    input: ProcessPesepayWebhookInput,
    { container }
  ): Promise<StepResponse<ProcessPesepayWebhookOutput>> => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const paymentModule = container.resolve(Modules.PAYMENT)

    const { referenceNumber, isSuccessful } = input

    if (!referenceNumber) {
      return new StepResponse<ProcessPesepayWebhookOutput>({
        processed: false,
        note: "No reference number",
      })
    }

    try {
      const { data: paymentSessions } = await query.graph({
        entity: "payment_session",
        fields: ["id", "status", "data", "payment_collection_id", "provider_id"],
      })

      const matchingSession = (paymentSessions || []).find((s: any) => {
        const sessionRef =
          s.data?.referenceNumber || s.data?.reference_number || s.data?.id
        return (
          String(s.provider_id || "").toLowerCase().includes("pesepay") &&
          (sessionRef === referenceNumber || s.id === referenceNumber)
        )
      })

      if (matchingSession && isSuccessful) {
        await paymentModule.authorizePaymentSession(matchingSession.id, {
          ...(matchingSession.data || {}),
        })

        const { data: authorizedSessions } = await query.graph({
          entity: "payment_session",
          fields: ["id", "status"],
          filters: { id: matchingSession.id },
        })
        if (String(authorizedSessions?.[0]?.status || "").toLowerCase() !== "authorized") {
          return new StepResponse<ProcessPesepayWebhookOutput>({
            processed: false,
            sessionId: matchingSession.id,
            referenceNumber,
            note: "Payment has not been confirmed by Pesepay",
          })
        }

        logger.info(
          `Pesepay payment session ${matchingSession.id} was verified with the provider`
        )

        // Cart identity comes from the persisted payment session, never callback metadata.
        let cartId = String(
          matchingSession.data?.cart_id ||
          matchingSession.data?.cartId ||
          ""
        )

        if (!cartId && matchingSession.payment_collection_id) {
          const { data: carts } = await query.graph({
            entity: "cart",
            fields: ["id", "completed_at"],
            filters: {
              payment_collection: {
                id: matchingSession.payment_collection_id,
              },
            },
          })
          if (carts?.[0]?.id) {
            cartId = carts[0].id
          }
        }

        if (!cartId) {
          return new StepResponse<ProcessPesepayWebhookOutput>({
            processed: false,
            sessionId: matchingSession.id,
            referenceNumber,
            note: "Could not resolve the cart for the verified payment",
          })
        }

        let orderId: string | undefined

        try {
          logger.info(`Completing cart ${cartId} via Pesepay webhook...`)
          const { result: completeResult } = await completeCartWorkflow(container).run({
            input: { id: cartId },
          })
          orderId = completeResult?.id
          logger.info(
            `Successfully completed cart ${cartId} and placed order ${orderId || ""} via Pesepay webhook`
          )
        } catch (completeErr: unknown) {
          const { data: orderCarts } = await query.graph({
            entity: "order_cart",
            fields: ["order_id"],
            filters: { cart_id: cartId },
          })
          if (orderCarts?.[0]?.order_id) {
            orderId = orderCarts[0].order_id
          } else {
            throw completeErr
          }
        }

        if (!orderId) {
          const { data: orderCarts } = await query.graph({
            entity: "order_cart",
            fields: ["order_id"],
            filters: { cart_id: cartId },
          })
          if (orderCarts?.[0]?.order_id) {
            orderId = orderCarts[0].order_id
          } else {
            return new StepResponse<ProcessPesepayWebhookOutput>({
              processed: false,
              sessionId: matchingSession.id,
              referenceNumber,
              cartId,
              note: "The verified payment was received, but the order could not be completed",
            })
          }
        }

        return new StepResponse<ProcessPesepayWebhookOutput>({
          processed: true,
          sessionId: matchingSession.id,
          referenceNumber,
          cartId,
          orderId,
        })
      }
    } catch (err: unknown) {
      logger.warn(
        `Could not verify or complete Pesepay payment: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      )
      return new StepResponse<ProcessPesepayWebhookOutput>({
        processed: false,
        referenceNumber,
        note: "Payment verification or order completion failed",
      })
    }

    return new StepResponse<ProcessPesepayWebhookOutput>({
      processed: false,
      referenceNumber,
      note: "No matching Pesepay payment session was found",
    })
  }
)

export const processPesepayWebhookWorkflow = createWorkflow(
  "process-pesepay-webhook",
  (input: ProcessPesepayWebhookInput) => {
    const result = processPesepayWebhookStep(input)
    return new WorkflowResponse(result)
  }
)
