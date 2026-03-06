import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.config.ts'

export default defineConfig(({ mode }) => {
  console.log('mode:', mode)
  const isFirefox = mode === 'firefox'
  console.log('isFirefox:', isFirefox)
  const browser = isFirefox ? 'firefox' : 'chrome'
  console.log('browser:', browser)

  return {
    resolve: {
      alias: {
        '@': `${path.resolve(__dirname, 'src')}`,
        '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
        '~bootswatch': path.resolve(__dirname, 'node_modules/bootswatch'),
      },
    },
    plugins: [vue(), crx({ browser: browser, manifest })],
    server: {
      cors: {
        origin: [/chrome-extension:\/\//, /moz-extension:\/\//],
      },
    },
    build: {
      rollupOptions: {
        input: {
          permissions: 'src/permissions/index.html',
          popout: 'src/popout/index.html',
          page: 'src/page/index.html',
          sidepanel: 'src/sidepanel/index.html',
        },
      },
    },
    // NOTE: This silences bootstrap deprecation warnings
    css: {
      preprocessorOptions: {
        scss: {
          quietDeps: true,
          silenceDeprecations: [
            'import',
            'color-functions',
            'global-builtin',
            'if-function',
          ],
        },
      },
    },
  }
})
