import { defineConfig } from 'wxt'

// NOTE: Icons are also defined in <mata> tags for:
//    popup/index.html
//    sidepanel/index.html
const icons = {
  16: 'images/logo16.png',
  24: 'images/logo24.png',
  32: 'images/logo32.png',
  48: 'images/logo48.png',
  96: 'images/logo96.png',
  128: 'images/logo128.png',
}

// See https://wxt.dev/api/config.html
// noinspection JSUnusedGlobalSymbols
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-vue'],

  manifest: ({ browser }) => {
    const isFirefox = browser === 'firefox'
    console.log('isFirefox:', isFirefox)

    return {
      icons,
      name: 'GeoImage',
      description: 'GeoImage Web Extension to Locate Images using Gemini AI.',
      homepage_url: 'https://github.com/cssnr/geo-image',
      permissions: ['contextMenus', 'storage'],
      host_permissions: ['*://*/*'],

      // // NOTE: This is set in options/index.html <meta>
      // options_ui: {
      //   page: 'options.html',
      //   open_in_tab: true,
      // },

      // // NOTE: This is set in popup/index.html <meta>
      // action: {
      //   default_icon: {
      //     16: 'images/logo16.png',
      //     32: 'images/logo32.png',
      //     48: 'images/logo48.png',
      //     96: 'images/logo96.png',
      //     128: 'images/logo128.png',
      //   },
      // },

      // ...(isFirefox && {
      //   page_action: {
      //     default_popup: 'popup.html',
      //     default_icon: icons,
      //     show_matches: ['*://*/*'],
      //   },
      // }),

      commands: {
        openSidePanel: {
          description: 'Open Side Panel',
          suggested_key: { default: 'Alt+Shift+P' },
        },
        openExtPanel: {
          description: 'Open Extension Panel',
          suggested_key: { default: 'Alt+Shift+W' },
        },
        _execute_action: {
          description: 'Open Popup',
          suggested_key: { default: 'Alt+Shift+A' },
        },
        openOptions: {
          description: 'Open Options',
          suggested_key: { default: 'Alt+Shift+O' },
        },
      },

      ...(isFirefox && {
        browser_specific_settings: {
          gecko: {
            id: 'geo-image@cssnr.com',
            strict_min_version: '112.0',
            data_collection_permissions: {
              required: ['none'],
            },
            update_url:
              'https://raw.githubusercontent.com/cssnr/geo-image/master/update.json',
          },
          gecko_android: {
            strict_min_version: '120.0',
          },
        },
      }),
    }
  },

  // NOTE: Override with web-ext.config.ts
  webExt: {
    disabled: true,
  },

  vite: () => ({
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
  }),
})
