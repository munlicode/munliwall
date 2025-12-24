import fs from 'fs'
import path from 'path'

const src = path.resolve('../core/dist/config.js')
const destDir = path.resolve('dist/core')
fs.mkdirSync(destDir, { recursive: true })
fs.copyFileSync(src, path.join(destDir, 'config.js'))

console.log('Copied config.js from core to desktop dist.')
