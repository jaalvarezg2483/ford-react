import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_status" AS ENUM('published', 'draft');
  CREATE TYPE "public"."enum_pages_template" AS ENUM('default', 'raw');
  CREATE TYPE "public"."enum_leads_email_status" AS ENUM('pending', 'sent', 'failed', 'skipped');
  CREATE TYPE "public"."enum_leads_salesforce_status" AS ENUM('n/a', 'sent', 'failed');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor', 'leads');
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"path" varchar NOT NULL,
  	"title" varchar,
  	"status" "enum_pages_status" DEFAULT 'published',
  	"template" "enum_pages_template" DEFAULT 'default',
  	"http_status" numeric DEFAULT 200,
  	"body_class" varchar,
  	"seo_h1" varchar,
  	"content" varchar,
  	"meta_html" varchar,
  	"head_styles" varchar,
  	"head_custom" varchar,
  	"active_menu" varchar,
  	"route" varchar,
  	"tail" varchar,
  	"scripts" varchar,
  	"raw_document" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sliders_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"active" boolean DEFAULT true,
  	"image_xs_id" integer,
  	"image_md_id" integer,
  	"image_lg_id" integer,
  	"video" varchar,
  	"image_alt" varchar,
  	"title" varchar,
  	"link" varchar,
  	"btn_text" varchar
  );
  
  CREATE TABLE "sliders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"path" varchar NOT NULL,
  	"category" varchar,
  	"published_at" timestamp(3) with time zone,
  	"active" boolean DEFAULT true,
  	"image_id" integer,
  	"summary" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "families_models" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"code" varchar,
  	"name" varchar,
  	"year" numeric,
  	"legacy_id" numeric,
  	"family_sales_force" varchar,
  	"category_sales_force" varchar,
  	"features" jsonb
  );
  
  CREATE TABLE "families_data_sheets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"file_id" integer,
  	"legacy_id" numeric
  );
  
  CREATE TABLE "families" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"code" varchar,
  	"legacy_id" numeric,
  	"start_price" numeric,
  	"year" numeric,
  	"ford_performance" boolean,
  	"hide_price" boolean,
  	"menu_image_id" integer,
  	"home_image_id" integer,
  	"home_color" varchar DEFAULT '#16a1cc',
  	"home_gradient" varchar DEFAULT 'linear-gradient(35deg, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0) 30%)',
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "family_types" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"order" numeric DEFAULT 0,
  	"active" boolean DEFAULT true,
  	"text_color" varchar DEFAULT '#000000',
  	"underline_color" varchar DEFAULT '#000000',
  	"menu_html" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "family_types_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"families_id" integer
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"legacy_path" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "leads" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"form" varchar,
  	"path" varchar,
  	"name" varchar,
  	"email" varchar,
  	"phone" varchar,
  	"data" jsonb,
  	"email_to" varchar,
  	"email_status" "enum_leads_email_status" DEFAULT 'pending',
  	"salesforce_status" "enum_leads_salesforce_status" DEFAULT 'n/a',
  	"error" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar NOT NULL,
  	"to" varchar NOT NULL,
  	"permanent" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"sliders_id" integer,
  	"posts_id" integer,
  	"families_id" integer,
  	"family_types_id" integer,
  	"media_id" integer,
  	"leads_id" integer,
  	"redirects_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_top_menu" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"right_menu_html" varchar,
  	"social_menu_html" varchar,
  	"search_html" varchar,
  	"footer_html" varchar,
  	"floating_html" varchar,
  	"head_scripts" varchar,
  	"body_start_html" varchar,
  	"body_end_scripts" varchar,
  	"assets_version" varchar DEFAULT '1775667654984',
  	"default_meta_html" varchar,
  	"title_suffix" varchar DEFAULT ' | Ford Costa Rica | Grupo Purdy',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "form_settings_recipients" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"to" varchar NOT NULL,
  	"description" varchar
  );
  
  CREATE TABLE "form_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "sliders_slides" ADD CONSTRAINT "sliders_slides_image_xs_id_media_id_fk" FOREIGN KEY ("image_xs_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sliders_slides" ADD CONSTRAINT "sliders_slides_image_md_id_media_id_fk" FOREIGN KEY ("image_md_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sliders_slides" ADD CONSTRAINT "sliders_slides_image_lg_id_media_id_fk" FOREIGN KEY ("image_lg_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sliders_slides" ADD CONSTRAINT "sliders_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sliders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "families_models" ADD CONSTRAINT "families_models_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "families_data_sheets" ADD CONSTRAINT "families_data_sheets_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "families_data_sheets" ADD CONSTRAINT "families_data_sheets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "families" ADD CONSTRAINT "families_menu_image_id_media_id_fk" FOREIGN KEY ("menu_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "families" ADD CONSTRAINT "families_home_image_id_media_id_fk" FOREIGN KEY ("home_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "family_types_rels" ADD CONSTRAINT "family_types_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."family_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "family_types_rels" ADD CONSTRAINT "family_types_rels_families_fk" FOREIGN KEY ("families_id") REFERENCES "public"."families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sliders_fk" FOREIGN KEY ("sliders_id") REFERENCES "public"."sliders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_families_fk" FOREIGN KEY ("families_id") REFERENCES "public"."families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_family_types_fk" FOREIGN KEY ("family_types_id") REFERENCES "public"."family_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_leads_fk" FOREIGN KEY ("leads_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_top_menu" ADD CONSTRAINT "site_settings_top_menu_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_settings_recipients" ADD CONSTRAINT "form_settings_recipients_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."form_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "pages_path_idx" ON "pages" USING btree ("path");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "sliders_slides_order_idx" ON "sliders_slides" USING btree ("_order");
  CREATE INDEX "sliders_slides_parent_id_idx" ON "sliders_slides" USING btree ("_parent_id");
  CREATE INDEX "sliders_slides_image_xs_idx" ON "sliders_slides" USING btree ("image_xs_id");
  CREATE INDEX "sliders_slides_image_md_idx" ON "sliders_slides" USING btree ("image_md_id");
  CREATE INDEX "sliders_slides_image_lg_idx" ON "sliders_slides" USING btree ("image_lg_id");
  CREATE UNIQUE INDEX "sliders_name_idx" ON "sliders" USING btree ("name");
  CREATE INDEX "sliders_updated_at_idx" ON "sliders" USING btree ("updated_at");
  CREATE INDEX "sliders_created_at_idx" ON "sliders" USING btree ("created_at");
  CREATE UNIQUE INDEX "posts_path_idx" ON "posts" USING btree ("path");
  CREATE INDEX "posts_image_idx" ON "posts" USING btree ("image_id");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "families_models_order_idx" ON "families_models" USING btree ("_order");
  CREATE INDEX "families_models_parent_id_idx" ON "families_models" USING btree ("_parent_id");
  CREATE INDEX "families_data_sheets_order_idx" ON "families_data_sheets" USING btree ("_order");
  CREATE INDEX "families_data_sheets_parent_id_idx" ON "families_data_sheets" USING btree ("_parent_id");
  CREATE INDEX "families_data_sheets_file_idx" ON "families_data_sheets" USING btree ("file_id");
  CREATE UNIQUE INDEX "families_slug_idx" ON "families" USING btree ("slug");
  CREATE INDEX "families_menu_image_idx" ON "families" USING btree ("menu_image_id");
  CREATE INDEX "families_home_image_idx" ON "families" USING btree ("home_image_id");
  CREATE INDEX "families_updated_at_idx" ON "families" USING btree ("updated_at");
  CREATE INDEX "families_created_at_idx" ON "families" USING btree ("created_at");
  CREATE INDEX "family_types_updated_at_idx" ON "family_types" USING btree ("updated_at");
  CREATE INDEX "family_types_created_at_idx" ON "family_types" USING btree ("created_at");
  CREATE INDEX "family_types_rels_order_idx" ON "family_types_rels" USING btree ("order");
  CREATE INDEX "family_types_rels_parent_idx" ON "family_types_rels" USING btree ("parent_id");
  CREATE INDEX "family_types_rels_path_idx" ON "family_types_rels" USING btree ("path");
  CREATE INDEX "family_types_rels_families_id_idx" ON "family_types_rels" USING btree ("families_id");
  CREATE UNIQUE INDEX "media_legacy_path_idx" ON "media" USING btree ("legacy_path");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "leads_form_idx" ON "leads" USING btree ("form");
  CREATE INDEX "leads_updated_at_idx" ON "leads" USING btree ("updated_at");
  CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");
  CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_sliders_id_idx" ON "payload_locked_documents_rels" USING btree ("sliders_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_families_id_idx" ON "payload_locked_documents_rels" USING btree ("families_id");
  CREATE INDEX "payload_locked_documents_rels_family_types_id_idx" ON "payload_locked_documents_rels" USING btree ("family_types_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_leads_id_idx" ON "payload_locked_documents_rels" USING btree ("leads_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_top_menu_order_idx" ON "site_settings_top_menu" USING btree ("_order");
  CREATE INDEX "site_settings_top_menu_parent_id_idx" ON "site_settings_top_menu" USING btree ("_parent_id");
  CREATE INDEX "form_settings_recipients_order_idx" ON "form_settings_recipients" USING btree ("_order");
  CREATE INDEX "form_settings_recipients_parent_id_idx" ON "form_settings_recipients" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages" CASCADE;
  DROP TABLE "sliders_slides" CASCADE;
  DROP TABLE "sliders" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "families_models" CASCADE;
  DROP TABLE "families_data_sheets" CASCADE;
  DROP TABLE "families" CASCADE;
  DROP TABLE "family_types" CASCADE;
  DROP TABLE "family_types_rels" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "leads" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings_top_menu" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "form_settings_recipients" CASCADE;
  DROP TABLE "form_settings" CASCADE;
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum_pages_template";
  DROP TYPE "public"."enum_leads_email_status";
  DROP TYPE "public"."enum_leads_salesforce_status";
  DROP TYPE "public"."enum_users_role";`)
}
