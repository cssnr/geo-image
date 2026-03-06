// manifest.ts

import fs from 'node:fs'
import manifest from '../manifest.config.ts'

if (!fs.existsSync('dist')) throw new Error('Run build first.')

const arg = process.argv[2]
const mode = arg === 'firefox' ? 'firefox' : 'chrome'
const manifestFile = 'dist/manifest.json'

const config =
  typeof manifest === 'function' ? await manifest({ mode, command: 'build' }) : manifest

fs.writeFileSync(manifestFile, JSON.stringify(config, null, 2))
console.log(`Generated ${mode}: ${manifestFile}`)
