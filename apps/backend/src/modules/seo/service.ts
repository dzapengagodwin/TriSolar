import { MedusaService, MedusaError } from "@medusajs/framework/utils"
import SeoMetadata from "./models/seo-metadata"
import {
  ProductSeoAnalysisInput,
  SeoAnalysisResult,
  SeoMetadataDTO,
  UpsertSeoMetadataInput,
} from "./types"
import { analyzeProductSeo } from "./utils/analyzer"

class SeoModuleService extends MedusaService({
  SeoMetadata,
}) {
  /**
   * Safe getter for list method handling irregular pluralization ('metadata' vs 'metadatas')
   */
  private async listRecords(filters: Record<string, unknown>, config?: Record<string, unknown>): Promise<any[]> {
    const fn = (this as any).listSeoMetadata || (this as any).listSeoMetadatas
    if (typeof fn === "function") {
      return fn.call(this, filters, config)
    }
    return []
  }

  /**
   * Safe getter for create method
   */
  private async createRecords(data: Record<string, unknown> | Record<string, unknown>[]): Promise<any> {
    const fn = (this as any).createSeoMetadata || (this as any).createSeoMetadatas
    if (typeof fn === "function") {
      return fn.call(this, data)
    }
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "Unable to resolve create method on SeoModuleService"
    )
  }

  /**
   * Safe getter for update method
   */
  private async updateRecords(data: Record<string, unknown>[]): Promise<any[]> {
    const fn = (this as any).updateSeoMetadata || (this as any).updateSeoMetadatas
    if (typeof fn === "function") {
      return fn.call(this, data)
    }
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "Unable to resolve update method on SeoModuleService"
    )
  }

  /**
   * Safe getter for delete method
   */
  private async deleteRecords(ids: string[]): Promise<void> {
    const fn = (this as any).deleteSeoMetadata || (this as any).deleteSeoMetadatas
    if (typeof fn === "function") {
      return fn.call(this, ids)
    }
  }

  /**
   * Retrieve SEO metadata record for a given entity (product, category, brand, etc.)
   */
  async retrieveForEntity(
    entityType: string,
    entityId: string
  ): Promise<SeoMetadataDTO | null> {
    if (!entityType || !entityId) return null

    const records = await this.listRecords({
      entity_type: entityType,
      entity_id: entityId,
    })

    return (records?.[0] as unknown as SeoMetadataDTO) || null
  }

  /**
   * Upsert SEO metadata for a given entity safely without creating duplicate records
   */
  async upsertForEntity(
    entityType: string,
    entityId: string,
    data: UpsertSeoMetadataInput
  ): Promise<SeoMetadataDTO> {
    const existing = await this.retrieveForEntity(entityType, entityId)

    if (existing) {
      const updated = await this.updateRecords([
        {
          id: existing.id,
          meta_title: data.meta_title !== undefined ? data.meta_title : existing.meta_title,
          meta_description:
            data.meta_description !== undefined
              ? data.meta_description
              : existing.meta_description,
          focus_keyphrase:
            data.focus_keyphrase !== undefined
              ? data.focus_keyphrase
              : existing.focus_keyphrase,
          canonical_url:
            data.canonical_url !== undefined
              ? data.canonical_url
              : existing.canonical_url,
          og_title: data.og_title !== undefined ? data.og_title : existing.og_title,
          og_description:
            data.og_description !== undefined
              ? data.og_description
              : existing.og_description,
          og_image: data.og_image !== undefined ? data.og_image : existing.og_image,
          robots_index:
            data.robots_index !== undefined
              ? data.robots_index
              : existing.robots_index,
          robots_follow:
            data.robots_follow !== undefined
              ? data.robots_follow
              : existing.robots_follow,
          metadata:
            data.metadata !== undefined ? data.metadata : existing.metadata,
        },
      ])
      const result = Array.isArray(updated) ? updated[0] : updated
      return result as unknown as SeoMetadataDTO
    }

    const created = await this.createRecords({
      entity_type: entityType,
      entity_id: entityId,
      meta_title: data.meta_title || null,
      meta_description: data.meta_description || null,
      focus_keyphrase: data.focus_keyphrase || null,
      canonical_url: data.canonical_url || null,
      og_title: data.og_title || null,
      og_description: data.og_description || null,
      og_image: data.og_image || null,
      robots_index: data.robots_index !== undefined ? data.robots_index : true,
      robots_follow: data.robots_follow !== undefined ? data.robots_follow : true,
      metadata: data.metadata || null,
    })

    const result = Array.isArray(created) ? created[0] : created
    return result as unknown as SeoMetadataDTO
  }

  /**
   * Delete SEO metadata for a given entity
   */
  async deleteForEntity(entityType: string, entityId: string): Promise<boolean> {
    const existing = await this.retrieveForEntity(entityType, entityId)
    if (!existing) return false

    await this.deleteRecords([existing.id])
    return true
  }

  /**
   * Run SEO analysis against an entity and its SEO metadata
   */
  async analyze(input: ProductSeoAnalysisInput): Promise<SeoAnalysisResult> {
    return analyzeProductSeo(input)
  }

  /**
   * Get sensible default metadata fallback values for an entity (pure calculation)
   */
  async getDefaults(
    entityType: string,
    entity: any,
    options: { storefrontUrl?: string; countryCode?: string } = {}
  ): Promise<Partial<UpsertSeoMetadataInput>> {
    const storefrontUrl = (options.storefrontUrl || "https://laptopzone.co.zw").replace(
      /\/+$/,
      ""
    )

    if (entityType === "product") {
      const title = entity.title ? `${entity.title} | Laptopzone` : "Laptopzone"
      const rawDesc = entity.description || entity.subtitle || ""
      const cleanDesc = rawDesc
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
      const desc =
        cleanDesc.length > 155 ? `${cleanDesc.slice(0, 152)}...` : cleanDesc

      const canonicalUrl = entity.handle
        ? `${storefrontUrl}/product/${entity.handle}`
        : null

      const image = entity.thumbnail || entity.images?.[0]?.url || null

      return {
        meta_title: title,
        meta_description: desc,
        focus_keyphrase: entity.title || null,
        canonical_url: canonicalUrl,
        og_title: title,
        og_description: desc,
        og_image: image,
        robots_index: true,
        robots_follow: true,
      }
    }

    if (entityType === "category") {
      const name = entity.name || "Category"
      const title = `${name} | Laptopzone`
      const rawDesc = entity.description || ""
      const cleanDesc = rawDesc
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
      const desc =
        cleanDesc ||
        `Shop warranty-backed ${name.toLowerCase()} and computer hardware at Laptopzone Zimbabwe. Fast nationwide delivery and authentic products.`
      const canonicalUrl = null

      return {
        meta_title: title,
        meta_description: desc,
        focus_keyphrase: name,
        canonical_url: canonicalUrl,
        og_title: title,
        og_description: desc,
        og_image: null,
        robots_index: true,
        robots_follow: true,
      }
    }

    return {
      meta_title: entity.name || entity.title || "Laptopzone",
      meta_description: entity.description || null,
      robots_index: true,
      robots_follow: true,
    }
  }
}

export default SeoModuleService
