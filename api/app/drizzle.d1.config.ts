import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './app/lib/db/d1/schema.ts',
  out: './migrations',
  dialect: 'sqlite',
})
