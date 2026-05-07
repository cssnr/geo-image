// export const debug = import.meta.env.DEV ? console.log.bind(console) : () => {}

// NOTE: To prepend [debug] and preserver formatting the 1st argument must be a string
export const debug = import.meta.env.DEV
  ? (tag: string, ...data: any) => console.log('[debug] ' + tag, ...data)
  : () => {}

// export const debug = import.meta.env.DEV ? debugLog : () => {}
// function debugLog(tag: string, ...data: any[]) {
//   let t = tag.trim().replace(/:+$/, '')
//   if (data.length) t += ':'
//   console.log(`[debug] ${t}`, ...data)
// }
