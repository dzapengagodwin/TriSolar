import {
  createStep,
  StepResponse,
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules, MedusaError } from "@medusajs/framework/utils"
import { BRAND_MODULE } from "../modules/brand"

export type QuickEditProductInput = {
  id: string
  title?: string
  status?: "published" | "draft" | "proposed" | "rejected"
  regular_price?: number
  sale_price?: number | null
  stock_status?: "instock" | "outofstock" | "onbackorder"
  stock_quantity?: number
  brand_id?: string | null
  category_ids?: string[]
  collection_id?: string | null
}

export const quickEditProductStep = createStep(
  "quick-edit-product",
  async (input: QuickEditProductInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const productService = container.resolve(Modules.PRODUCT)
    const pricingModule = container.resolve(Modules.PRICING)
    const link = container.resolve(ContainerRegistrationKeys.LINK)

    const { id } = input

    // 1. Fetch current product
    const { data: products } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "status",
        "metadata",
        "collection_id",
        "brand.id",
        "categories.id",
        "variants.id",
        "variants.prices.id",
        "variants.prices.amount",
        "variants.prices.currency_code",
      ],
      filters: { id },
    })

    if (!products || products.length === 0) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Product with id ${id} not found`
      )
    }

    const product = products[0] as any
    const prevMeta = product.metadata || {}
    const nextMeta: Record<string, any> = { ...prevMeta }

    if (input.regular_price !== undefined) {
      nextMeta.woo_regular_price = String(input.regular_price)
    }
    if (input.sale_price !== undefined) {
      nextMeta.woo_sale_price = input.sale_price !== null ? String(input.sale_price) : null
    }
    if (input.stock_status !== undefined) {
      nextMeta.stock_status = input.stock_status
    }
    if (input.stock_quantity !== undefined) {
      nextMeta.stock_quantity = input.stock_quantity
      if (input.stock_status === undefined) {
        nextMeta.stock_status = input.stock_quantity > 0 ? "instock" : "outofstock"
      }
    }

    // 2. Update core product fields
    const productUpdatePayload: Record<string, any> = {
      id,
      metadata: nextMeta,
    }

    if (input.title && input.title.trim()) {
      productUpdatePayload.title = input.title.trim()
    }
    if (input.status) {
      productUpdatePayload.status = input.status
    }
    if (input.collection_id !== undefined) {
      productUpdatePayload.collection_id = input.collection_id || null
    }
    if (input.category_ids && Array.isArray(input.category_ids)) {
      productUpdatePayload.categories = input.category_ids.map((cid: string) => ({ id: cid }))
    }

    await productService.updateProducts([productUpdatePayload])

    // 3. Update variant prices in pricing module
    if (input.regular_price !== undefined && input.regular_price >= 0) {
      const targetCents = Math.round(input.regular_price * 100)
      const priceUpdates: { id: string; amount: number }[] = []

      for (const variant of product.variants || []) {
        for (const p of variant.prices || []) {
          priceUpdates.push({ id: p.id, amount: targetCents })
        }
      }

      if (priceUpdates.length > 0) {
        await (pricingModule as any).updatePrices(priceUpdates)
      }
    }

    // 4. Update brand link
    if (input.brand_id !== undefined) {
      const prevBrandId = product.brand?.id || null
      const targetBrandId = input.brand_id || null

      if (prevBrandId && prevBrandId !== targetBrandId) {
        await link.dismiss([
          {
            [Modules.PRODUCT]: { product_id: id },
            [BRAND_MODULE]: { brand_id: prevBrandId },
          },
        ])
      }

      if (targetBrandId && targetBrandId !== prevBrandId) {
        await link.create([
          {
            [Modules.PRODUCT]: { product_id: id },
            [BRAND_MODULE]: { brand_id: targetBrandId },
          },
        ])
      }
    }

    // 5. Query updated product
    const { data: updatedProducts } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "thumbnail",
        "status",
        "handle",
        "metadata",
        "collection.id",
        "collection.title",
        "brand.id",
        "brand.name",
        "categories.id",
        "categories.name",
        "variants.id",
        "variants.prices.id",
        "variants.prices.amount",
        "variants.prices.currency_code",
      ],
      filters: { id },
    })

    return new StepResponse({ product: updatedProducts?.[0] || null })
  }
)

export const quickEditProductWorkflow = createWorkflow(
  "quick-edit-product",
  (input: QuickEditProductInput) => {
    const result = quickEditProductStep(input)
    return new WorkflowResponse(result)
  }
)
