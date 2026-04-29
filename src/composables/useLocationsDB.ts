import { openDB } from 'idb'
import type { LocationData } from '@/utils/api.ts'

const DB_NAME = 'geo-image'
const DB_VERSION = 1
const STORE_NAME = 'results'

// export interface LocationData {
//   url: string
//   city: string
//   state: string
//   country: string
//   location: string
//
//   confidence: string
//   description: string
//   explanation: string
//   latitude?: number
//   longitude?: number
//
//   [key: string]: unknown
// }

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db, oldVersion) {
    //noinspection FallThroughInSwitchStatementJS
    switch (oldVersion /* NOSONAR */) {
      case 0: /* NOSONAR */ {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        })
        store.createIndex('url', 'url', { unique: true })
        store.createIndex('city', 'city', { unique: false })
        store.createIndex('state', 'state', { unique: false })
        store.createIndex('country', 'country', { unique: false })
        store.createIndex('location', 'location', { unique: false })
      }
      // case 1:
      //   console.log('future upgrade logic')
    }
  },
})

export function useLocationsDB() {
  const locationDBChannel = new BroadcastChannel('locationDB')

  async function addLocation(entry: Omit<LocationData, 'id'>): Promise<IDBValidKey> {
    const db = await dbPromise
    const result = db.add(STORE_NAME, entry)
    locationDBChannel.postMessage('change')
    return result
  }

  async function getByUrl(url: string): Promise<LocationData | undefined> {
    const db = await dbPromise
    return db.getFromIndex(STORE_NAME, 'url', url)
  }

  async function getById(id: number): Promise<LocationData | undefined> {
    const db = await dbPromise
    return db.get(STORE_NAME, id)
  }

  async function getAllLocations(): Promise<LocationData[]> {
    const db = await dbPromise
    return db.getAll(STORE_NAME)
  }

  async function getByCity(city: string): Promise<LocationData[]> {
    const db = await dbPromise
    return db.getAllFromIndex(STORE_NAME, 'city', city)
  }

  async function getByState(state: string): Promise<LocationData[]> {
    const db = await dbPromise
    return db.getAllFromIndex(STORE_NAME, 'state', state)
  }

  async function getByCountry(country: string): Promise<LocationData[]> {
    const db = await dbPromise
    return db.getAllFromIndex(STORE_NAME, 'country', country)
  }

  async function getByLocation(location: string): Promise<LocationData[]> {
    const db = await dbPromise
    return db.getAllFromIndex(STORE_NAME, 'location', location)
  }

  async function deleteLocation(id: number): Promise<void> {
    const db = await dbPromise
    const result = db.delete(STORE_NAME, id)
    locationDBChannel.postMessage('change')
    return result
  }

  async function updateLocation(entry: LocationData): Promise<IDBValidKey> {
    const db = await dbPromise
    const result = db.put(STORE_NAME, entry)
    locationDBChannel.postMessage('change')
    return result
  }

  return {
    addLocation,
    getById,
    getAllLocations,
    getByCity,
    getByUrl,
    getByState,
    getByCountry,
    getByLocation,
    deleteLocation,
    updateLocation,
    locationDBChannel,
  }
}
