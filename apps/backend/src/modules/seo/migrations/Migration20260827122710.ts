import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260827122710 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "seo_metadata" ("id" text not null, "entity_type" text not null, "entity_id" text not null, "meta_title" text null, "meta_description" text null, "focus_keyphrase" text null, "canonical_url" text null, "og_title" text null, "og_description" text null, "og_image" text null, "robots_index" boolean not null default true, "robots_follow" boolean not null default true, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "seo_metadata_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_seo_metadata_entity_type" ON "seo_metadata" ("entity_type") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_seo_metadata_entity_id" ON "seo_metadata" ("entity_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_seo_metadata_deleted_at" ON "seo_metadata" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "idx_seo_metadata_unique_entity" ON "seo_metadata" ("entity_type", "entity_id") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "seo_metadata" cascade;`);
  }

}
