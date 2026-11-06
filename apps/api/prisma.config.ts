import { defineConfig } from 'prisma/config'
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(__dirname, '.env') })

export default defineConfig({
  datasources: {
    db: {
      url: process.env.DATABASE_URL ?? '',
      directUrl: process.env.DIRECT_URL ?? '',
    },
  },
})