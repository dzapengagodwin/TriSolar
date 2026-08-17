import { ContainerRegistrationKeys, Modules, MedusaError } from "@medusajs/framework/utils"
import { BRAND_MODULE } from "../../brand"
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
}
