import { defineConfig } from 'wxt'

// NOTE: Icons are also defined in <mata> tags for:
//    popup/index.html
//    sidepanel/index.html

// See https://wxt.dev/api/config.html
// noinspection JSUnusedGlobalSymbols
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-vue', '@wxt-dev/i18n/module', '@wxt-dev/auto-icons'],

  // https://wxt.dev/guide/essentials/config/auto-imports.html#disabling-auto-imports
  // imports: false,

  autoIcons: {
    enabled: true,
    baseIconPath: 'assets/icon.svg',
    developmentIndicator: false,
    // developmentIndicator: 'overlay',
    sizes: [96, 24], // Dfault: 128, 48, 32, 16
  },
  // NOTE: Icons are also defined in <mata> tags for:
  //    popup/index.html
  //    sidepanel/index.html

  // https://wxt.dev/guide/essentials/config/manifest.html
  manifest: ({ browser }) => {
    const isFirefox = browser === 'firefox'
    console.log('isFirefox:', isFirefox)

    return {
      default_locale: 'en',
      name: '__MSG_name__',
      // short_name: '__MSG_shortName__',
      description: '__MSG_description__',
      homepage_url: 'https://github.com/cssnr/geo-image',

      permissions: ['contextMenus', 'storage'],
      host_permissions: ['*://*/*'],

      commands: {
        _execute_action: {
          description: '__MSG_cmd_executeAction__',
          suggested_key: { default: 'Alt+Shift+A' },
        },
        openSidePanel: {
          description: '__MSG_cmd_openSidePanel__',
          suggested_key: { default: 'Alt+Shift+P' },
        },
        openExtPanel: {
          description: '__MSG_cmd_openExtPanel__',
          suggested_key: { default: 'Alt+Shift+W' },
        },
        openOptions: {
          description: '__MSG_cmd_openOptions__',
          suggested_key: { default: 'Alt+Shift+O' },
        },
      },

      ...(isFirefox
        ? {
            browser_specific_settings: {
              gecko: {
                id: 'geo-image@cssnr.com',
                strict_min_version: '112.0', // manifest - background.type
                data_collection_permissions: { required: ['none'] },
                update_url:
                  'https://raw.githubusercontent.com/cssnr/geo-image/master/update.json',
              },
              gecko_android: { strict_min_version: '120.0' }, // permissions.request
            },
          }
        : { minimum_chrome_version: '127' }), // chrome.action.openPopup
    }
  },

  // https://wxt.dev/guide/essentials/config/browser-startup.html
  // NOTE: Override with web-ext.config.ts
  webExt: {
    disabled: true,
  },

  // https://wxt.dev/guide/essentials/config/vite.html
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
