import { model } from "@medusajs/framework/utils"

export const SeoMetadata = model
  .define("seo_metadata", {
    id: model.id().primaryKey(),
    entity_type: model.text().index("idx_seo_metadata_entity_type"),
    entity_id: model.text().index("idx_seo_metadata_entity_id"),
    meta_title: model.text().nullable(),
    meta_description: model.text().nullable(),
    focus_keyphrase: model.text().nullable(),
    canonical_url: model.text().nullable(),
    og_title: model.text().nullable(),
    og_description: model.text().nullable(),
    og_image: model.text().nullable(),
    robots_index: model.boolean().default(true),
    robots_follow: model.boolean().default(true),
    metadata: model.json().nullable(),
  })
  .indexes([
    {
      on: ["entity_type", "entity_id"],
      unique: true,
      name: "idx_seo_metadata_unique_entity",
    },
  ])

export default SeoMetadata
