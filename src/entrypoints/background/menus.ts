import { i18n } from '#imports'
import { getPrompts } from '@/utils/prompt.ts'

// const config: chrome.contextMenus.CreateProperties[] = [
//   { contexts: ['image'], id: 'analyzeImage' },
//   { contexts: ['image'], id: 'customPrompts' },
//   { contexts: ['all'], id: 'separator' },
//   { contexts: ['all'], id: 'openPopup' },
//   { contexts: ['all'], id: 'openSidePanel' },
//   { contexts: ['all'], id: 'openExtPanel' },
//   { contexts: ['all'], id: 'separator' },
//   { contexts: ['all'], id: 'openOptions' },
// ]

const config = {
  analyzeImage: ['image'],
  savedPrompts: ['image'],
  openPopup: ['all'],
  openSidePanel: ['all'],
  openExtPanel: ['all'],
  openOptions: ['all'],
} as Record<string, chrome.contextMenus.ContextType[]>

// const contexts: chrome.contextMenus.CreateProperties[] = config.map((entry) => ({
//   ...entry,
//   ...(entry.id === 'separator'
//     ? { type: 'separator', id: crypto.randomUUID() }
//     : { title: i18n.t(`ctx.${entry.id}` as any) }),
// }))

export async function createContextMenus() {
  console.debug('createContextMenus')
  if (!chrome.contextMenus) return console.debug('Skipping: chrome.contextMenus')

  await chrome.contextMenus.removeAll()

  addContext('analyzeImage')

  console.debug('config:', config)
  const prompts = await getPrompts()
  console.debug('prompts:', prompts)
  const menuItems: chrome.contextMenus.CreateProperties[] = prompts.map((prompt) => ({
    contexts: ['image'],
    id: `prompt-${prompt.name}`,
    parentId: 'savedPrompts',
    title: prompt.name,
  }))
  console.debug('menuItems:', menuItems)
  if (menuItems.length) {
    addContext('savedPrompts')
    menuItems.forEach((item) => {
      console.log('create:', item)
      chrome.contextMenus.create(item)
    })
  }

  // addContext('seperator')
  // chrome.contextMenus.create({
  //   type: 'separator',
  //   contexts: ['image'],
  //   id: crypto.randomUUID(),
  // })
  addSeperator(['image'])
  // addSeperator([chrome.contextMenus.ContextType.IMAGE])
  addContext('openPopup')
  addContext('openSidePanel')
  addContext('openExtPanel')
  addContext('openOptions')

  // chrome.contextMenus.removeAll().then(() => {
  //   contexts.forEach((item) => chrome.contextMenus.create(item))
  // })
}

function addContext(id: string) {
  const item = {
    id: id === 'separator' ? crypto.randomUUID() : id,
    contexts: config[id],
    title: id !== 'separator' ? i18n.t(`ctx.${id}` as any) : '',
  } as chrome.contextMenus.CreateProperties
  chrome.contextMenus.create(item)
}

function addSeperator(contexts: string[]) {
  chrome.contextMenus.create({
    type: 'separator',
    contexts: contexts as [
      chrome.contextMenus.ContextType,
      ...chrome.contextMenus.ContextType[],
    ],
    id: crypto.randomUUID(),
  })
}

// function addSeperator(
//   contexts: [chrome.contextMenus.ContextType, ...chrome.contextMenus.ContextType[]],
// ) {
//   chrome.contextMenus.create({
//     type: 'separator',
//     contexts: contexts,
//     id: crypto.randomUUID(),
//   })
// }
