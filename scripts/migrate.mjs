/**
 * scripts/migrate.mjs — applies the schema to the Neon database.
 *
 * Usage:
 *   node --env-file-if-exists=.env.development.local scripts/migrate.mjs
 *
 * Why this exists (instead of run-all-migrations.js):
 *   - run-all-migrations.js hardcodes an outdated inline schema in which
 *     `users.password_hash` is NOT NULL and `clerk_id` does not exist, so
 *     Clerk sign-ins fail against it.
 *   - The Neon HTTP driver rejects multiple statements in a single call, so
 *     each file is split into individual statements. The splitter is
 *     dollar-quote aware ($$ ... $$) because several files contain DO blocks.
 *
 * Only schema files are applied. Seed files and the legacy password-based
 * admin seeds are intentionally skipped — Clerk owns credentials now.
 */

import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { neon } from "@neondatabase/serverless"

const here = dirname(fileURLToPath(import.meta.url))

const FILES = [
  "001-create-tables.sql",
  "003-create-users-fixed.sql",
  "003-add-approval-workflow.sql",
  "003-fix-approval.sql",
  "005-add-enhanced-features.sql",
  "006-add-profile-photos.sql",
  "007-create-content-drafts.sql",
  "008-fix-complete-schema.sql",
  "009-fix-remaining-schema.sql",
  "010-create-course-store.sql",
  "011-create-topics-table.sql",
  "012-create-community-tables.sql",
  "014-new-features.sql",
  "015-reviews-views-coupons.sql",
  "016-fix-foreign-keys.sql",
  "017-contacts-and-faqs.sql",
  "add-rejection-reason-column.sql",
  // Must run last: reconciles `users` with Clerk.
  "018-clerk-neon-integration.sql",
]

/**
 * Splits SQL into statements on top-level semicolons, ignoring semicolons
 * inside line comments, block comments, single quotes, and $$/$tag$ blocks.
 */
function splitStatements(sql) {
  const out = []
  let buf = ""
  let i = 0

  while (i < sql.length) {
    const two = sql.slice(i, i + 2)

    // line comment
    if (two === "--") {
      const nl = sql.indexOf("\n", i)
      const stop = nl === -1 ? sql.length : nl
      buf += sql.slice(i, stop)
      i = stop
      continue
    }

    // block comment
    if (two === "/*") {
      const end = sql.indexOf("*/", i + 2)
      const stop = end === -1 ? sql.length : end + 2
      buf += sql.slice(i, stop)
      i = stop
      continue
    }

    // single-quoted string ('' escapes)
    if (sql[i] === "'") {
      buf += sql[i++]
      while (i < sql.length) {
        if (sql[i] === "'" && sql[i + 1] === "'") {
          buf += sql.slice(i, i + 2)
          i += 2
          continue
        }
        if (sql[i] === "'") {
          buf += sql[i++]
          break
        }
        buf += sql[i++]
      }
      continue
    }

    // dollar-quoted block: $$ ... $$ or $tag$ ... $tag$
    const dollar = /^\$[A-Za-z_0-9]*\$/.exec(sql.slice(i))
    if (dollar) {
      const tag = dollar[0]
      const end = sql.indexOf(tag, i + tag.length)
      const stop = end === -1 ? sql.length : end + tag.length
      buf += sql.slice(i, stop)
      i = stop
      continue
    }

    if (sql[i] === ";") {
      if (buf.trim()) out.push(buf.trim())
      buf = ""
      i++
      continue
    }

    buf += sql[i++]
  }

  if (buf.trim()) out.push(buf.trim())
  // drop comment-only fragments
  return out.filter((s) => s.replace(/--[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "").trim())
}

const url = process.env.DATABASE_URL
if (!url) {
  console.error("DATABASE_URL is not set. Connect the Neon integration first.")
  process.exit(1)
}

const sql = neon(url)
let applied = 0
let failed = 0

for (const file of FILES) {
  let text
  try {
    text = readFileSync(join(here, file), "utf8")
  } catch {
    console.log(`- skip ${file} (not found)`)
    continue
  }

  const statements = splitStatements(text)
  let ok = 0
  const errors = []

  for (const statement of statements) {
    try {
      await sql.query(statement)
      ok++
    } catch (error) {
      errors.push(`${error.message} :: ${statement.slice(0, 90).replace(/\s+/g, " ")}`)
    }
  }

  applied += ok
  failed += errors.length
  console.log(`${errors.length ? "!" : "+"} ${file} — ${ok}/${statements.length} ok`)
  for (const e of errors) console.log(`    ${e}`)
}

console.log(`\nDone. ${applied} statements applied, ${failed} failed.`)
