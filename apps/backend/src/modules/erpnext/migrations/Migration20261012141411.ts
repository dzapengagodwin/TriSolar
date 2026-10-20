import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261012141411 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "erpnext_settings" ("id" text not null, "default_company" text null, "default_warehouse" text null, "warehouse_mappings" jsonb null, "last_audit_at" timestamptz null, "last_audit_summary" jsonb null, "last_sync_at" timestamptz null, "last_sync_summary" jsonb null, "is_sync_running" boolean not null default false, "sync_lock_run_id" text null, "sync_lock_acquired_at" timestamptz null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "erpnext_settings_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_erpnext_settings_deleted_at" ON "erpnext_settings" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "erpnext_sync_item_log" ("id" text not null, "sync_log_id" text not null, "sku" text null, "erp_item_code" text null, "medusa_variant_id" text null, "medusa_product_id" text null, "location_id" text null, "erp_warehouse" text null, "status" text not null, "previous_quantity" integer null, "new_quantity" integer null, "error_message" text null, "details" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "erpnext_sync_item_log_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_erpnext_sync_item_log_sync_log_id" ON "erpnext_sync_item_log" ("sync_log_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_erpnext_sync_item_log_deleted_at" ON "erpnext_sync_item_log" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "erpnext_sync_log" ("id" text not null, "run_type" text not null default 'sync', "status" text not null default 'pending', "started_at" timestamptz not null, "completed_at" timestamptz null, "triggered_by" text null, "summary" jsonb null, "error_message" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "erpnext_sync_log_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_erpnext_sync_log_deleted_at" ON "erpnext_sync_log" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "erpnext_settings" cascade;`);

    this.addSql(`drop table if exists "erpnext_sync_item_log" cascade;`);

    this.addSql(`drop table if exists "erpnext_sync_log" cascade;`);
  }

}
