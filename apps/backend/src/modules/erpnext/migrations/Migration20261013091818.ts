import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261013091818 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "erpnext_settings" add column if not exists "price_sync_enabled" boolean not null default true, add column if not exists "erpnext_price_list" text not null default 'Standard Selling', add column if not exists "sync_currency" text not null default 'usd', add column if not exists "auto_create_sales_order" boolean not null default true, add column if not exists "sales_order_print_format" text not null default 'Standard';`);

    this.addSql(`alter table if exists "erpnext_sync_item_log" add column if not exists "previous_price" integer null, add column if not exists "new_price" integer null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "erpnext_settings" drop column if exists "price_sync_enabled", drop column if exists "erpnext_price_list", drop column if exists "sync_currency", drop column if exists "auto_create_sales_order", drop column if exists "sales_order_print_format";`);

    this.addSql(`alter table if exists "erpnext_sync_item_log" drop column if exists "previous_price", drop column if exists "new_price";`);
  }

}
