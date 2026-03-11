import bcrypt from "bcryptjs"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

// ── Admin account details ────────────────────────────────────
// EXECUTED SUCCESSFULLY on 2026-03-02. Credentials removed post-execution.
// To re-run, set ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME as environment variables.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const ADMIN_NAME = process.env.ADMIN_NAME || "Admin"

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD env vars before running.")
  process.exit(1)
}

// ── 1. Validate email format ─────────────────────────────────
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!emailRegex.test(ADMIN_EMAIL)) {
  console.error("VALIDATION FAILED: Invalid email format.")
  process.exit(1)
}
console.log("Email format validated.")

// ── 2. Verify password strength ──────────────────────────────
const checks = [
  { test: ADMIN_PASSWORD.length >= 10, msg: "at least 10 characters" },
  { test: /[A-Z]/.test(ADMIN_PASSWORD), msg: "an uppercase letter" },
  { test: /[a-z]/.test(ADMIN_PASSWORD), msg: "a lowercase letter" },
  { test: /[0-9]/.test(ADMIN_PASSWORD), msg: "a digit" },
  { test: /[^A-Za-z0-9]/.test(ADMIN_PASSWORD), msg: "a special character" },
]
const failures = checks.filter((c) => !c.test)
if (failures.length > 0) {
  console.error(
    "VALIDATION FAILED: Password must contain " +
      failures.map((f) => f.msg).join(", ") +
      "."
  )
  process.exit(1)
}
console.log("Password strength validated (length, uppercase, lowercase, digit, special char).")

// ── 3. Check for duplicate email ─────────────────────────────
const existing = await sql`SELECT id, role FROM users WHERE email = ${ADMIN_EMAIL}`
if (existing.length > 0) {
  if (existing[0].role === "admin") {
    console.log("Admin account with this email already exists. Updating password hash.")
    const hash = bcrypt.hashSync(ADMIN_PASSWORD, 12)
    await sql`
      UPDATE users
      SET password_hash = ${hash}, is_active = true, updated_at = now()
      WHERE email = ${ADMIN_EMAIL}
    `
    console.log("Password updated successfully for existing admin account.")
    process.exit(0)
  } else {
    console.log("Account exists as regular user. Promoting to admin and updating password.")
    const hash = bcrypt.hashSync(ADMIN_PASSWORD, 12)
    await sql`
      UPDATE users
      SET password_hash = ${hash}, role = 'admin', is_active = true, updated_at = now()
      WHERE email = ${ADMIN_EMAIL}
    `
    console.log("Account promoted to admin with updated credentials.")
    process.exit(0)
  }
}

// ── 4. Hash password with bcrypt (cost factor 12) ────────────
console.log("Hashing password with bcrypt (cost factor 12)...")
const passwordHash = bcrypt.hashSync(ADMIN_PASSWORD, 12)
console.log("Password hashed successfully.")

// ── 5. Insert admin user into database ───────────────────────
const userId = crypto.randomUUID()
await sql`
  INSERT INTO users (id, name, email, password_hash, role, is_active, created_at)
  VALUES (${userId}, ${ADMIN_NAME}, ${ADMIN_EMAIL}, ${passwordHash}, 'admin', true, now())
`

console.log("─────────────────────────────────────────────")
console.log("Admin account created successfully.")
console.log("  ID:    " + userId)
console.log("  Name:  " + ADMIN_NAME)
console.log("  Email: " + ADMIN_EMAIL)
console.log("  Role:  admin")
console.log("─────────────────────────────────────────────")
