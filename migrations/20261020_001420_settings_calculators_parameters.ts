import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "site_settings_parameters" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"value" varchar
  );
  
  ALTER TABLE "families_models" ADD COLUMN "price" numeric;
  ALTER TABLE "site_settings" ADD COLUMN "calculators" jsonb;
  ALTER TABLE "site_settings_parameters" ADD CONSTRAINT "site_settings_parameters_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_parameters_order_idx" ON "site_settings_parameters" USING btree ("_order");
  CREATE INDEX "site_settings_parameters_parent_id_idx" ON "site_settings_parameters" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "site_settings_parameters" CASCADE;
  ALTER TABLE "families_models" DROP COLUMN "price";
  ALTER TABLE "site_settings" DROP COLUMN "calculators";`)
}
