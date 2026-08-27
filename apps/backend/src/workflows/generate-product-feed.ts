import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { ProductFeedConfig } from "./steps/types"
import { getProductFeedItemsStep } from "./steps/get-product-feed-items"
import { buildProductFeedXmlStep } from "./steps/build-product-feed-xml"

export const generateProductFeedWorkflow = createWorkflow(
  "generate-product-feed",
  (input: ProductFeedConfig) => {
    const feedData = getProductFeedItemsStep(input)

    const xmlResult = buildProductFeedXmlStep({
      items: feedData.items,
      config: input,
    })

    return new WorkflowResponse({
      xml: xmlResult.xml,
      itemCount: xmlResult.itemCount,
      diagnostics: feedData.diagnostics,
    })
  }
)
