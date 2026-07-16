import build from '@hono/vite-build/cloudflare-workers'
import adapter from '@hono/vite-dev-server/cloudflare'
import honox from 'honox/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  ssr: {
    external: ['mongoose'],
  },
  plugins: [
    honox({
      devServer: {
        adapter: (options) =>
          adapter({
            ...options,
            proxy: {
              configPath: './wrangler.jsonc',
            },
          }),
      },
    }),
    build(),
  ],
})
