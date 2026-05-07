import { getOptions } from '@/utils/options.ts'
import { useLocationsDB } from '@/composables/useLocationsDB'
import { sendWebhooks } from '@/utils/webhooks.ts'

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

  const result = await getByUrl(url)
  console.log('result:', result)
  if (result) {
    console.log(`%c Found Result ID: ${result.id}`, 'color: Lime')
    return result
  }

  // Download image
  const { base64, mimeType } = await downloadImage(url)
  // Get API data
  const data = await getData(mimeType, base64)
  if (!data) throw new Error('No Data in Response!')
  // Add URL to data
  data.url = url
  console.log('data:', data)

  // // Fake Data
  // const cities = ['Austin', 'Harlingen', 'Seattle', 'Elgin', 'Cleveland']
  // const locations = ['BFE Airport', 'Lone Star', 'Tranquility Base', 'Taurus Littrow']
  // const data: LocationData = {
  //   url: url,
  //   city: cities[Math.floor(Math.random() * cities.length)],
  //   state: 'Texas',
  //   country: 'USA',
  //   location: locations[Math.floor(Math.random() * locations.length)],
  //   description: 'Multiple Wal-Marts, Expressways, and an International Airport.',
  //   explanation: 'I cant explain this...',
  //   latitude: 32.4224,
  //   longitude: -99.8524,
  //   confidence: Math.floor(Math.random() * 30) + 69,
  // }
  // console.log('data:', data)
  // await new Promise((resolve) => setTimeout(resolve, 5000))

  // Save data to IDB
  const idbKey = await addLocation(data)
  console.log(`%c Added Result ID: ${idbKey as number}`, 'color: Yellow')

  sendWebhooks(data).catch(console.error)

  return data as LocationData
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

export async function getData(mimeType: string, base64: string) {
  console.log('downloadAndProcess:', mimeType)

  const options = await getOptions()
  console.log('options:', options)
  console.log('API Key:', options.authToken.slice(0, 8))
  if (!options.authToken) throw new Error('Set API Key in Options!')

  const lang = chrome.i18n.getUILanguage()
  const instructions = `Always respond in the language with BCP-47 code "${lang}" and with a valid JSON object.`
  console.log('instructions:', instructions)

  const prompt = `${options.geoPrompt}\n\nYou MUST respond with a valid JSON object in the following format:\n\n${options.geoJSON}`
  console.log('prompt:', prompt)

  const request = {
    system_instruction: { parts: [{ text: instructions }] },
    contents: [
      {
        parts: [{ inline_data: { mime_type: mimeType, data: base64 } }, { text: prompt }],
      },
    ],
  }
  // console.log('request:', request)

  const headers = {
    'Content-Type': 'application/json',
    'x-goog-api-key': options.authToken,
  }
  // console.log('headers:', headers)

  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    { method: 'POST', headers, body: JSON.stringify(request) },
  )
  console.log('response.status:', response.status)
  if (response.status !== 200) {
    const body = await response.json()
    console.log('body:', body)
    throw new Error(`Gemini Error: ${response.status}: ${body.error.message}`)
  }

  const data = await response.json()
  console.log('data:', data)
  const content = data.candidates[0].content.parts[0].text
  console.log('content:', content)
  const result = JSON.parse(content.replace(/```json|```/g, '').trim())
  console.log('result:', result)
  return result
}

async function downloadImage(url: string) {
  console.log('downloadImage:', url)
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
  console.log('mimeType:', mimeType)
  if (!mimeType?.toLowerCase().startsWith('image')) {
    throw new Error(`Unknown/Unsupported MIME Type: ${mimeType}`)
  }
  return { base64, mimeType }
}
