import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261112104823 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "quote_request" ("id" text not null, "contact_name" text not null, "organization" text not null, "email" text not null, "phone" text not null, "project_type" text not null, "location" text not null, "budget" text null, "requirements" text not null, "contact_method" text not null default 'Email', "status" text check ("status" in ('new', 'in_review', 'quoted', 'closed')) not null default 'new', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "quote_request_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_quote_request_deleted_at" ON "quote_request" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "quote_request" cascade;`);
  }

}
