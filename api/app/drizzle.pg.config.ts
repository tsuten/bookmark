import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './app/lib/db/postgres/schema.ts',
  out: './migrations-pg',
  dialect: 'postgresql',
})
