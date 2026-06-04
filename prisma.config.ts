import { config } from 'dotenv'
import { defineConfig } from 'prisma/config'

// Prisma CLI does not read .env.local automatically (that is a Next.js convention).
// Load it explicitly so migrate / studio / seed all use the correct DATABASE_URL.
config({ path: '.env.local' })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Use the direct (non-pooled) URL for DDL — Neon pooler does not support it
    url: process.env.DATABASE_DIRECT_URL ?? process.env.DATABASE_URL,
  },
})
