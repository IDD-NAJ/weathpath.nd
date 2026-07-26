import { neon } from "@neondatabase/serverless"

/**
 * Resolves the Postgres connection string for this app.
 *
 * APP_DATABASE_URL takes precedence over DATABASE_URL so that a specific
 * database can be pinned even when a connected integration manages (and
 * periodically rewrites) DATABASE_URL and its sibling POSTGRES_* variables.
 */
export function getConnectionString(): string {
  const raw = process.env.APP_DATABASE_URL || process.env.DATABASE_URL

  if (!raw) {
    throw new Error(
      "No database connection string found. Set APP_DATABASE_URL (preferred) or DATABASE_URL in your environment.",
    )
  }

  // Tolerate a malformed `channel_binding=requirev` value. The Neon HTTP
  // driver ignores this libpq parameter, but standard TCP clients validate it.
  return raw.replace(/channel_binding=requirev\b/, "channel_binding=require")
}

let _sql: ReturnType<typeof neon> | null = null

/**
 * Returns a lazily-created, memoized Neon client bound to the resolved
 * connection string. Prefer this over calling `neon(process.env.DATABASE_URL!)`
 * directly so every query in the app targets the same database.
 */
export function getSql(): ReturnType<typeof neon> {
  if (!_sql) {
    _sql = neon(getConnectionString())
  }
  return _sql
}

export const sql = ((...args: any[]): any => {
  return (getSql() as any)(...args)
}) as any as ReturnType<typeof neon>
