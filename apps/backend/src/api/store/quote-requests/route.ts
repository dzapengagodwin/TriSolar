import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { QUOTE_REQUEST_MODULE } from "../../../modules/quote-request"

export const AUTHENTICATE = false

type QuoteRequestBody = {
  contact_name?: string
  organization?: string
  email?: string
  phone?: string
  project_type?: string
  location?: string
  budget?: string
  requirements?: string
  contact_method?: string
}

const clean = (value: unknown, maxLength: number): string =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : ""

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const body = (req.body || {}) as QuoteRequestBody

  const contactName = clean(body.contact_name, 120)
  const organization = clean(body.organization, 160)
  const email = clean(body.email, 254).toLowerCase()
  const phone = clean(body.phone, 40)
  const projectType = clean(body.project_type, 120)
  const location = clean(body.location, 160)
  const budget = clean(body.budget, 80)
  const requirements = clean(body.requirements, 5000)
  const contactMethod = clean(body.contact_method, 40) || "Email"

  if (
    !contactName ||
    !organization ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !phone ||
    !projectType ||
    !location ||
    !requirements
  ) {
    return res.status(400).json({
      error: "Please complete all required fields with a valid email address.",
    })
  }

  try {
    const quoteRequestService = req.scope.resolve(QUOTE_REQUEST_MODULE)
    const quoteRequest = await quoteRequestService.createQuoteRequests({
      contact_name: contactName,
      organization,
      email,
      phone,
      project_type: projectType,
      location,
      budget: budget || null,
      requirements,
      contact_method: contactMethod,
    })

    return res.status(201).json({
      quote_request: {
        id: quoteRequest.id,
        status: quoteRequest.status,
      },
    })
  } catch (error) {
    logger.error(
      `[TRITECH Quote Request] Failed to save request: ${error instanceof Error ? error.message : String(error)}`
    )
    return res.status(500).json({
      error: "We could not save your quotation request. Please try again.",
    })
  }
}
