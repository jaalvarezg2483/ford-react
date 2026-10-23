import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "content_pages_blocks_html" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"html" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "content_pages_blocks_slider" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slider_id" integer NOT NULL,
  	"show_container" boolean DEFAULT true,
  	"show_back_link" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "content_pages_blocks_cards_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"href" varchar NOT NULL,
  	"image_id" integer,
  	"image_path" varchar,
  	"alt" varchar
  );
  
  CREATE TABLE "content_pages_blocks_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "content_pages_blocks_contact_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"form_type" varchar NOT NULL,
  	"title" varchar,
  	"phone" varchar,
  	"mail" varchar,
  	"subject" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "content_pages_blocks_about_tabs_tabs_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"image_path" varchar
  );
  
  CREATE TABLE "content_pages_blocks_about_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "content_pages_blocks_about_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "content_pages_blocks_timeline_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"year" varchar NOT NULL,
  	"text" varchar,
  	"image_id" integer,
  	"image_path" varchar
  );
  
  CREATE TABLE "content_pages_blocks_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "content_pages_blocks_simple_banner_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_xs_id" integer,
  	"image_xs_path" varchar,
  	"image_md_id" integer,
  	"image_md_path" varchar,
  	"image_lg_id" integer,
  	"image_lg_path" varchar,
  	"alt" varchar,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "content_pages_blocks_simple_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "content_pages_blocks_tech_cards_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"html" varchar,
  	"image_id" integer,
  	"image_path" varchar
  );
  
  CREATE TABLE "content_pages_blocks_tech_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"anchor" varchar,
  	"title" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "content_pages_blocks_tech_hotspots_dots" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"top" varchar NOT NULL,
  	"left" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"html" varchar,
  	"image_id" integer,
  	"image_path" varchar
  );
  
  CREATE TABLE "content_pages_blocks_tech_hotspots" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"anchor" varchar,
  	"title" varchar NOT NULL,
  	"image_id" integer,
  	"image_path" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "content_pages_blocks_tech_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"title" varchar,
  	"html" varchar,
  	"image_id" integer,
  	"image_path" varchar,
  	"video_url" varchar
  );
  
  CREATE TABLE "content_pages_blocks_tech_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"anchor" varchar,
  	"title" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "content_pages_blocks_vehicle_picker" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Seleccione un vehículo',
  	"link_base" varchar DEFAULT '/accesorios/' NOT NULL,
  	"intro" varchar,
  	"aside" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "content_pages_blocks_downloads_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"file_id" integer,
  	"file_path" varchar
  );
  
  CREATE TABLE "content_pages_blocks_downloads" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"breadcrumb" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "content_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"path" varchar NOT NULL,
  	"active" boolean DEFAULT true,
  	"description" varchar,
  	"image_id" integer,
  	"image_path" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "content_pages_id" integer;
  ALTER TABLE "content_pages_blocks_html" ADD CONSTRAINT "content_pages_blocks_html_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_slider" ADD CONSTRAINT "content_pages_blocks_slider_slider_id_sliders_id_fk" FOREIGN KEY ("slider_id") REFERENCES "public"."sliders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_slider" ADD CONSTRAINT "content_pages_blocks_slider_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_cards_items" ADD CONSTRAINT "content_pages_blocks_cards_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_cards_items" ADD CONSTRAINT "content_pages_blocks_cards_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages_blocks_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_cards" ADD CONSTRAINT "content_pages_blocks_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_contact_form" ADD CONSTRAINT "content_pages_blocks_contact_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_about_tabs_tabs_images" ADD CONSTRAINT "content_pages_blocks_about_tabs_tabs_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_about_tabs_tabs_images" ADD CONSTRAINT "content_pages_blocks_about_tabs_tabs_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages_blocks_about_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_about_tabs_tabs" ADD CONSTRAINT "content_pages_blocks_about_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages_blocks_about_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_about_tabs" ADD CONSTRAINT "content_pages_blocks_about_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_timeline_items" ADD CONSTRAINT "content_pages_blocks_timeline_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_timeline_items" ADD CONSTRAINT "content_pages_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_timeline" ADD CONSTRAINT "content_pages_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_simple_banner_slides" ADD CONSTRAINT "content_pages_blocks_simple_banner_slides_image_xs_id_media_id_fk" FOREIGN KEY ("image_xs_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_simple_banner_slides" ADD CONSTRAINT "content_pages_blocks_simple_banner_slides_image_md_id_media_id_fk" FOREIGN KEY ("image_md_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_simple_banner_slides" ADD CONSTRAINT "content_pages_blocks_simple_banner_slides_image_lg_id_media_id_fk" FOREIGN KEY ("image_lg_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_simple_banner_slides" ADD CONSTRAINT "content_pages_blocks_simple_banner_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages_blocks_simple_banner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_simple_banner" ADD CONSTRAINT "content_pages_blocks_simple_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_tech_cards_cards" ADD CONSTRAINT "content_pages_blocks_tech_cards_cards_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_tech_cards_cards" ADD CONSTRAINT "content_pages_blocks_tech_cards_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages_blocks_tech_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_tech_cards" ADD CONSTRAINT "content_pages_blocks_tech_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_tech_hotspots_dots" ADD CONSTRAINT "content_pages_blocks_tech_hotspots_dots_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_tech_hotspots_dots" ADD CONSTRAINT "content_pages_blocks_tech_hotspots_dots_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages_blocks_tech_hotspots"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_tech_hotspots" ADD CONSTRAINT "content_pages_blocks_tech_hotspots_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_tech_hotspots" ADD CONSTRAINT "content_pages_blocks_tech_hotspots_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_tech_tabs_tabs" ADD CONSTRAINT "content_pages_blocks_tech_tabs_tabs_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_tech_tabs_tabs" ADD CONSTRAINT "content_pages_blocks_tech_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages_blocks_tech_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_tech_tabs" ADD CONSTRAINT "content_pages_blocks_tech_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_vehicle_picker" ADD CONSTRAINT "content_pages_blocks_vehicle_picker_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_downloads_items" ADD CONSTRAINT "content_pages_blocks_downloads_items_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_downloads_items" ADD CONSTRAINT "content_pages_blocks_downloads_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages_blocks_downloads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages_blocks_downloads" ADD CONSTRAINT "content_pages_blocks_downloads_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_pages" ADD CONSTRAINT "content_pages_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "content_pages_blocks_html_order_idx" ON "content_pages_blocks_html" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_html_parent_id_idx" ON "content_pages_blocks_html" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_html_path_idx" ON "content_pages_blocks_html" USING btree ("_path");
  CREATE INDEX "content_pages_blocks_slider_order_idx" ON "content_pages_blocks_slider" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_slider_parent_id_idx" ON "content_pages_blocks_slider" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_slider_path_idx" ON "content_pages_blocks_slider" USING btree ("_path");
  CREATE INDEX "content_pages_blocks_slider_slider_idx" ON "content_pages_blocks_slider" USING btree ("slider_id");
  CREATE INDEX "content_pages_blocks_cards_items_order_idx" ON "content_pages_blocks_cards_items" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_cards_items_parent_id_idx" ON "content_pages_blocks_cards_items" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_cards_items_image_idx" ON "content_pages_blocks_cards_items" USING btree ("image_id");
  CREATE INDEX "content_pages_blocks_cards_order_idx" ON "content_pages_blocks_cards" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_cards_parent_id_idx" ON "content_pages_blocks_cards" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_cards_path_idx" ON "content_pages_blocks_cards" USING btree ("_path");
  CREATE INDEX "content_pages_blocks_contact_form_order_idx" ON "content_pages_blocks_contact_form" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_contact_form_parent_id_idx" ON "content_pages_blocks_contact_form" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_contact_form_path_idx" ON "content_pages_blocks_contact_form" USING btree ("_path");
  CREATE INDEX "content_pages_blocks_about_tabs_tabs_images_order_idx" ON "content_pages_blocks_about_tabs_tabs_images" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_about_tabs_tabs_images_parent_id_idx" ON "content_pages_blocks_about_tabs_tabs_images" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_about_tabs_tabs_images_image_idx" ON "content_pages_blocks_about_tabs_tabs_images" USING btree ("image_id");
  CREATE INDEX "content_pages_blocks_about_tabs_tabs_order_idx" ON "content_pages_blocks_about_tabs_tabs" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_about_tabs_tabs_parent_id_idx" ON "content_pages_blocks_about_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_about_tabs_order_idx" ON "content_pages_blocks_about_tabs" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_about_tabs_parent_id_idx" ON "content_pages_blocks_about_tabs" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_about_tabs_path_idx" ON "content_pages_blocks_about_tabs" USING btree ("_path");
  CREATE INDEX "content_pages_blocks_timeline_items_order_idx" ON "content_pages_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_timeline_items_parent_id_idx" ON "content_pages_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_timeline_items_image_idx" ON "content_pages_blocks_timeline_items" USING btree ("image_id");
  CREATE INDEX "content_pages_blocks_timeline_order_idx" ON "content_pages_blocks_timeline" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_timeline_parent_id_idx" ON "content_pages_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_timeline_path_idx" ON "content_pages_blocks_timeline" USING btree ("_path");
  CREATE INDEX "content_pages_blocks_simple_banner_slides_order_idx" ON "content_pages_blocks_simple_banner_slides" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_simple_banner_slides_parent_id_idx" ON "content_pages_blocks_simple_banner_slides" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_simple_banner_slides_image_xs_idx" ON "content_pages_blocks_simple_banner_slides" USING btree ("image_xs_id");
  CREATE INDEX "content_pages_blocks_simple_banner_slides_image_md_idx" ON "content_pages_blocks_simple_banner_slides" USING btree ("image_md_id");
  CREATE INDEX "content_pages_blocks_simple_banner_slides_image_lg_idx" ON "content_pages_blocks_simple_banner_slides" USING btree ("image_lg_id");
  CREATE INDEX "content_pages_blocks_simple_banner_order_idx" ON "content_pages_blocks_simple_banner" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_simple_banner_parent_id_idx" ON "content_pages_blocks_simple_banner" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_simple_banner_path_idx" ON "content_pages_blocks_simple_banner" USING btree ("_path");
  CREATE INDEX "content_pages_blocks_tech_cards_cards_order_idx" ON "content_pages_blocks_tech_cards_cards" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_tech_cards_cards_parent_id_idx" ON "content_pages_blocks_tech_cards_cards" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_tech_cards_cards_image_idx" ON "content_pages_blocks_tech_cards_cards" USING btree ("image_id");
  CREATE INDEX "content_pages_blocks_tech_cards_order_idx" ON "content_pages_blocks_tech_cards" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_tech_cards_parent_id_idx" ON "content_pages_blocks_tech_cards" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_tech_cards_path_idx" ON "content_pages_blocks_tech_cards" USING btree ("_path");
  CREATE INDEX "content_pages_blocks_tech_hotspots_dots_order_idx" ON "content_pages_blocks_tech_hotspots_dots" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_tech_hotspots_dots_parent_id_idx" ON "content_pages_blocks_tech_hotspots_dots" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_tech_hotspots_dots_image_idx" ON "content_pages_blocks_tech_hotspots_dots" USING btree ("image_id");
  CREATE INDEX "content_pages_blocks_tech_hotspots_order_idx" ON "content_pages_blocks_tech_hotspots" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_tech_hotspots_parent_id_idx" ON "content_pages_blocks_tech_hotspots" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_tech_hotspots_path_idx" ON "content_pages_blocks_tech_hotspots" USING btree ("_path");
  CREATE INDEX "content_pages_blocks_tech_hotspots_image_idx" ON "content_pages_blocks_tech_hotspots" USING btree ("image_id");
  CREATE INDEX "content_pages_blocks_tech_tabs_tabs_order_idx" ON "content_pages_blocks_tech_tabs_tabs" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_tech_tabs_tabs_parent_id_idx" ON "content_pages_blocks_tech_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_tech_tabs_tabs_image_idx" ON "content_pages_blocks_tech_tabs_tabs" USING btree ("image_id");
  CREATE INDEX "content_pages_blocks_tech_tabs_order_idx" ON "content_pages_blocks_tech_tabs" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_tech_tabs_parent_id_idx" ON "content_pages_blocks_tech_tabs" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_tech_tabs_path_idx" ON "content_pages_blocks_tech_tabs" USING btree ("_path");
  CREATE INDEX "content_pages_blocks_vehicle_picker_order_idx" ON "content_pages_blocks_vehicle_picker" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_vehicle_picker_parent_id_idx" ON "content_pages_blocks_vehicle_picker" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_vehicle_picker_path_idx" ON "content_pages_blocks_vehicle_picker" USING btree ("_path");
  CREATE INDEX "content_pages_blocks_downloads_items_order_idx" ON "content_pages_blocks_downloads_items" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_downloads_items_parent_id_idx" ON "content_pages_blocks_downloads_items" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_downloads_items_file_idx" ON "content_pages_blocks_downloads_items" USING btree ("file_id");
  CREATE INDEX "content_pages_blocks_downloads_order_idx" ON "content_pages_blocks_downloads" USING btree ("_order");
  CREATE INDEX "content_pages_blocks_downloads_parent_id_idx" ON "content_pages_blocks_downloads" USING btree ("_parent_id");
  CREATE INDEX "content_pages_blocks_downloads_path_idx" ON "content_pages_blocks_downloads" USING btree ("_path");
  CREATE UNIQUE INDEX "content_pages_path_idx" ON "content_pages" USING btree ("path");
  CREATE INDEX "content_pages_image_idx" ON "content_pages" USING btree ("image_id");
  CREATE INDEX "content_pages_updated_at_idx" ON "content_pages" USING btree ("updated_at");
  CREATE INDEX "content_pages_created_at_idx" ON "content_pages" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_content_pages_fk" FOREIGN KEY ("content_pages_id") REFERENCES "public"."content_pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_content_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("content_pages_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "content_pages_blocks_html" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "content_pages_blocks_slider" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "content_pages_blocks_cards_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "content_pages_blocks_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "content_pages_blocks_contact_form" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "content_pages_blocks_about_tabs_tabs_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "content_pages_blocks_about_tabs_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "content_pages_blocks_about_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "content_pages_blocks_timeline_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "content_pages_blocks_timeline" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "content_pages_blocks_simple_banner_slides" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "content_pages_blocks_simple_banner" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "content_pages_blocks_tech_cards_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "content_pages_blocks_tech_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "content_pages_blocks_tech_hotspots_dots" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "content_pages_blocks_tech_hotspots" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "content_pages_blocks_tech_tabs_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "content_pages_blocks_tech_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "content_pages_blocks_vehicle_picker" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "content_pages_blocks_downloads_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "content_pages_blocks_downloads" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "content_pages" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "content_pages_blocks_html" CASCADE;
  DROP TABLE "content_pages_blocks_slider" CASCADE;
  DROP TABLE "content_pages_blocks_cards_items" CASCADE;
  DROP TABLE "content_pages_blocks_cards" CASCADE;
  DROP TABLE "content_pages_blocks_contact_form" CASCADE;
  DROP TABLE "content_pages_blocks_about_tabs_tabs_images" CASCADE;
  DROP TABLE "content_pages_blocks_about_tabs_tabs" CASCADE;
  DROP TABLE "content_pages_blocks_about_tabs" CASCADE;
  DROP TABLE "content_pages_blocks_timeline_items" CASCADE;
  DROP TABLE "content_pages_blocks_timeline" CASCADE;
  DROP TABLE "content_pages_blocks_simple_banner_slides" CASCADE;
  DROP TABLE "content_pages_blocks_simple_banner" CASCADE;
  DROP TABLE "content_pages_blocks_tech_cards_cards" CASCADE;
  DROP TABLE "content_pages_blocks_tech_cards" CASCADE;
  DROP TABLE "content_pages_blocks_tech_hotspots_dots" CASCADE;
  DROP TABLE "content_pages_blocks_tech_hotspots" CASCADE;
  DROP TABLE "content_pages_blocks_tech_tabs_tabs" CASCADE;
  DROP TABLE "content_pages_blocks_tech_tabs" CASCADE;
  DROP TABLE "content_pages_blocks_vehicle_picker" CASCADE;
  DROP TABLE "content_pages_blocks_downloads_items" CASCADE;
  DROP TABLE "content_pages_blocks_downloads" CASCADE;
  DROP TABLE "content_pages" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_content_pages_fk";
  
  DROP INDEX "payload_locked_documents_rels_content_pages_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "content_pages_id";`)
}
