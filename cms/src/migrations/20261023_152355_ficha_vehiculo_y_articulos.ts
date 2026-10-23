import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "families_colors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"hex" varchar,
  	"image_id" integer,
  	"image_path" varchar,
  	"disclaimer" varchar
  );
  
  CREATE TABLE "families_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"image_id" integer,
  	"image_path" varchar
  );
  
  CREATE TABLE "families_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"image_path" varchar,
  	"caption" varchar
  );
  
  CREATE TABLE "families_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar
  );
  
  ALTER TABLE "posts" ADD COLUMN "heading" varchar;
  ALTER TABLE "posts" ADD COLUMN "banner_id" integer;
  ALTER TABLE "posts" ADD COLUMN "banner_path" varchar;
  ALTER TABLE "posts" ADD COLUMN "body_html" varchar;
  ALTER TABLE "posts" ADD COLUMN "article_id" numeric;
  ALTER TABLE "posts" ADD COLUMN "poll_up" numeric DEFAULT 0;
  ALTER TABLE "posts" ADD COLUMN "poll_down" numeric DEFAULT 0;
  ALTER TABLE "posts" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "families_models" ADD COLUMN "image_id" integer;
  ALTER TABLE "families_models" ADD COLUMN "image_path" varchar;
  ALTER TABLE "families_models" ADD COLUMN "calculable" boolean DEFAULT true;
  ALTER TABLE "families" ADD COLUMN "tagline" varchar;
  ALTER TABLE "families" ADD COLUMN "hero_desktop_id" integer;
  ALTER TABLE "families" ADD COLUMN "hero_desktop_path" varchar;
  ALTER TABLE "families" ADD COLUMN "hero_mobile_id" integer;
  ALTER TABLE "families" ADD COLUMN "hero_mobile_path" varchar;
  ALTER TABLE "families" ADD COLUMN "lead_title" varchar;
  ALTER TABLE "families" ADD COLUMN "purdy_go_url" varchar;
  ALTER TABLE "families" ADD COLUMN "lead_text" varchar;
  ALTER TABLE "families" ADD COLUMN "show_calculate" boolean DEFAULT true;
  ALTER TABLE "families_colors" ADD CONSTRAINT "families_colors_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "families_colors" ADD CONSTRAINT "families_colors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "families_highlights" ADD CONSTRAINT "families_highlights_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "families_highlights" ADD CONSTRAINT "families_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "families_gallery_items" ADD CONSTRAINT "families_gallery_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "families_gallery_items" ADD CONSTRAINT "families_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."families_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "families_gallery" ADD CONSTRAINT "families_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."families"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "families_colors_order_idx" ON "families_colors" USING btree ("_order");
  CREATE INDEX "families_colors_parent_id_idx" ON "families_colors" USING btree ("_parent_id");
  CREATE INDEX "families_colors_image_idx" ON "families_colors" USING btree ("image_id");
  CREATE INDEX "families_highlights_order_idx" ON "families_highlights" USING btree ("_order");
  CREATE INDEX "families_highlights_parent_id_idx" ON "families_highlights" USING btree ("_parent_id");
  CREATE INDEX "families_highlights_image_idx" ON "families_highlights" USING btree ("image_id");
  CREATE INDEX "families_gallery_items_order_idx" ON "families_gallery_items" USING btree ("_order");
  CREATE INDEX "families_gallery_items_parent_id_idx" ON "families_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "families_gallery_items_image_idx" ON "families_gallery_items" USING btree ("image_id");
  CREATE INDEX "families_gallery_order_idx" ON "families_gallery" USING btree ("_order");
  CREATE INDEX "families_gallery_parent_id_idx" ON "families_gallery" USING btree ("_parent_id");
  ALTER TABLE "posts" ADD CONSTRAINT "posts_banner_id_media_id_fk" FOREIGN KEY ("banner_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "families_models" ADD CONSTRAINT "families_models_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "families" ADD CONSTRAINT "families_hero_desktop_id_media_id_fk" FOREIGN KEY ("hero_desktop_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "families" ADD CONSTRAINT "families_hero_mobile_id_media_id_fk" FOREIGN KEY ("hero_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "posts_banner_idx" ON "posts" USING btree ("banner_id");
  CREATE INDEX "families_models_image_idx" ON "families_models" USING btree ("image_id");
  CREATE INDEX "families_hero_desktop_idx" ON "families" USING btree ("hero_desktop_id");
  CREATE INDEX "families_hero_mobile_idx" ON "families" USING btree ("hero_mobile_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "families_colors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "families_highlights" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "families_gallery_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "families_gallery" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "families_colors" CASCADE;
  DROP TABLE "families_highlights" CASCADE;
  DROP TABLE "families_gallery_items" CASCADE;
  DROP TABLE "families_gallery" CASCADE;
  ALTER TABLE "posts" DROP CONSTRAINT "posts_banner_id_media_id_fk";
  
  ALTER TABLE "families_models" DROP CONSTRAINT "families_models_image_id_media_id_fk";
  
  ALTER TABLE "families" DROP CONSTRAINT "families_hero_desktop_id_media_id_fk";
  
  ALTER TABLE "families" DROP CONSTRAINT "families_hero_mobile_id_media_id_fk";
  
  DROP INDEX "posts_banner_idx";
  DROP INDEX "families_models_image_idx";
  DROP INDEX "families_hero_desktop_idx";
  DROP INDEX "families_hero_mobile_idx";
  ALTER TABLE "posts" DROP COLUMN "heading";
  ALTER TABLE "posts" DROP COLUMN "banner_id";
  ALTER TABLE "posts" DROP COLUMN "banner_path";
  ALTER TABLE "posts" DROP COLUMN "body_html";
  ALTER TABLE "posts" DROP COLUMN "article_id";
  ALTER TABLE "posts" DROP COLUMN "poll_up";
  ALTER TABLE "posts" DROP COLUMN "poll_down";
  ALTER TABLE "posts" DROP COLUMN "meta_description";
  ALTER TABLE "families_models" DROP COLUMN "image_id";
  ALTER TABLE "families_models" DROP COLUMN "image_path";
  ALTER TABLE "families_models" DROP COLUMN "calculable";
  ALTER TABLE "families" DROP COLUMN "tagline";
  ALTER TABLE "families" DROP COLUMN "hero_desktop_id";
  ALTER TABLE "families" DROP COLUMN "hero_desktop_path";
  ALTER TABLE "families" DROP COLUMN "hero_mobile_id";
  ALTER TABLE "families" DROP COLUMN "hero_mobile_path";
  ALTER TABLE "families" DROP COLUMN "lead_title";
  ALTER TABLE "families" DROP COLUMN "purdy_go_url";
  ALTER TABLE "families" DROP COLUMN "lead_text";
  ALTER TABLE "families" DROP COLUMN "show_calculate";`)
}
