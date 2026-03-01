// JS for page.html

import {
    checkPerms,
    grantPerms,
    linkClick,
    onAdded,
    onRemoved,
    openPopup,
    revokePerms,
    updatePlatform,
} from './export.js'

chrome.permissions.onAdded.addListener(onAdded)
chrome.permissions.onRemoved.addListener(onRemoved)

document.addEventListener('DOMContentLoaded', domContentLoaded)
document
    .querySelectorAll('.revoke-permissions')
    .forEach((el) => el.addEventListener('click', revokePerms))
document
    .querySelectorAll('.grant-permissions')
    .forEach((el) => el.addEventListener('click', grantPerms))
document
    .querySelectorAll('a[href]')
    .forEach((el) => el.addEventListener('click', linkClick))
document
    .querySelectorAll('.open-popup')
    .forEach((el) => el.addEventListener('click', openPopup))
document
    .querySelectorAll('[data-bs-toggle="tooltip"]')
    .forEach((el) => new bootstrap.Tooltip(el))

const alertEl = document.getElementById('alert')
const loadingEl = document.getElementById('loading')
const resultsEl = document.getElementById('results')

/**
 * DOMContentLoaded
 * @function domContentLoaded
 */
async function domContentLoaded() {
    console.debug('domContentLoaded')
    updatePlatform().catch((e) => console.warn(e))

    // Check Host Permissions
    checkPerms().then((hasPerms) => {
        if (!hasPerms) console.log('%cHost Permissions Not Granted', 'color: Red')
    })

    // Get Options
    // chrome.storage.sync.get(['options']).then((items) => {
    //     console.debug('options:', items.options)
    // })

    // Process URL
    processUrl().catch((e) => {
        console.warn(e)
        loadingEl.classList.add('d-none')
        alertEl.classList.remove('d-none')
        alertEl.textContent = e.message
    })
}

async function processUrl() {
    const params = new URLSearchParams(window.location.search)
    const url = params.get('url')
    console.debug('url:', url)
    if (!url) throw new Error('No URL in Query!')

    document.getElementById('image').src = url
    const result = await chrome.storage.local.get(url)
    let data = result[url]
    if (!data) {
        const { base64, mimeType } = await downloadImage(url)
        data = await getData(mimeType, base64)
        if (!data) throw new Error('No Data in Response!')
        await chrome.storage.local.set({ [url]: data })
    }
    console.log('data:', data)

    document.getElementById('country').textContent = data.country
    document.getElementById('city').textContent = data.city
    document.getElementById('state').textContent = data.state
    document.getElementById('location').textContent = data.location
    document.getElementById('description').textContent = data.description
    // noinspection JSUnresolvedReference
    document.getElementById('explanation').textContent = data.explanation

    document.getElementById('latitude').textContent = data.coordinates?.latitude || 'N/A'
    document.getElementById('longitude').textContent =
        data.coordinates?.longitude || 'N/A'

    loadingEl.classList.add('d-none')
    resultsEl.classList.remove('d-none')

    getGeoUrl(data).then((href) => {
        const el = document.getElementById('geo')
        el.href = href
        el.classList.remove('d-none')
    })
}

async function getGeoUrl(data) {
    const { latitude, longitude } = data.coordinates
    console.log('latitude, longitude:', latitude, longitude)

    const latDir = latitude >= 0 ? 'N' : 'S'
    const lonDir = longitude >= 0 ? 'E' : 'W'

    const lat = Math.abs(latitude)
    const lon = Math.abs(longitude)

    const pagename = encodeURIComponent(`${data.country}, ${data.state}, ${data.city}`)
    return `https://geohack.toolforge.org/geohack.php?params=${lat}_${latDir}_${lon}_${lonDir}&pagename=${pagename}`
}

const geoPrompt = `You are an expert geolocation analyst. Your task is to determine the precise geographic location shown in an image using a systematic, hierarchical chain-of-thought methodology.
You MUST respond with a valid JSON object in the following format:

{
  "country": "Country name",
  "state": "State/region/province",
  "city": "City or nearest settlement",
  "confidence": "High/Medium/Low",
  "coordinates": {
    "latitude": 12.3456,
    "longitude": 78.9012
  },
  "location": "Human readable address, street, location, place, site, etc.",
  "description": "A short 3-5 sentence summary: what you see, what it tells you, and your conclusion.",
  "explanation": "Concise summary of the key evidence supporting this specific location."
}
`

/**
 * Download Image and Process Result
 * @param {string} mimeType
 * @param {string} base64
 * @return {Promise<object|undefined>}
 */
export async function getData(mimeType, base64) {
    console.log('downloadAndProcess:', mimeType)

    const { options } = await chrome.storage.sync.get(['options'])
    // console.log('API Key:', options.authToken)
    if (!options.authToken) throw new Error('Set API Key in Options!')

    const headers = {
        'Content-Type': 'application/json',
        'x-goog-api-key': options.authToken,
    }
    // console.log('headers:', headers)

    const request = {
        contents: [
            {
                parts: [
                    { inline_data: { mime_type: mimeType, data: base64 } },
                    { text: geoPrompt },
                ],
            },
        ],
    }
    // console.log('request:', request)

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

async function downloadImage(url) {
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
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize))
    }
    const base64 = btoa(binary)

    const mimeType = response.headers.get('content-type')
    console.log('mimeType:', mimeType)
    if (!mimeType?.toLowerCase()?.startsWith('image')) {
        throw new Error(`Unknown/Unsupported MIME Type: ${mimeType}`)
    }
    return { base64, mimeType }
}
