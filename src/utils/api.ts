import { i18n } from '#imports'
import { debug } from '@/utils/logger.ts'
import { openPage } from '@/utils/extension.ts'
import { getOptions } from '@/utils/options.ts'
import { getFakeData } from '@/utils/fake.ts'
import { sendWebhooks } from '@/utils/webhooks.ts'
import { useLocationsDB } from '@/composables/useLocationsDB'
import { ApiError, createUserContent, GoogleGenAI } from '@google/genai'

const { addBlobById, deleteLocation, getByUrl, newLocation, updateById } =
  useLocationsDB()

// TODO: Error Handling

export async function processNewUrl(url?: string) {
  debug('processNewUrl:', url?.slice(0, 32))

  // TODO: Temporary Stop-Gap Check
  const options = await getOptions()
  debug('options:', options)
  if (!options.authToken) {
    await chrome.storage.local.set({ lastError: i18n.t('ui.error.setApiKey') })
    await openPage(0)
    return
  }

  if (!url) throw new Error('Missing URL')
  let idbKey
  if (!url.startsWith('data')) {
    debug('%c processNewUrl - URL', 'color: Yellow')
    const result = await getByUrl(url)
    debug('result:', result)
    if (result?.id) {
      debug(`%c FOUND EXISTING RESULT ID: ${result.id}`, 'color: Lime')
      await openPage(result.id)
      return
    }
    idbKey = await newLocation({ url })
  } else {
    debug('%c processNewUrl - DATA', 'color: Yellow')
    const response = await fetch(url)
    const blob = await response.blob()
    debug('blob:', blob)
    idbKey = await newLocation({ blob })
  }
  const id = idbKey as number
  debug('idbKey:', id)

  openPage(id).catch(console.error)
  let error: string
  processIdUrl(id, url)
    .then(() => {
      debug('SUCCESS')
    })
    .catch(async (e) => {
      debug('ERROR', e)
      error = e.message
      chrome.storage.local.set({ lastError: error }).catch(console.debug)
      await deleteLocation(id) // TODO: Handle Errors
    })
    .finally(() => {
      debug('FINALLY')
      const message = { newLocation: id, error }
      chrome.runtime.sendMessage(message).catch(console.debug)
    })
}

async function processIdUrl(id: number, url: string) {
  debug('processIdUrl:', id, url.slice(0, 32))
  const [mimeType, base64] = await parseOrDownload(id, url)
  debug('mimeType:', mimeType)
  debug('base64:', base64)

  // Get Data
  const data = await getData(mimeType, base64)
  debug('data:', data)
  if (!data) throw new Error('No Data in Response!')
  data.id = id
  await updateById(id, data)
  debug(`%c Added Result ID: ${id}`, 'color: Yellow')

  // Send Webhooks
  sendWebhooks(data).catch(console.error)

  // // NOTE: This is done in the outer method now...
  // chrome.runtime.sendMessage({ newLocation: id }).catch(console.error)
}

async function getData(mimeType: string, data: string) {
  debug('getData:', mimeType, data.slice(0, 32))

  if (import.meta.env.WXT_FAKE_DATA) {
    debug('%c --- FAKE DATA FAKE DATA FAKE ---', 'color: Lime')
    if (import.meta.env.WXT_FAKE_DELAY) {
      const timeout = Number.parseInt(import.meta.env.WXT_FAKE_DELAY) * 1000
      await new Promise((resolve) => setTimeout(resolve, timeout))
    }
    return await getFakeData()
  }

  const options = await getOptions()
  debug('options:', options)
  if (!options.authToken) throw new Error(i18n.t('ui.error.setApiKey'))

  const lang = chrome.i18n.getUILanguage()
  const instructions = `Always respond in the language with BCP-47 code "${lang}" and with a valid JSON object.`
  debug('instructions:', instructions)

  const prompt = `${options.geoPrompt}\n\nYou MUST respond with a valid JSON object in the following format:\n\n${options.geoJSON}`
  debug('prompt:', prompt)

  const ai = new GoogleGenAI({ apiKey: options.authToken })
  const contents = createUserContent([prompt, { inlineData: { mimeType, data } }])
  debug('contents:', contents)

  let response
  try {
    response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: { systemInstruction: instructions },
      contents,
    })
    debug('response:', response)
  } catch (e) {
    debug('catch error:', e)
    if (e instanceof ApiError) {
      debug('ApiError', e.message)
      const error = JSON.parse(e.message)
      debug('error', error)
      throw new Error(error.message, { cause: e })
    }
    const message = e instanceof Error ? e.message : i18n.t('ui.error.unknown')
    throw new Error(message, { cause: e })
  }

  debug('response.text:', response.text)
  if (!response?.text) throw new Error('No Response Text')
  const result = JSON.parse(response.text.replaceAll(/```json|```/g, '').trim())
  debug('result:', result)
  return result
}

async function parseOrDownload(id: number, url: string) {
  if (url.startsWith('data:')) {
    const [meta, base64] = url.split(',')
    debug('meta:', meta)
    debug('base64:', base64)
    const mimeType = meta.split(':')[1].split(';')[0]
    return [mimeType, base64]
  } else {
    // await new Promise((resolve) => setTimeout(resolve, 1000))
    const blob = await downloadImage(url)
    debug('downloadImage - blob:', blob)
    await addBlobById(id, blob)
    const mimeType = blob.type
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve((reader.result as string).split(',')[1])
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
    return [mimeType, base64]
  }
}

async function downloadImage(url: string): Promise<Blob> {
  debug('downloadImage:', url)
  const response = await fetch(url)
  if (response.status !== 200) {
    throw new Error(`Download Error: ${response.status}: ${response.statusText}`)
  }

  const mimeType = response.headers.get('content-type')
  debug('mimeType:', mimeType)
  if (!mimeType?.toLowerCase().startsWith('image')) {
    throw new Error(`Unknown/Unsupported MIME Type: ${mimeType}`)
  }

  return response.blob()
}

// TODO: This does not belong here...
export function getGeoUrl(data: LocationData): string {
  if (!data.latitude || !data.longitude) return ''

  const latDir = data.latitude >= 0 ? 'N' : 'S'
  const lonDir = data.longitude >= 0 ? 'E' : 'W'

  const lat = Math.abs(data.latitude)
  const lon = Math.abs(data.longitude)

  const pagename = encodeURIComponent(`${data.country}, ${data.state}, ${data.city}`)
  return `https://geohack.toolforge.org/geohack.php?params=${lat}_${latDir}_${lon}_${lonDir}&pagename=${pagename}`
}

// function base64ToBlob(base64: string, mimeType: string): Blob {
//   const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
//   return new Blob([bytes], { type: mimeType })
// }

// function dataUrlToBlob(dataUrl: string): Blob {
//   const [header, base64] = dataUrl.split(',')
//   const mimeType = header.match(/:(.*?);/)?.[1] ?? 'application/octet-stream'
//
//   const bytes = atob(base64)
//   const buffer = new Uint8Array(bytes.length)
//   for (let i = 0; i < bytes.length; i++) {
//     buffer[i] = bytes.charCodeAt(i)
//   }
//
//   return new Blob([buffer], { type: mimeType })
// }
