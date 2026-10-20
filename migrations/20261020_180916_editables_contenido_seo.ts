import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_editables_kind" AS ENUM('text', 'image', 'link', 'video', 'meta');
  CREATE TYPE "public"."enum_pages_seo_kind" AS ENUM('text', 'image', 'link', 'video', 'meta');
  CREATE TYPE "public"."enum_family_types_menu_editables_kind" AS ENUM('text', 'image', 'link', 'video', 'meta');
  CREATE TYPE "public"."enum_site_settings_footer_editables_kind" AS ENUM('text', 'image', 'link', 'video', 'meta');
  CREATE TABLE "pages_editables" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"kind" "enum_pages_editables_kind",
  	"source" varchar,
  	"section" varchar,
  	"label" varchar,
  	"start" numeric,
  	"end" numeric,
  	"raw" varchar,
  	"original" varchar,
  	"quote" varchar,
  	"text" varchar,
  	"image_id" integer,
  	"url" varchar
  );
  
  CREATE TABLE "pages_seo" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"kind" "enum_pages_seo_kind",
  	"source" varchar,
  	"section" varchar,
  	"label" varchar,
  	"start" numeric,
  	"end" numeric,
  	"raw" varchar,
  	"original" varchar,
  	"quote" varchar,
  	"text" varchar,
  	"image_id" integer,
  	"url" varchar
  );
  
  CREATE TABLE "family_types_menu_editables" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"kind" "enum_family_types_menu_editables_kind",
  	"source" varchar,
  	"section" varchar,
  	"label" varchar,
  	"start" numeric,
  	"end" numeric,
  	"raw" varchar,
  	"original" varchar,
  	"quote" varchar,
  	"text" varchar,
  	"image_id" integer,
  	"url" varchar
  );
  
  CREATE TABLE "site_settings_footer_editables" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"kind" "enum_site_settings_footer_editables_kind",
  	"source" varchar,
  	"section" varchar,
  	"label" varchar,
  	"start" numeric,
  	"end" numeric,
  	"raw" varchar,
  	"original" varchar,
  	"quote" varchar,
  	"text" varchar,
  	"image_id" integer,
  	"url" varchar
  );
  
  ALTER TABLE "pages_editables" ADD CONSTRAINT "pages_editables_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_editables" ADD CONSTRAINT "pages_editables_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_seo" ADD CONSTRAINT "pages_seo_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_seo" ADD CONSTRAINT "pages_seo_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "family_types_menu_editables" ADD CONSTRAINT "family_types_menu_editables_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "family_types_menu_editables" ADD CONSTRAINT "family_types_menu_editables_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."family_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_footer_editables" ADD CONSTRAINT "site_settings_footer_editables_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_footer_editables" ADD CONSTRAINT "site_settings_footer_editables_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_editables_order_idx" ON "pages_editables" USING btree ("_order");
  CREATE INDEX "pages_editables_parent_id_idx" ON "pages_editables" USING btree ("_parent_id");
  CREATE INDEX "pages_editables_image_idx" ON "pages_editables" USING btree ("image_id");
  CREATE INDEX "pages_seo_order_idx" ON "pages_seo" USING btree ("_order");
  CREATE INDEX "pages_seo_parent_id_idx" ON "pages_seo" USING btree ("_parent_id");
  CREATE INDEX "pages_seo_image_idx" ON "pages_seo" USING btree ("image_id");
  CREATE INDEX "family_types_menu_editables_order_idx" ON "family_types_menu_editables" USING btree ("_order");
  CREATE INDEX "family_types_menu_editables_parent_id_idx" ON "family_types_menu_editables" USING btree ("_parent_id");
  CREATE INDEX "family_types_menu_editables_image_idx" ON "family_types_menu_editables" USING btree ("image_id");
  CREATE INDEX "site_settings_footer_editables_order_idx" ON "site_settings_footer_editables" USING btree ("_order");
  CREATE INDEX "site_settings_footer_editables_parent_id_idx" ON "site_settings_footer_editables" USING btree ("_parent_id");
  CREATE INDEX "site_settings_footer_editables_image_idx" ON "site_settings_footer_editables" USING btree ("image_id");`)

  // Backfill: genera los campos amigables (textos, imágenes, enlaces, SEO) a partir
  // del HTML existente. El HTML original no cambia, así que el sitio se ve idéntico.
  const pages = await payload.find({ collection: 'pages', limit: 0, depth: 0, pagination: false, req })
  for (const page of pages.docs) {
    await payload.update({ collection: 'pages', id: page.id, data: {}, depth: 0, req, overrideAccess: true })
  }
  const types = await payload.find({ collection: 'family-types', limit: 0, depth: 0, pagination: false, req })
  for (const t of types.docs) {
    await payload.update({ collection: 'family-types', id: t.id, data: {}, depth: 0, req, overrideAccess: true })
  }
  await payload.updateGlobal({ slug: 'site-settings', data: {}, depth: 0, req, overrideAccess: true })
  payload.logger.info(`editables: ${pages.docs.length} páginas, ${types.docs.length} tipos y pie de página listos`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_editables" CASCADE;
  DROP TABLE "pages_seo" CASCADE;
  DROP TABLE "family_types_menu_editables" CASCADE;
  DROP TABLE "site_settings_footer_editables" CASCADE;
  DROP TYPE "public"."enum_pages_editables_kind";
  DROP TYPE "public"."enum_pages_seo_kind";
  DROP TYPE "public"."enum_family_types_menu_editables_kind";
  DROP TYPE "public"."enum_site_settings_footer_editables_kind";`)
}
