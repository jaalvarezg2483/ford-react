import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_settings_social_network" AS ENUM('facebook', 'youtube', 'instagram', 'tiktok');
  CREATE TABLE "family_types_promo_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_footer_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL,
  	"highlight" boolean
  );
  
  CREATE TABLE "site_settings_footer_bottom_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL,
  	"new_tab" boolean
  );
  
  CREATE TABLE "site_settings_social" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"network" "enum_site_settings_social_network" NOT NULL,
  	"href" varchar NOT NULL,
  	"in_menu" boolean DEFAULT true
  );
  
  CREATE TABLE "home_page_service_rows_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"href" varchar NOT NULL,
  	"image_id" integer,
  	"image_path" varchar,
  	"alt" varchar
  );
  
  CREATE TABLE "home_page_service_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "home_page_tech_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"image_id" integer,
  	"image_path" varchar
  );
  
  CREATE TABLE "home_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"hero_slider" varchar DEFAULT 'BANNER_HOME',
  	"vehicles_title" varchar DEFAULT 'Vehículos Nuevos',
  	"services_title" varchar DEFAULT 'Servicios',
  	"services_text" varchar,
  	"tech_kicker" varchar DEFAULT 'Tecnología',
  	"tech_title" varchar DEFAULT 'FORD',
  	"tech_text" varchar,
  	"financing_kicker" varchar,
  	"financing_title" varchar,
  	"financing_title_mobile" varchar,
  	"financing_text" varchar,
  	"financing_link_label" varchar,
  	"financing_href" varchar,
  	"compare_kicker" varchar,
  	"compare_title" varchar,
  	"compare_title_mobile" varchar,
  	"compare_text" varchar,
  	"compare_link_label" varchar,
  	"compare_href" varchar,
  	"contact_kicker" varchar,
  	"contact_title" varchar,
  	"contact_title_mobile" varchar,
  	"contact_text" varchar,
  	"contact_link_label" varchar,
  	"contact_href" varchar,
  	"news_size" numeric DEFAULT 6,
  	"app_title" varchar,
  	"app_text" varchar,
  	"app_button_label" varchar,
  	"app_register_url" varchar,
  	"app_app_store_url" varchar,
  	"app_play_store_url" varchar,
  	"app_logo" varchar,
  	"app_phone_mobile" varchar,
  	"app_phone_desktop" varchar,
  	"sizmek_rb" varchar,
  	"sizmek_ca" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "family_types" ADD COLUMN "promo_logo" varchar;
  ALTER TABLE "family_types" ADD COLUMN "promo_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "footer_ethics_text" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "footer_ethics_url" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "footer_ethics_button" varchar DEFAULT 'Info Aquí';
  ALTER TABLE "site_settings" ADD COLUMN "footer_copyright" varchar DEFAULT '©{year} All rights reserved';
  ALTER TABLE "site_settings" ADD COLUMN "whatsapp_phone" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "whatsapp_label" varchar DEFAULT 'WhatsApp';
  ALTER TABLE "site_settings" ADD COLUMN "whatsapp_message" varchar DEFAULT 'Quiero información de Ford';
  ALTER TABLE "site_settings" ADD COLUMN "gtm_id" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "site24x7_key" varchar;
  ALTER TABLE "family_types_promo_paragraphs" ADD CONSTRAINT "family_types_promo_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."family_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_footer_links" ADD CONSTRAINT "site_settings_footer_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_footer_bottom_links" ADD CONSTRAINT "site_settings_footer_bottom_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_social" ADD CONSTRAINT "site_settings_social_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_service_rows_cards" ADD CONSTRAINT "home_page_service_rows_cards_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_service_rows_cards" ADD CONSTRAINT "home_page_service_rows_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_service_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_service_rows" ADD CONSTRAINT "home_page_service_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_tech_items" ADD CONSTRAINT "home_page_tech_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_tech_items" ADD CONSTRAINT "home_page_tech_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "family_types_promo_paragraphs_order_idx" ON "family_types_promo_paragraphs" USING btree ("_order");
  CREATE INDEX "family_types_promo_paragraphs_parent_id_idx" ON "family_types_promo_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "site_settings_footer_links_order_idx" ON "site_settings_footer_links" USING btree ("_order");
  CREATE INDEX "site_settings_footer_links_parent_id_idx" ON "site_settings_footer_links" USING btree ("_parent_id");
  CREATE INDEX "site_settings_footer_bottom_links_order_idx" ON "site_settings_footer_bottom_links" USING btree ("_order");
  CREATE INDEX "site_settings_footer_bottom_links_parent_id_idx" ON "site_settings_footer_bottom_links" USING btree ("_parent_id");
  CREATE INDEX "site_settings_social_order_idx" ON "site_settings_social" USING btree ("_order");
  CREATE INDEX "site_settings_social_parent_id_idx" ON "site_settings_social" USING btree ("_parent_id");
  CREATE INDEX "home_page_service_rows_cards_order_idx" ON "home_page_service_rows_cards" USING btree ("_order");
  CREATE INDEX "home_page_service_rows_cards_parent_id_idx" ON "home_page_service_rows_cards" USING btree ("_parent_id");
  CREATE INDEX "home_page_service_rows_cards_image_idx" ON "home_page_service_rows_cards" USING btree ("image_id");
  CREATE INDEX "home_page_service_rows_order_idx" ON "home_page_service_rows" USING btree ("_order");
  CREATE INDEX "home_page_service_rows_parent_id_idx" ON "home_page_service_rows" USING btree ("_parent_id");
  CREATE INDEX "home_page_tech_items_order_idx" ON "home_page_tech_items" USING btree ("_order");
  CREATE INDEX "home_page_tech_items_parent_id_idx" ON "home_page_tech_items" USING btree ("_parent_id");
  CREATE INDEX "home_page_tech_items_image_idx" ON "home_page_tech_items" USING btree ("image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "family_types_promo_paragraphs" CASCADE;
  DROP TABLE "site_settings_footer_links" CASCADE;
  DROP TABLE "site_settings_footer_bottom_links" CASCADE;
  DROP TABLE "site_settings_social" CASCADE;
  DROP TABLE "home_page_service_rows_cards" CASCADE;
  DROP TABLE "home_page_service_rows" CASCADE;
  DROP TABLE "home_page_tech_items" CASCADE;
  DROP TABLE "home_page" CASCADE;
  ALTER TABLE "family_types" DROP COLUMN "promo_logo";
  ALTER TABLE "family_types" DROP COLUMN "promo_title";
  ALTER TABLE "site_settings" DROP COLUMN "footer_ethics_text";
  ALTER TABLE "site_settings" DROP COLUMN "footer_ethics_url";
  ALTER TABLE "site_settings" DROP COLUMN "footer_ethics_button";
  ALTER TABLE "site_settings" DROP COLUMN "footer_copyright";
  ALTER TABLE "site_settings" DROP COLUMN "whatsapp_phone";
  ALTER TABLE "site_settings" DROP COLUMN "whatsapp_label";
  ALTER TABLE "site_settings" DROP COLUMN "whatsapp_message";
  ALTER TABLE "site_settings" DROP COLUMN "gtm_id";
  ALTER TABLE "site_settings" DROP COLUMN "site24x7_key";
  DROP TYPE "public"."enum_site_settings_social_network";`)
}
