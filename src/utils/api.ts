import { i18n } from '#imports'
import { debug } from '@/utils/logger.ts'
import { getOptions } from '@/utils/options.ts'
import { useLocationsDB } from '@/composables/useLocationsDB'
import { sendWebhooks } from '@/utils/webhooks.ts'
import { getFakeData } from '@/utils/fake.ts'
import { ApiError, createUserContent, GoogleGenAI } from '@google/genai'

const { addLocation, getByUrl } = useLocationsDB()

export interface LocationData {
  id?: number

  url: string
  city: string
  state: string
  country: string
  location: string

  description: string
  explanation: string
  confidence: number
  latitude?: number
  longitude?: number

  [key: string]: unknown
}

// Helper Function to Process a URL
export async function processUrl(url?: string | null): Promise<LocationData> {
  if (!url) throw new Error('No URL in Query!')

  // Get Existing Result
  const result = await getByUrl(url)
  debug('result:', result)
  if (result) {
    debug(`%c Found Result ID: ${result.id}`, 'color: Lime')
    return result
  }

  // Get New Result
  const data = await downloadAndProcess(url)

  // Save to IDB
  const idbKey = await addLocation(data)
  debug(`%c Added Result ID: ${idbKey as number}`, 'color: Yellow')

  // Send Webhooks
  sendWebhooks(data).catch(console.error)

  return data
}

async function downloadAndProcess(url: string): Promise<LocationData> {
  if (!import.meta.env.WXT_FAKE_DATA) {
    // Download image
    const { base64, mimeType } = await downloadImage(url)
    // Get API data
    const data = await getData(mimeType, base64)
    if (!data) throw new Error('No Data in Response!')
    // Add URL to data
    data.url = url
    debug('data:', data)
    return data
  } else {
    // Fake Data
    const data = await getFakeData(url)
    if (import.meta.env.WXT_FAKE_DELAY) {
      const timeout = Number.parseInt(import.meta.env.WXT_FAKE_DELAY) * 1000
      await new Promise((resolve) => setTimeout(resolve, timeout))
    }
    return data!
  }
}

async function getData(mimeType: string, data: string) {
  debug('getData:', mimeType)

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
    console.error(e)
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

async function downloadImage(url: string) {
  debug('downloadImage:', url)
  const response = await fetch(url)
  if (response.status !== 200) {
    const error = `Download Error: ${response.status}: ${response.statusText}`
    throw new Error(error)
  }
  const buffer = await response.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000 // 32KB
  let binary = ''
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + chunkSize)),
    )
  }
  const base64 = btoa(binary)

  const mimeType = response.headers.get('content-type')
  debug('mimeType:', mimeType)
  if (!mimeType?.toLowerCase().startsWith('image')) {
    throw new Error(`Unknown/Unsupported MIME Type: ${mimeType}`)
  }
  return { base64, mimeType }
}

export function getGeoUrl(data: LocationData): string {
  if (!data.latitude || !data.longitude) return ''

  const latDir = data.latitude >= 0 ? 'N' : 'S'
  const lonDir = data.longitude >= 0 ? 'E' : 'W'

  const lat = Math.abs(data.latitude)
  const lon = Math.abs(data.longitude)

  const pagename = encodeURIComponent(`${data.country}, ${data.state}, ${data.city}`)
  return `https://geohack.toolforge.org/geohack.php?params=${lat}_${latDir}_${lon}_${lonDir}&pagename=${pagename}`
}
