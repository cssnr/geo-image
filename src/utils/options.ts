import { GEO_JSON, GEO_PROMPT } from '@/utils/constants.ts'

export const defaultOptions = {
  authToken: '',
  contextMenu: true,
  showUpdate: false,
  geoPrompt: GEO_PROMPT,
  geoJSON: GEO_JSON,
}

export type Options = typeof defaultOptions & { [key: string]: unknown }

export async function getOptions(): Promise<Options> {
  let { options } = await chrome.storage.sync.get(['options'])
  options = options || {}
  return options as Options
}

// NOTE: This is a WIP to replace the VanillaJS saveOptions
export async function saveKeyValue(key: string, value: any) {
  console.debug(`saveKeyValue: ${key}:`, value)
  if (!key || value === undefined) return
  const options = await getOptions()
  if (options[key] === value) return
  options[key] = value
  console.log(`Set %c${key}:`, 'color: Lime', value)
  await chrome.storage.sync.set({ options })
}
