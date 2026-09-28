import { ContainerRegistrationKeys, Modules, MedusaError } from "@medusajs/framework/utils"
import { BRAND_MODULE } from "../../brand"
import { PRODUCT_RECOMMENDATION_MODULE } from "../../product-recommendation"
import { deleteProductsWorkflow } from "@medusajs/medusa/core-flows"

export interface BulkActionHandler {
  validate(payload: any): boolean | string
  executeItem(
    id: string,
    payload: any,
    container: any
  ): Promise<{
    success: boolean
    previousValue?: any
    newValue?: any
    error?: string
  }>
}

export const BULK_ACTIONS: Record<string, BulkActionHandler> = {
  "product:update_status": {
    validate(payload) {
      if (!payload || typeof payload.status !== "string") {
        return "Payload must contain a status string"
      }
      const allowed = ["published", "draft", "proposed", "rejected"]
      if (!allowed.includes(payload.status)) {
        return `Status must be one of: ${allowed.join(", ")}`
      }
      return true
    },
    async executeItem(id, payload, container) {
      const productService = container.resolve(Modules.PRODUCT)
      const query = container.resolve(ContainerRegistrationKeys.QUERY)

      const { data: products } = await query.graph({
        entity: "product",
        fields: ["id", "status"],
        filters: { id },
      })

      const product = products?.[0]
      if (!product) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `Product with ID ${id} not found`
        )
      }

      const previousStatus = product.status
      if (previousStatus === payload.status) {
        return {
          success: true,
          previousValue: { status: previousStatus },
          newValue: { status: payload.status },
        }
      }

      await productService.updateProducts([{ id, status: payload.status }])

      return {
        success: true,
        previousValue: { status: previousStatus },
        newValue: { status: payload.status },
      }
    },
  },

  "product:update_brand": {
    validate(payload) {
      // payload can contain a string brand_id or null to unlink
      if (payload && payload.brand_id !== undefined && payload.brand_id !== null && typeof payload.brand_id !== "string") {
        return "brand_id must be a string or null"
      }
      return true
    },
    async executeItem(id, payload, container) {
      const link = container.resolve(ContainerRegistrationKeys.LINK)
      const query = container.resolve(ContainerRegistrationKeys.QUERY)

      // Fetch current brand linked to this product
      let prevBrandId: string | null = null
      try {
        const { data: products } = await query.graph({
          entity: "product",
          fields: ["id", "brand.id"],
          filters: { id },
        })
        prevBrandId = (products?.[0] as any)?.brand?.id || null
      } catch {
        // ignore
      }

      const targetBrandId = payload.brand_id || null

      if (prevBrandId === targetBrandId) {
        return {
          success: true,
          previousValue: { brand_id: prevBrandId },
          newValue: { brand_id: targetBrandId },
        }
      }

      // Dismiss existing link if it exists
      if (prevBrandId) {
        await link.dismiss([
          {
            [Modules.PRODUCT]: {
              product_id: id,
            },
            [BRAND_MODULE]: {
              brand_id: prevBrandId,
            },
          },
        ])
      }

      // Create new link if targetBrandId is specified
      if (targetBrandId && targetBrandId.trim() !== "") {
        await link.create([
          {
            [Modules.PRODUCT]: {
              product_id: id,
            },
            [BRAND_MODULE]: {
              brand_id: targetBrandId.trim(),
            },
          },
        ])
      }

      return {
        success: true,
        previousValue: { brand_id: prevBrandId },
        newValue: { brand_id: targetBrandId },
      }
    },
  },

  "product:update_category": {
    validate(payload) {
      if (!payload || !Array.isArray(payload.category_ids)) {
        return "Payload must contain a category_ids array"
      }
      return true
    },
    async executeItem(id, payload, container) {
      const productService = container.resolve(Modules.PRODUCT)
      const query = container.resolve(ContainerRegistrationKeys.QUERY)

      const { data: products } = await query.graph({
        entity: "product",
        fields: ["id", "categories.id"],
        filters: { id },
      })

      const product = products?.[0]
      if (!product) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `Product with ID ${id} not found`
        )
      }

      const prevCategoryIds = (product.categories || []).map((c: any) => c.id)

      await productService.updateProducts([
        {
          id,
          categories: payload.category_ids.map((cid: string) => ({ id: cid })),
        },
      ])

      return {
        success: true,
        previousValue: { category_ids: prevCategoryIds },
        newValue: { category_ids: payload.category_ids },
      }
    },
  },

  "product:update_collection": {
    validate(payload) {
      if (payload && payload.collection_id !== undefined && payload.collection_id !== null && typeof payload.collection_id !== "string") {
        return "collection_id must be a string or null"
      }
      return true
    },
    async executeItem(id, payload, container) {
      const productService = container.resolve(Modules.PRODUCT)
      const query = container.resolve(ContainerRegistrationKeys.QUERY)

      const { data: products } = await query.graph({
        entity: "product",
        fields: ["id", "collection_id"],
        filters: { id },
      })

      const product = products?.[0]
      if (!product) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `Product with ID ${id} not found`
        )
      }

      const prevCollectionId = product.collection_id || null
      const targetCollectionId = payload.collection_id || null

      if (prevCollectionId === targetCollectionId) {
        return {
          success: true,
          previousValue: { collection_id: prevCollectionId },
          newValue: { collection_id: targetCollectionId },
        }
      }

      await productService.updateProducts([
        {
          id,
          collection_id: targetCollectionId,
        },
      ])

      return {
        success: true,
        previousValue: { collection_id: prevCollectionId },
        newValue: { collection_id: targetCollectionId },
      }
    },
  },

  "product:update_metadata": {
    validate(payload) {
      if (!payload || typeof payload.metadata !== "object" || payload.metadata === null) {
        return "Payload must contain a metadata object"
      }
      return true
    },
    async executeItem(id, payload, container) {
      const productService = container.resolve(Modules.PRODUCT)
      const query = container.resolve(ContainerRegistrationKeys.QUERY)

      const { data: products } = await query.graph({
        entity: "product",
        fields: ["id", "metadata"],
        filters: { id },
      })

      const product = products?.[0]
      if (!product) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `Product with ID ${id} not found`
        )
      }

      const prevMetadata = product.metadata || {}
      const updatedMetadata = {
        ...prevMetadata,
        ...payload.metadata,
      }

      await productService.updateProducts([
        {
          id,
          metadata: updatedMetadata,
        },
      ])

      return {
        success: true,
        previousValue: prevMetadata,
        newValue: updatedMetadata,
      }
    },
  },

  "product:delete": {
    validate(_payload) {
      return true
    },
    async executeItem(id, _payload, container) {
      const query = container.resolve(ContainerRegistrationKeys.QUERY)

      const { data: products } = await query.graph({
        entity: "product",
        fields: ["id"],
        filters: { id },
      })

      if (!products || products.length === 0) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `Product with ID ${id} not found`
        )
      }

      await deleteProductsWorkflow(container).run({
        input: {
          ids: [id],
        },
      })

      return {
        success: true,
        previousValue: { exists: true },
        newValue: { exists: false },
      }
    },
  },

  "product:assign_recommendations": {
    validate(payload) {
      if (
        !payload ||
        !Array.isArray(payload.recommended_product_ids) ||
        payload.recommended_product_ids.length === 0
      ) {
        return "Payload must contain a non-empty recommended_product_ids array"
      }
      return true
    },
    async executeItem(id, payload, container) {
      const recService = container.resolve(PRODUCT_RECOMMENDATION_MODULE)
      const targetType = payload.type || "related"
      const targetProductIds: string[] = payload.recommended_product_ids.filter(
        (targetId: string) => targetId !== id
      )

      if (targetProductIds.length === 0) {
        return {
          success: true,
          previousValue: {},
          newValue: {},
        }
      }

      if (payload.replace_existing) {
        const existing = await recService.listProductRecommendations({
          product_id: id,
          type: targetType,
        })
        if (existing.length > 0) {
          await recService.deleteProductRecommendations(
            existing.map((e: any) => e.id)
          )
        }
      }

      const items = targetProductIds.map((recId, idx) => ({
        recommended_product_id: recId,
        type: targetType,
        position: idx,
        priority: payload.priority || 0,
        is_active: payload.is_active !== undefined ? payload.is_active : true,
        source: "manual" as const,
      }))

      const results = await recService.batchAssignRecommendations(id, items)

      return {
        success: true,
        previousValue: { count: payload.replace_existing ? 0 : undefined },
        newValue: { assigned_count: results.length, type: targetType },
      }
    },
  },

  "product:clear_recommendations": {
    validate(_payload) {
      return true
    },
    async executeItem(id, payload, container) {
      const recService = container.resolve(PRODUCT_RECOMMENDATION_MODULE)
      const filter: any = { product_id: id }
      if (payload?.type) {
        filter.type = payload.type
      }

      const existing = await recService.listProductRecommendations(filter)
      if (existing.length > 0) {
        await recService.deleteProductRecommendations(
          existing.map((e: any) => e.id)
        )
      }

      return {
        success: true,
        previousValue: { count: existing.length },
        newValue: { cleared_count: existing.length },
      }
    },
  },

  "product:update_price": {
    validate(payload) {
      if (!payload || typeof payload !== "object") {
        return "Payload must be an object"
      }
      if (!payload.regular_price_mode && !payload.sale_price_mode) {
        return "Must specify at least regular_price_mode or sale_price_mode"
      }
      const allowedRegular = ["change_to", "increase_amount", "decrease_amount", "increase_percent", "decrease_percent"]
      if (payload.regular_price_mode && !allowedRegular.includes(payload.regular_price_mode)) {
        return `regular_price_mode must be one of: ${allowedRegular.join(", ")}`
      }
      const allowedSale = ["change_to", "increase_amount", "decrease_amount", "increase_percent", "decrease_percent", "regular_decrease_amount", "regular_decrease_percent", "clear"]
      if (payload.sale_price_mode && !allowedSale.includes(payload.sale_price_mode)) {
        return `sale_price_mode must be one of: ${allowedSale.join(", ")}`
      }
      return true
    },
    async executeItem(id, payload, container) {
      const query = container.resolve(ContainerRegistrationKeys.QUERY)
      const pricingModule = container.resolve(Modules.PRICING)
      const productService = container.resolve(Modules.PRODUCT)

      const { data: products } = await query.graph({
        entity: "product",
        fields: [
          "id",
          "metadata",
          "variants.id",
          "variants.metadata",
          "variants.prices.id",
          "variants.prices.amount",
          "variants.prices.currency_code",
        ],
        filters: { id },
      })

      const product = products?.[0] as any
      if (!product) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `Product with ID ${id} not found`
        )
      }

      const previousPrices: any[] = []
      const updatedPrices: any[] = []
      let updatedWooRegular: number | null = null

      for (const variant of product.variants || []) {
        for (const price of variant.prices || []) {
          previousPrices.push({ id: price.id, amount: price.amount, currency_code: price.currency_code })
          const currentAmount = price.amount
          let newAmount = currentAmount

          if (payload.regular_price_mode === "change_to" && typeof payload.regular_price_value === "number") {
            newAmount = Math.round(payload.regular_price_value * 100)
          } else if (payload.regular_price_mode === "increase_amount" && typeof payload.regular_price_value === "number") {
            newAmount = currentAmount + Math.round(payload.regular_price_value * 100)
          } else if (payload.regular_price_mode === "decrease_amount" && typeof payload.regular_price_value === "number") {
            newAmount = Math.max(0, currentAmount - Math.round(payload.regular_price_value * 100))
          } else if (payload.regular_price_mode === "increase_percent" && typeof payload.regular_price_value === "number") {
            newAmount = Math.round(currentAmount * (1 + payload.regular_price_value / 100))
          } else if (payload.regular_price_mode === "decrease_percent" && typeof payload.regular_price_value === "number") {
            newAmount = Math.max(0, Math.round(currentAmount * (1 - payload.regular_price_value / 100)))
          }

          updatedPrices.push({ id: price.id, amount: newAmount })
          if (updatedWooRegular === null) {
            updatedWooRegular = Number((newAmount / 100).toFixed(2))
          }
        }
      }

      if (updatedPrices.length > 0) {
        await (pricingModule as any).updatePrices(updatedPrices)
      }

      const prevMeta = product.metadata || {}
      const newMeta: any = { ...prevMeta }

      if (updatedWooRegular !== null) {
        newMeta.woo_regular_price = String(updatedWooRegular)
      }

      if (payload.sale_price_mode === "clear") {
        newMeta.woo_sale_price = null
      } else if (payload.sale_price_mode === "change_to" && typeof payload.sale_price_value === "number") {
        newMeta.woo_sale_price = String(payload.sale_price_value)
      } else if (payload.sale_price_mode === "regular_decrease_percent" && typeof payload.sale_price_value === "number") {
        const reg = updatedWooRegular || parseFloat(String(prevMeta.woo_regular_price || 0))
        newMeta.woo_sale_price = String(Math.max(0, Number((reg * (1 - payload.sale_price_value / 100)).toFixed(2))))
      } else if (payload.sale_price_mode === "regular_decrease_amount" && typeof payload.sale_price_value === "number") {
        const reg = updatedWooRegular || parseFloat(String(prevMeta.woo_regular_price || 0))
        newMeta.woo_sale_price = String(Math.max(0, Number((reg - payload.sale_price_value).toFixed(2))))
      } else if (payload.sale_price_mode === "increase_percent" && typeof payload.sale_price_value === "number") {
        const curSale = parseFloat(String(prevMeta.woo_sale_price || 0))
        newMeta.woo_sale_price = String(Math.max(0, Number((curSale * (1 + payload.sale_price_value / 100)).toFixed(2))))
      } else if (payload.sale_price_mode === "decrease_percent" && typeof payload.sale_price_value === "number") {
        const curSale = parseFloat(String(prevMeta.woo_sale_price || 0))
        newMeta.woo_sale_price = String(Math.max(0, Number((curSale * (1 - payload.sale_price_value / 100)).toFixed(2))))
      }

      await productService.updateProducts([{ id, metadata: newMeta }])

      return {
        success: true,
        previousValue: { prices: previousPrices, metadata: prevMeta },
        newValue: { prices: updatedPrices, metadata: newMeta },
      }
    },
  },

  "product:update_stock": {
    validate(payload) {
      if (!payload || typeof payload !== "object") {
        return "Payload must be an object"
      }
      if (!payload.stock_status && payload.manage_stock === undefined && !payload.stock_quantity_mode) {
        return "Must specify stock_status, manage_stock, or stock_quantity_mode"
      }
      const allowedStatus = ["instock", "outofstock", "onbackorder"]
      if (payload.stock_status && !allowedStatus.includes(payload.stock_status)) {
        return `stock_status must be one of: ${allowedStatus.join(", ")}`
      }
      const allowedQtyMode = ["change_to", "increase_amount", "decrease_amount"]
      if (payload.stock_quantity_mode && !allowedQtyMode.includes(payload.stock_quantity_mode)) {
        return `stock_quantity_mode must be one of: ${allowedQtyMode.join(", ")}`
      }
      return true
    },
    async executeItem(id, payload, container) {
      const query = container.resolve(ContainerRegistrationKeys.QUERY)
      const productService = container.resolve(Modules.PRODUCT)

      const { data: products } = await query.graph({
        entity: "product",
        fields: [
          "id",
          "metadata",
          "variants.id",
          "variants.manage_inventory",
          "variants.metadata",
        ],
        filters: { id },
      })

      const product = products?.[0] as any
      if (!product) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `Product with ID ${id} not found`
        )
      }

      const prevMeta = product.metadata || {}
      const newMeta = { ...prevMeta }

      if (payload.stock_status) {
        newMeta.stock_status = payload.stock_status
      }

      let targetQty: number | undefined
      const currentQty = typeof prevMeta.stock_quantity === "number"
        ? prevMeta.stock_quantity
        : parseInt(String(prevMeta.stock_quantity || 0)) || 0

      if (payload.stock_quantity_mode === "change_to" && typeof payload.stock_quantity_value === "number") {
        targetQty = Math.max(0, payload.stock_quantity_value)
      } else if (payload.stock_quantity_mode === "increase_amount" && typeof payload.stock_quantity_value === "number") {
        targetQty = Math.max(0, currentQty + payload.stock_quantity_value)
      } else if (payload.stock_quantity_mode === "decrease_amount" && typeof payload.stock_quantity_value === "number") {
        targetQty = Math.max(0, currentQty - payload.stock_quantity_value)
      }

      if (targetQty !== undefined) {
        newMeta.stock_quantity = targetQty
        if (targetQty === 0 && !payload.stock_status) {
          newMeta.stock_status = "outofstock"
        } else if (targetQty > 0 && !payload.stock_status) {
          newMeta.stock_status = "instock"
        }
      }

      await productService.updateProducts([{ id, metadata: newMeta }])

      if (payload.manage_stock !== undefined) {
        const variantUpdates = (product.variants || []).map((v: any) => ({
          id: v.id,
          manage_inventory: Boolean(payload.manage_stock),
        }))
        if (variantUpdates.length > 0) {
          const productModuleService = container.resolve(Modules.PRODUCT)
          await (productModuleService as any).updateProductVariants(variantUpdates)
        }
      }

      return {
        success: true,
        previousValue: { stock_status: prevMeta.stock_status, stock_quantity: currentQty },
        newValue: { stock_status: newMeta.stock_status, stock_quantity: newMeta.stock_quantity },
      }
    },
  },

  "product:bulk_edit": {
    validate(payload) {
      if (!payload || typeof payload !== "object") {
        return "Payload must be an object"
      }
      return true
    },
    async executeItem(id, payload, container) {
      const results: Record<string, any> = {}

      if (payload.status) {
        const handler = BULK_ACTIONS["product:update_status"]
        results.status = await handler.executeItem(id, { status: payload.status }, container)
      }

      if (payload.brand_id !== undefined) {
        const handler = BULK_ACTIONS["product:update_brand"]
        results.brand = await handler.executeItem(id, { brand_id: payload.brand_id }, container)
      }

      if (payload.category_ids && Array.isArray(payload.category_ids)) {
        const handler = BULK_ACTIONS["product:update_category"]
        results.categories = await handler.executeItem(id, { category_ids: payload.category_ids }, container)
      }

      if (payload.collection_id !== undefined) {
        const handler = BULK_ACTIONS["product:update_collection"]
        results.collection = await handler.executeItem(id, { collection_id: payload.collection_id }, container)
      }

      if (payload.regular_price_mode || payload.sale_price_mode) {
        const handler = BULK_ACTIONS["product:update_price"]
        results.price = await handler.executeItem(id, payload, container)
      }

      if (payload.stock_status || payload.stock_quantity_mode || payload.manage_stock !== undefined) {
        const handler = BULK_ACTIONS["product:update_stock"]
        results.stock = await handler.executeItem(id, payload, container)
      }

      if (payload.weight !== undefined) {
        const productService = container.resolve(Modules.PRODUCT)
        await productService.updateProducts([{ id, weight: payload.weight ? Number(payload.weight) : null }])
        results.weight = { success: true, newValue: payload.weight }
      }

      return {
        success: true,
        newValue: results,
      }
    },
  },
}

