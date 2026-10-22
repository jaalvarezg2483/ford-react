import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_blog_feedback_kind" AS ENUM('up', 'down', 'opinion', 'workshop');
  CREATE TABLE "blog_feedback" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum_blog_feedback_kind" NOT NULL,
  	"article_id" numeric NOT NULL,
  	"workshop_id" numeric,
  	"name" varchar,
  	"email" varchar,
  	"opinion" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "blog_feedback_id" integer;
  CREATE INDEX "blog_feedback_kind_idx" ON "blog_feedback" USING btree ("kind");
  CREATE INDEX "blog_feedback_article_id_idx" ON "blog_feedback" USING btree ("article_id");
  CREATE INDEX "blog_feedback_updated_at_idx" ON "blog_feedback" USING btree ("updated_at");
  CREATE INDEX "blog_feedback_created_at_idx" ON "blog_feedback" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_blog_feedback_fk" FOREIGN KEY ("blog_feedback_id") REFERENCES "public"."blog_feedback"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_blog_feedback_id_idx" ON "payload_locked_documents_rels" USING btree ("blog_feedback_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "blog_feedback" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "blog_feedback" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_blog_feedback_fk";
  
  DROP INDEX "payload_locked_documents_rels_blog_feedback_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "blog_feedback_id";
  DROP TYPE "public"."enum_blog_feedback_kind";`)
}
