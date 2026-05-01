import { getGeoUrl, LocationData } from '@/utils/api.ts'

export interface Webhook {
  name: string
  url: string
}

export const WEBHOOKS_KEY = 'webhooks'

// noinspection JSUnusedGlobalSymbols
export async function getWebhook(name: string): Promise<Webhook> {
  const items = await chrome.storage.sync.get([WEBHOOKS_KEY])
  console.log('getWebhook - items:', items)
  const results = (items?.[WEBHOOKS_KEY] || []) as Webhook[]
  console.log('results:', results)
  const result = results.find((r: Webhook) => r.name === name)
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
    throw new Error('Webhooks already exists')
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
  console.log('webhooks:', webhooks)
  webhooks.forEach((hook) => {
    console.log('hook:', hook)
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
      footer: { text: `GeoImage - ${loc.latitude}, ${loc.longitude}`, icon_url: logo },
    }
    const data = { username: 'GeoImage', avatar_url: logo, embeds: [embed] }
    console.log('data:', data)
    postToDiscord(hook.url, data).catch(console.error)
  })
}

export async function postToDiscord(url: string, data: any) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  console.log('response.status:', response.status)
  console.log('response:', response)
  if (!response.ok) {
    const error = await response.json()
    console.log('error:', error)
    throw new Error(`Discord Error: ${error.message}`)
  }
}
