import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { randomBytes } from "crypto"

const env = readFileSync(".env.local", "utf8")
const get = (key) => env.match(new RegExp(`${key}=(.+)`))?.[1]?.trim()

const supabase = createClient(get("NEXT_PUBLIC_SUPABASE_URL"), get("SUPABASE_SERVICE_ROLE_KEY"))

const email = process.argv[2]
if (!email) {
  console.error("Usage: node scripts/create-editor-user.mjs <email>")
  process.exit(1)
}

const password = randomBytes(9).toString("base64").replace(/[+/=]/g, "x")

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  app_metadata: { role: "editor" },
})

if (error) {
  console.error("Failed:", error.message)
  process.exit(1)
}

console.log("Editor account created:")
console.log("  email:   ", data.user.email)
console.log("  password:", password)
console.log("  user id: ", data.user.id)
