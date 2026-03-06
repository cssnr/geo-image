import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json'

const icons = {
  16: 'images/logo16.png',
  32: 'images/logo32.png',
  48: 'images/logo48.png',
  96: 'images/logo96.png',
  128: 'images/logo128.png',
}

export default defineManifest(({ mode }) => {
  console.log('mode:', mode)
  const isFirefox = mode === 'firefox'
  console.log('isFirefox:', isFirefox)

  const config = {
    manifest_version: 3,
    name: 'GeoImage',
    version: pkg.version,
    description: pkg.description,
    homepage_url: 'https://github.com/cssnr/geo-image',
    icons: icons,
    action: {
      default_icon: icons,
      default_popup: 'src/popup/index.html',
    },
    options_ui: {
      page: 'src/options/index.html',
      open_in_tab: true,
    },
    permissions: ['contextMenus', 'storage'],
    host_permissions: ['*://*/*'],
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
  }

  if (isFirefox) {
    console.log('Firefox')
    Object.assign(config, {
      background: {
        scripts: ['src/background/index.ts'],
        type: 'module',
      },
      sidebar_action: {
        default_panel: 'src/sidepanel/index.html',
        default_title: 'GeoImage',
        open_at_install: false,
        default_icon: icons,
      },
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
      // content_security_policy: {
      //   extension_pages: "script-src 'self' http://localhost:5173; object-src 'self'",
      // },
    })
  } else {
    console.log('Chrome')
    config.permissions.push('sidePanel')
    Object.assign(config, {
      background: {
        service_worker: 'src/background/index.ts',
        type: 'module',
      },
      side_panel: { default_path: 'src/sidepanel/index.html' },
      minimum_chrome_version: '127',
    })
  }

  console.log('config:', config)
  return config
})
