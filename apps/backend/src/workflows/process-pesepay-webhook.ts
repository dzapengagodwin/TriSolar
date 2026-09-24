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
  status: string
  isSuccessful: boolean
  webhookData: Record<string, unknown>
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

    const { referenceNumber, status, isSuccessful, webhookData } = input

    if (!referenceNumber) {
      return new StepResponse<ProcessPesepayWebhookOutput>({
        processed: false,
        note: "No reference number",
      })
    }

    try {
      const { data: paymentSessions } = await query.graph({
        entity: "payment_session",
        fields: ["id", "status", "data", "payment_collection_id"],
      })

      const matchingSession = (paymentSessions || []).find((s: any) => {
        const sessionRef =
          s.data?.referenceNumber || s.data?.reference_number || s.data?.id
        return sessionRef === referenceNumber || s.id === referenceNumber
      })

      if (matchingSession && isSuccessful) {
        await paymentModule.authorizePaymentSession(matchingSession.id, {
          ...matchingSession.data,
          ...webhookData,
          webhookConfirmed: true,
          transactionStatus: status,
        })
        logger.info(
          `Successfully authorized payment session ${matchingSession.id} via webhook workflow`
        )

        // Resolve Cart ID from session data, webhook metadata, or payment_collection link
        let cartId = String(
          matchingSession.data?.cart_id ||
          matchingSession.data?.cartId ||
          (webhookData?.paymentMetadata as any)?.cart_id ||
          (webhookData?.payment_metadata as any)?.cart_id ||
          ""
        )

        if (!cartId && matchingSession.payment_collection_id) {
          try {
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
          } catch (findCartErr: any) {
            logger.warn(`Could not lookup cart from payment_collection: ${findCartErr.message}`)
          }
        }

        let orderId: string | undefined

        if (cartId) {
          try {
            logger.info(`Completing cart ${cartId} via Pesepay webhook...`)
            const { result: completeResult } = await completeCartWorkflow(container).run({
              input: { id: cartId },
            })
            orderId = completeResult?.id
            logger.info(
              `Successfully completed cart ${cartId} and placed order ${orderId || ""} via Pesepay webhook`
            )
          } catch (completeErr: any) {
            logger.info(`Cart ${cartId} completion note: ${completeErr.message}`)

            // Check if order was already created for this cart
            try {
              const { data: orderCarts } = await query.graph({
                entity: "order_cart",
                fields: ["order_id"],
                filters: { cart_id: cartId },
              })
              if (orderCarts?.[0]?.order_id) {
                orderId = orderCarts[0].order_id
              }
            } catch {
              // ignore
            }
          }
        } else {
          logger.warn(
            `Could not resolve cart ID for session ${matchingSession.id} during Pesepay webhook processing`
          )
        }

        return new StepResponse<ProcessPesepayWebhookOutput>({
          processed: true,
          sessionId: matchingSession.id,
          referenceNumber,
          cartId,
          orderId,
        })
      }
    } catch (err: any) {
      logger.warn(
        `Could not authorize payment session in workflow: ${err.message}`
      )
    }

    return new StepResponse<ProcessPesepayWebhookOutput>({
      processed: false,
      referenceNumber,
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
