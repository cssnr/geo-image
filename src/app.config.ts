// https://wxt.dev/guide/essentials/config/runtime.html
import { defineAppConfig } from '#imports'

const manifest = chrome.runtime.getManifest()

declare module 'wxt/utils/define-app-config' {
  // noinspection JSUnusedGlobalSymbols
  export interface WxtAppConfig {
    version: string
    uninstallUrl: string
  }
}

export default defineAppConfig({
  version: manifest.version,
  uninstallUrl: 'https://cssnr.github.io/feedback/?name=geo-image',
})
