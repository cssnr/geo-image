export interface Prompt {
  name: string
  prompt: string
}

export const PROMPTS_KEY = 'prompts'

export async function getPrompt(name: string): Promise<Prompt> {
  const items = await chrome.storage.sync.get([PROMPTS_KEY])
  console.log('getPrompt - items:', items)
  const results = (items?.[PROMPTS_KEY] || []) as Prompt[]
  console.log('results:', results)
  const result = results.find((prompt: Prompt) => prompt.name === name)
  console.log('result:', result)
  return result as Prompt
}

export async function getPrompts(): Promise<Prompt[]> {
  const items = await chrome.storage.sync.get([PROMPTS_KEY])
  console.log('getPrompts - items:', items)
  const results = items?.[PROMPTS_KEY] || []
  console.log('results:', results)
  return results as Prompt[]
}

export async function addPrompt(name: string, prompt: string): Promise<void> {
  console.log('addPrompt - name:', name, prompt)
  const item = { name, prompt }
  const data: Prompt[] = await getPrompts()
  console.log('data:', data)
  if (data.some((item) => item.name === name)) {
    throw new Error('Prompt name already exists')
  }
  data.push(item)
  console.log('data:', data)
  await chrome.storage.sync.set({ [PROMPTS_KEY]: data })
}

export async function deletePrompt(name?: string): Promise<void> {
  console.log('deletePrompt:', name)
  if (!name) return
  const data: Prompt[] = await getPrompts()
  console.log('data:', data)
  const filtered = data.filter((s) => s.name !== name)
  console.log('filtered:', filtered)
  await chrome.storage.sync.set({ [PROMPTS_KEY]: filtered })
}
