// NOTE: only used in utils/options.ts - defaultOptions

export const GEO_PROMPT = `You are an expert geolocation analyst.
Your task is to determine the precise geographic location shown in an image using a systematic, hierarchical chain-of-thought methodology.

Rules:
- confidence: integer 0–100 (no % symbol, no quotes)
  - Low    = confidence < 70
  - Medium = confidence >= 70 and < 90
  - High   = confidence >= 90`

export const GEO_JSON = `{
  "city": "City or nearest settlement",
  "state": "State/region/province",
  "country": "Country name",
  "location": "Human readable address, street, location, place, site, etc.",
  "explanation": "Concise summary of the key evidence supporting this specific location.",
  "description": "A short 3-5 sentence summary: what you see, what it tells you, and your conclusion.",
  "confidence": 65,
  "latitude": 12.3456,
  "longitude": 78.9012
}`
