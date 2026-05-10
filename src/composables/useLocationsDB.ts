import { openDB } from 'idb'

const DB_NAME = 'geo-image'
const DB_VERSION = 1
const STORE_NAME = 'results'

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

type InitialLocation = {
  url?: string
  blob?: Blob
}

export function useLocationsDB() {
  const locationDBChannel = new BroadcastChannel('locationDB')

  async function newLocation(entry: InitialLocation): Promise<IDBValidKey> {
    const db = await dbPromise
    const result = db.add(STORE_NAME, entry)
    // locationDBChannel.postMessage('change')
    return result
  }

  async function addBlobById(id: IDBValidKey, blob: Blob): Promise<IDBValidKey> {
    const db = await dbPromise
    const existing = await db.get(STORE_NAME, id)
    const result = db.put(STORE_NAME, { ...existing, blob })
    // locationDBChannel.postMessage('change')
    return result
  }

  async function updateById(
    id: IDBValidKey,
    entry: Partial<LocationData>,
  ): Promise<IDBValidKey> {
    const db = await dbPromise
    const existing = await db.get(STORE_NAME, id)
    if (!existing) throw new Error(`No entry for ID: ${String(id)}`)
    const result = await db.put(STORE_NAME, { ...existing, ...entry })
    locationDBChannel.postMessage('change')
    return result
  }

  // async function addBlobToId(
  //   id: IDBValidKey,
  //   entry: InitialLocation & { blob: Blob },
  // ): Promise<IDBValidKey> {
  //   const db = await dbPromise
  //   const result = db.put(STORE_NAME, { ...entry, id })
  //   locationDBChannel.postMessage('change')
  //   return result
  // }

  async function addLocation(entry: Omit<LocationData, 'id'>): Promise<IDBValidKey> {
    const db = await dbPromise
    const result = await db.add(STORE_NAME, entry)
    locationDBChannel.postMessage('change')
    return result
  }

  async function getByUrl(url: string): Promise<LocationData | undefined> {
    if (url.startsWith('data')) return undefined
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
    const result = await db.delete(STORE_NAME, id)
    locationDBChannel.postMessage('change')
    return result
  }

  async function updateLocation(entry: LocationData): Promise<IDBValidKey> {
    const db = await dbPromise
    const result = await db.put(STORE_NAME, entry)
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
    newLocation,
    addBlobById,
    updateById,
    deleteLocation,
    updateLocation,
    locationDBChannel,
  }
}
