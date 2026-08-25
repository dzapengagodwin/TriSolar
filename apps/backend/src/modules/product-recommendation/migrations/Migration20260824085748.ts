import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260824085748 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "product_recommendation" ("id" text not null, "product_id" text not null, "recommended_product_id" text not null, "type" text check ("type" in ('upsell', 'cross_sell', 'related', 'accessory', 'alternative')) not null default 'related', "priority" integer not null default 0, "position" integer not null default 0, "is_active" boolean not null default true, "start_at" timestamptz null, "end_at" timestamptz null, "source" text check ("source" in ('manual', 'rule', 'ai', 'behavioral')) not null default 'manual', "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_recommendation_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_product_rec_product_id" ON "product_recommendation" ("product_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_product_rec_recommended_product_id" ON "product_recommendation" ("recommended_product_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_product_rec_type" ON "product_recommendation" ("type") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_product_rec_is_active" ON "product_recommendation" ("is_active") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_recommendation_deleted_at" ON "product_recommendation" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "idx_product_rec_unique_pair_type" ON "product_recommendation" ("product_id", "recommended_product_id", "type") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_product_rec_lookup" ON "product_recommendation" ("product_id", "type", "is_active") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "product_recommendation" cascade;`);
  }

}
