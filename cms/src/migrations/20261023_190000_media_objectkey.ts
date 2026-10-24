import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * The Azure storage adapter stores each uploaded asset's blob key in this
 * Payload-managed column. Earlier snapshots were generated before the Azure
 * storage plugin was enabled, leaving existing databases without the column.
 * Keep this additive and idempotent so both Azure environments can migrate
 * safely without altering existing media rows.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "_objectkey" varchar`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "media" DROP COLUMN IF EXISTS "_objectkey"`)
}
