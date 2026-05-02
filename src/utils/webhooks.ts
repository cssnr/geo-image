import { getGeoUrl, LocationData } from '@/utils/api.ts'
import { showToast } from '@/composables/useToast.ts'

export interface Webhook {
  name: string
  url: string
}

export const WEBHOOKS_KEY = 'webhooks'

export async function getWebhook(url: string): Promise<Webhook> {
  const items = await chrome.storage.sync.get([WEBHOOKS_KEY])
  console.log('getWebhook - items:', items)
  const results = (items?.[WEBHOOKS_KEY] || []) as Webhook[]
  console.log('results:', results)
  const result = results.find((r: Webhook) => r.url === url)
  console.log('result:', result)
  return result as Webhook
}

export async function getWebhooks(): Promise<Webhook[]> {
  const items = await chrome.storage.sync.get([WEBHOOKS_KEY])
  console.log('getWebhooks - items:', items)
  const results = items?.[WEBHOOKS_KEY] || []
  console.log('results:', results)
  return results as Webhook[]
}

export async function addWebhook(name: string, url: string): Promise<void> {
  console.log(`addWebhook - name: ${name} - url:`, url)
  const item = { name, url }
  const data: Webhook[] = await getWebhooks()
  console.log('data:', data)
  if (data.some((item) => item.url === url)) {
    throw new Error('Webhook already exists')
  }
  data.push(item)
  console.log('data:', data)
  await chrome.storage.sync.set({ [WEBHOOKS_KEY]: data })
}

export async function deleteWebhook(url?: string): Promise<void> {
  console.log('deleteWebhook:', url)
  if (!url) return
  const data: Webhook[] = await getWebhooks()
  console.log('data:', data)
  const filtered = data.filter((s) => s.url !== url)
  console.log('filtered:', filtered)
  await chrome.storage.sync.set({ [WEBHOOKS_KEY]: filtered })
}

export async function sendWebhooks(loc: LocationData) {
  console.log('sendWebhooks:', loc)
  const webhooks = await getWebhooks()
  console.log(`webhooks: ${webhooks.length}:`, webhooks)
  for (const [i, hook] of webhooks.entries()) {
    console.log(`hook - ${i}:`, hook)
    const lines = [
      `### ${loc.city}, ${loc.state}, ${loc.country}`,
      loc.description,
      loc.explanation,
    ]
    const logo =
      'https://raw.githubusercontent.com/smashedr/repo-images/master/geo-image/logo512.png'
    const embed = {
      url: getGeoUrl(loc),
      image: { url: loc.url },
      title: loc.location,
      description: lines.join('\n'),
      color: 0xee00ff,
      timestamp: new Date().toISOString(),
      footer: { text: `GeoImage  ${loc.latitude}, ${loc.longitude}`, icon_url: logo },
    }
    const data = { username: 'GeoImage', avatar_url: logo, embeds: [embed] }
    console.log('data:', data)
    const seconds = await postToDiscord(hook.url, data)
    if (i < webhooks.length - 1) {
      const delay = (seconds || 1) * 1000 + 250 // NOSONAR
      console.log('Awaiting Delay:', delay)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
}

export async function postToDiscord(url: string, data: any): Promise<number | undefined> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    console.log('response:', response)
    console.log('headers:', response.headers)
    console.log('status:', response.status)
    console.log('ok:', response.ok)
    const seconds = response.headers.get('x-ratelimit-reset-after')
    console.log('x-ratelimit-reset-after:', seconds)
    if (!response.ok) {
      const error = await response.json()
      console.log('error:', error)
      // throw new Error(`Discord Error: ${error.message}`)
      showToast(`Error Sending Webhook: ${response.status}`, 'danger')
    }
    if (seconds) return Number.parseInt(seconds)
  } catch (e) {
    console.error(e)
    const message = e instanceof Error ? e.message : 'Unknown Error'
    showToast(`Error Sending Webhook: ${message}`, 'danger')
  }
}

export async function validateWebhook(url: string) {
  const response = await fetch(url)
  console.log('response.status:', response.status)
  console.log('response:', response)
  if (!response.ok) throw new Error(`Invalid Response Status: ${response.status}`)
  const data = await response.json()
  if (!data.token) throw new Error('Invalid Response Data!')
  return data
}
