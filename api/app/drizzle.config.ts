import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './app/lib/db/schema.ts',
  out: './migrations',
  dialect: 'sqlite',
})
