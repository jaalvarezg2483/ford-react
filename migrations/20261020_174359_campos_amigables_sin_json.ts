import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Campos amigables: nada de JSON en el CMS.
 * Equipamiento, especificaciones, tarjetas de portada y entidades financieras pasan de
 * JSON a campos con etiqueta. Los datos existentes se copian antes de borrar las columnas viejas.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "families_models_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar NOT NULL
  );
  
  CREATE TABLE "family_types_card_styles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"color" varchar,
  	"image" varchar,
  	"gradient" varchar
  );
  
  CREATE TABLE "site_settings_calculators" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"rate" numeric,
  	"commission" numeric,
  	"prima" numeric,
  	"logo_id" integer,
  	"image" varchar,
  	"legacy_id" numeric
  );
  
  CREATE TABLE "site_settings_numbers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"number" numeric,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL
  );
  
  ALTER TABLE "families_models" ADD COLUMN "specs_cc" numeric;
  ALTER TABLE "families_models" ADD COLUMN "specs_gas" varchar;
  ALTER TABLE "families_models" ADD COLUMN "specs_traction" varchar;
  ALTER TABLE "families_models" ADD COLUMN "specs_transmission" varchar;
  ALTER TABLE "families_models" ADD COLUMN "specs_pasajeros" varchar;
  ALTER TABLE "families_models" ADD COLUMN "specs_total_length" varchar;
  ALTER TABLE "families_models" ADD COLUMN "specs_total_height" varchar;
  ALTER TABLE "families_models" ADD COLUMN "specs_total_width" varchar;
  ALTER TABLE "families_models" ADD COLUMN "specs_distance_between_axis" varchar;
  ALTER TABLE "families_models_features" ADD CONSTRAINT "families_models_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."families_models"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "family_types_card_styles" ADD CONSTRAINT "family_types_card_styles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."family_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_calculators" ADD CONSTRAINT "site_settings_calculators_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_calculators" ADD CONSTRAINT "site_settings_calculators_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_numbers" ADD CONSTRAINT "site_settings_numbers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "families_models_features_order_idx" ON "families_models_features" USING btree ("_order");
  CREATE INDEX "families_models_features_parent_id_idx" ON "families_models_features" USING btree ("_parent_id");
  CREATE INDEX "family_types_card_styles_order_idx" ON "family_types_card_styles" USING btree ("_order");
  CREATE INDEX "family_types_card_styles_parent_id_idx" ON "family_types_card_styles" USING btree ("_parent_id");
  CREATE INDEX "site_settings_calculators_order_idx" ON "site_settings_calculators" USING btree ("_order");
  CREATE INDEX "site_settings_calculators_parent_id_idx" ON "site_settings_calculators" USING btree ("_parent_id");
  CREATE INDEX "site_settings_calculators_logo_idx" ON "site_settings_calculators" USING btree ("logo_id");
  CREATE INDEX "site_settings_numbers_order_parent_idx" ON "site_settings_numbers" USING btree ("order","parent_id");
  `)

  // Equipamiento: ["texto", …] (o [{name}]) → un renglón por ítem, en el mismo orden.
  await db.execute(sql`
  INSERT INTO "families_models_features" ("_order", "_parent_id", "id", "item")
  SELECT f.ord, m.id, substr(md5(m.id || f.ord::text || random()::text), 1, 24), btrim(f.txt)
  FROM "families_models" m
  CROSS JOIN LATERAL (
    SELECT ord, CASE jsonb_typeof(val) WHEN 'string' THEN val #>> '{}' WHEN 'object' THEN coalesce(val->>'name', val->>'item') END AS txt
    FROM jsonb_array_elements(CASE WHEN jsonb_typeof(m."features") = 'array' THEN m."features" ELSE '[]'::jsonb END) WITH ORDINALITY AS e(val, ord)
  ) f
  WHERE coalesce(btrim(f.txt), '') <> '';
  `)

  // Especificaciones del comparador: {cc, gas, …} → una columna por dato.
  await db.execute(sql`
  UPDATE "families_models" SET
    "specs_cc" = nullif(regexp_replace(coalesce("specs"->>'cc', ''), '[^0-9.]', '', 'g'), '')::numeric,
    "specs_gas" = nullif(btrim("specs"->>'gas'), ''),
    "specs_traction" = nullif(btrim("specs"->>'traction'), ''),
    "specs_transmission" = nullif(btrim("specs"->>'transmission'), ''),
    "specs_pasajeros" = nullif(btrim("specs"->>'pasajeros'), ''),
    "specs_total_length" = nullif(btrim("specs"->>'totalLength'), ''),
    "specs_total_height" = nullif(btrim("specs"->>'totalHeight'), ''),
    "specs_total_width" = nullif(btrim("specs"->>'totalWidth'), ''),
    "specs_distance_between_axis" = nullif(btrim("specs"->>'distanceBetweenAxis'), '')
  WHERE jsonb_typeof("specs") = 'object';
  `)

  // Tarjetas de la portada por categoría: [{slug, image, color, gradient}] → renglones.
  await db.execute(sql`
  INSERT INTO "family_types_card_styles" ("_order", "_parent_id", "id", "slug", "color", "image", "gradient")
  SELECT x.ord, t.id, substr(md5(t.id::text || x.ord::text || random()::text), 1, 24),
    x.e->>'slug', nullif(x.e->>'color', ''), nullif(x.e->>'image', ''), nullif(x.e->>'gradient', '')
  FROM "family_types" t
  CROSS JOIN LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(t."card_styles") = 'array' THEN t."card_styles" ELSE '[]'::jsonb END) WITH ORDINALITY AS x(e, ord)
  WHERE coalesce(x.e->>'slug', '') <> '';
  `)

  // Entidades financieras: migrar directamente con SQL porque el schema que conoce Payload
  // todavía no incluye las tablas de editables creadas por la siguiente migración.
  await db.execute(sql`
  INSERT INTO "site_settings_calculators" (
    "_order", "_parent_id", "id", "name", "rate", "commission", "prima", "image", "legacy_id"
  )
  SELECT c.ord::integer, s.id,
    substr(md5(s.id::text || c.ord::text || random()::text), 1, 24),
    coalesce(nullif(c.item->>'name', ''), 'Entidad'),
    CASE WHEN c.item->>'rate' ~ '^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)([eE][+-]?[0-9]+)?$' THEN (c.item->>'rate')::numeric END,
    CASE WHEN c.item->>'commission' ~ '^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)([eE][+-]?[0-9]+)?$' THEN (c.item->>'commission')::numeric END,
    CASE WHEN c.item->>'prima' ~ '^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)([eE][+-]?[0-9]+)?$' THEN (c.item->>'prima')::numeric END,
    nullif(c.item->>'image', ''),
    CASE WHEN c.item->>'id' ~ '^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)([eE][+-]?[0-9]+)?$' THEN (c.item->>'id')::numeric END
  FROM "site_settings" s
  CROSS JOIN LATERAL jsonb_array_elements(
    CASE WHEN jsonb_typeof(s."calculators") = 'array' THEN s."calculators" ELSE '[]'::jsonb END
  ) WITH ORDINALITY AS c(item, ord);

  INSERT INTO "site_settings_numbers" ("number", "order", "parent_id", "path")
  SELECT n.value::numeric, n.ord::integer, s.id,
    'calculators.' || (c.ord - 1)::text || '.' || f.field
  FROM "site_settings" s
  CROSS JOIN LATERAL jsonb_array_elements(
    CASE WHEN jsonb_typeof(s."calculators") = 'array' THEN s."calculators" ELSE '[]'::jsonb END
  ) WITH ORDINALITY AS c(item, ord)
  CROSS JOIN LATERAL (VALUES ('termMonth', c.item->'termMonth'), ('terms', c.item->'terms')) AS f(field, items)
  CROSS JOIN LATERAL jsonb_array_elements_text(
    CASE WHEN jsonb_typeof(f.items) = 'array' THEN f.items ELSE '[]'::jsonb END
  ) WITH ORDINALITY AS n(value, ord)
  WHERE n.value ~ '^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)([eE][+-]?[0-9]+)?$';
  `)

  await db.execute(sql`
  ALTER TABLE "families_models" DROP COLUMN "features";
  ALTER TABLE "families_models" DROP COLUMN "specs";
  ALTER TABLE "family_types" DROP COLUMN "card_styles";
  ALTER TABLE "site_settings" DROP COLUMN "calculators";
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Vuelve a JSON conservando equipamiento, especificaciones y tarjetas.
  await db.execute(sql`
  ALTER TABLE "families_models" ADD COLUMN IF NOT EXISTS "features_json" jsonb;
  ALTER TABLE "families_models" ADD COLUMN IF NOT EXISTS "specs_json" jsonb;
  ALTER TABLE "family_types" ADD COLUMN IF NOT EXISTS "card_styles_json" jsonb;
  UPDATE "families_models" m SET "features_json" = (SELECT coalesce(jsonb_agg(f."item" ORDER BY f."_order"), '[]'::jsonb) FROM "families_models_features" f WHERE f."_parent_id" = m.id);
  UPDATE "families_models" SET "specs_json" = nullif(jsonb_strip_nulls(jsonb_build_object('cc', "specs_cc", 'gas', "specs_gas", 'traction', "specs_traction", 'transmission', "specs_transmission", 'pasajeros', "specs_pasajeros", 'totalLength', "specs_total_length", 'totalHeight', "specs_total_height", 'totalWidth', "specs_total_width", 'distanceBetweenAxis', "specs_distance_between_axis")), '{}'::jsonb);
  UPDATE "family_types" t SET "card_styles_json" = (SELECT coalesce(jsonb_agg(jsonb_strip_nulls(jsonb_build_object('slug', c."slug", 'image', c."image", 'color', c."color", 'gradient', c."gradient")) ORDER BY c."_order"), '[]'::jsonb) FROM "family_types_card_styles" c WHERE c."_parent_id" = t.id);
  `)
  await db.execute(sql`
   DROP TABLE "families_models_features" CASCADE;
  DROP TABLE "family_types_card_styles" CASCADE;
  DROP TABLE "site_settings_calculators" CASCADE;
  DROP TABLE "site_settings_numbers" CASCADE;
  ALTER TABLE "families_models" ADD COLUMN "features" jsonb;
  ALTER TABLE "families_models" ADD COLUMN "specs" jsonb;
  ALTER TABLE "family_types" ADD COLUMN "card_styles" jsonb;
  ALTER TABLE "site_settings" ADD COLUMN "calculators" jsonb;
  ALTER TABLE "families_models" DROP COLUMN "specs_cc";
  ALTER TABLE "families_models" DROP COLUMN "specs_gas";
  ALTER TABLE "families_models" DROP COLUMN "specs_traction";
  ALTER TABLE "families_models" DROP COLUMN "specs_transmission";
  ALTER TABLE "families_models" DROP COLUMN "specs_pasajeros";
  ALTER TABLE "families_models" DROP COLUMN "specs_total_length";
  ALTER TABLE "families_models" DROP COLUMN "specs_total_height";
  ALTER TABLE "families_models" DROP COLUMN "specs_total_width";
  ALTER TABLE "families_models" DROP COLUMN "specs_distance_between_axis";
  UPDATE "families_models" SET "features" = "features_json", "specs" = "specs_json";
  UPDATE "family_types" SET "card_styles" = "card_styles_json";
  ALTER TABLE "families_models" DROP COLUMN "features_json";
  ALTER TABLE "families_models" DROP COLUMN "specs_json";
  ALTER TABLE "family_types" DROP COLUMN "card_styles_json";`)
}
