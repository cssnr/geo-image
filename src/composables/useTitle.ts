export function useTitle(title: string) {
  const manifest = chrome.runtime.getManifest()
  document.title = `${manifest.name} ${title}`
}
