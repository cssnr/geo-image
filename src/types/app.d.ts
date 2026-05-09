declare interface LocationData {
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

  data?: Blob

  [key: string]: unknown
}

type PageArgs = {
  srcUrl?: string
  id?: number
  open?: boolean
}
