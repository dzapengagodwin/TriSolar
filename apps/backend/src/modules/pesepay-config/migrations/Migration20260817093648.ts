import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260817093648 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "pesepay_config" ("id" text not null, "integration_key" text null, "encryption_key" text null, "environment" text not null default 'sandbox', "callback_url" text null, "webhook_secret" text null, "is_active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pesepay_config_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pesepay_config_deleted_at" ON "pesepay_config" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "pesepay_config" cascade;`);
  }

}
