import { neon } from "@neondatabase/serverless"

let _sql: ReturnType<typeof neon> | null = null

export const sql = ((...args: any[]): any => {
  if (!_sql) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL environment variable is not set. Please ensure it's configured in your deployment environment."
      )
    }
    _sql = neon(connectionString)
  }
  return _sql(...args)
}) as any as ReturnType<typeof neon>
