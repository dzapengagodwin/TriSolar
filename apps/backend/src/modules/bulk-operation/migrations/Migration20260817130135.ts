import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260817130135 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "bulk_operation" ("id" text not null, "action" text not null, "entity_type" text not null default 'product', "status" text not null default 'pending', "total" integer not null default 0, "processed" integer not null default 0, "successful" integer not null default 0, "failed" integer not null default 0, "batch_size" integer not null default 50, "selection_data" jsonb not null, "payload" jsonb null, "error" text null, "created_by" text not null, "started_at" timestamptz null, "completed_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "bulk_operation_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bulk_operation_deleted_at" ON "bulk_operation" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "bulk_operation_item" ("id" text not null, "operation_id" text not null, "entity_id" text not null, "status" text not null default 'pending', "error" text null, "previous_value" jsonb null, "new_value" jsonb null, "attempts" integer not null default 0, "started_at" timestamptz null, "processed_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "bulk_operation_item_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bulk_operation_item_deleted_at" ON "bulk_operation_item" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`alter table "bulk_operation_item" add constraint "uq_bulk_operation_item_op_entity" unique ("operation_id", "entity_id");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "bulk_operation" cascade;`);

    this.addSql(`drop table if exists "bulk_operation_item" cascade;`);
  }

}
