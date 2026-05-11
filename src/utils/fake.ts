export async function getFakeData() {
  if (!import.meta.env.WXT_FAKE_DATA) return null
  const { faker } = await import('@faker-js/faker')
  return {
    city: faker.location.city(),
    state: faker.location.state(),
    country: faker.location.country(),
    location: faker.lorem.lines(1),
    description: faker.lorem.paragraph(),
    explanation: faker.lorem.paragraph(),
    latitude: faker.location.latitude(),
    longitude: faker.location.longitude(),
    confidence: faker.number.int({ max: 100 }),
  } as Omit<LocationData, 'url'>
}
