// Complete migration runner - runs all schema SQL files in order.
// Handles dollar-quoted ($$) function bodies when splitting statements.
require("dotenv").config({ path: ".env.development.local" })
require("dotenv").config({ path: ".env.local" })
const { neon } = require("@neondatabase/serverless")
const fs = require("fs")
const path = require("path")

const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL
if (!dbUrl) {
  console.error("No DATABASE_URL found in environment")
  process.exit(1)
}

const sql = neon(dbUrl)

// Split SQL into statements, respecting $$ dollar-quoted blocks
function splitStatements(content) {
  const statements = []
  let current = ""
  let inDollar = false
  const lines = content.split("\n")
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith("--") && !inDollar) continue
    current += line + "\n"
    // toggle dollar-quote state for each $$ found on the line
    const matches = (line.match(/\$\$/g) || []).length
    if (matches % 2 === 1) inDollar = !inDollar
    if (!inDollar && trimmed.endsWith(";")) {
      const stmt = current.trim()
      if (stmt.length > 1) statements.push(stmt.replace(/;$/, ""))
      current = ""
    }
  }
  if (current.trim().length > 0) statements.push(current.trim())
  return statements
}

async function runFile(filename) {
  const filePath = path.join(__dirname, filename)
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP (not found): ${filename}`)
    return
  }
  const content = fs.readFileSync(filePath, "utf8")
  const statements = splitStatements(content)
  let ok = 0
  let skipped = 0
  for (const stmt of statements) {
    try {
      await sql(stmt)
      ok++
    } catch (error) {
      const msg = error.message || ""
      if (
        msg.includes("already exists") ||
        msg.includes("duplicate key") ||
        msg.includes("multiple primary keys")
      ) {
        skipped++
      } else {
        console.error(`  FAILED in ${filename}: ${msg}`)
        console.error(`  Statement: ${stmt.slice(0, 120)}...`)
        skipped++
      }
    }
  }
  console.log(`DONE: ${filename} (${ok} ok, ${skipped} skipped)`)
}

async function main() {
  console.log("Running complete migrations against database...")

  const migrations = [
    "001-create-tables.sql",
    "003-add-approval-workflow.sql",
    "add-rejection-reason-column.sql",
    "005-add-enhanced-features.sql",
    "006-add-profile-photos.sql",
    "007-create-content-drafts.sql",
    "008-fix-complete-schema.sql",
    "009-fix-remaining-schema.sql",
    "010-create-course-store.sql",
    "011-create-topics-table.sql",
    "012-create-community-tables.sql",
    "012-seed-articles-topics.sql",
    "013-seed-comprehensive-courses.sql",
    "014-new-features.sql",
  ]

  for (const m of migrations) {
    await runFile(m)
  }

  const tables = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' ORDER BY table_name
  `
  console.log(`\nAll migrations complete. ${tables.length} tables:`)
  console.log(tables.map((t) => "  - " + t.table_name).join("\n"))
}

main().catch((e) => {
  console.error("Migration run failed:", e)
  process.exit(1)
})
