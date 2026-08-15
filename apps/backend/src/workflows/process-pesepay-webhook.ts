import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

type ProcessPesepayWebhookInput = {
  referenceNumber: string
  status: string
  isSuccessful: boolean
  webhookData: Record<string, unknown>
}

export const processPesepayWebhookStep = createStep(
  "process-pesepay-webhook",
  async (input: ProcessPesepayWebhookInput, { container }) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const paymentModule = container.resolve(Modules.PAYMENT)

    const { referenceNumber, status, isSuccessful, webhookData } = input

    if (!referenceNumber) {
      return new StepResponse({ processed: false, note: "No reference number" })
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
        return new StepResponse({
          processed: true,
          sessionId: matchingSession.id,
        })
      }
    } catch (err: any) {
      logger.warn(`Could not authorize payment session in workflow: ${err.message}`)
    }

    return new StepResponse({ processed: false, referenceNumber })
  }
)

export const processPesepayWebhookWorkflow = createWorkflow(
  "process-pesepay-webhook",
  (input: ProcessPesepayWebhookInput) => {
    const result = processPesepayWebhookStep(input)
    return new WorkflowResponse(result)
  }
)
