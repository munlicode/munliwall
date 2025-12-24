const fs = require('fs')
const { execSync } = require('child_process')
const path = require('path')

const pkgPath = path.resolve(__dirname, 'package.json')

// Capture additional arguments passed to the script (e.g., --publish always)
const args = process.argv.slice(2).join(' ')

try {
  // 1. Build
  console.log('Running electron-vite build...')
  execSync('npx electron-vite build', { stdio: 'inherit', cwd: __dirname })

  // 2. Copy config
  console.log('Running copy_core.js...')
  execSync('node copy_core.js', { stdio: 'inherit', cwd: __dirname })

  // 3. Modify package.json
  console.log('Reading package.json...')
  const pkgContent = fs.readFileSync(pkgPath, 'utf-8')
  const pkg = JSON.parse(pkgContent)

  // Save backup
  const backupPkgContent = pkgContent

  if (pkg.dependencies && pkg.dependencies['@munlicode/munliwall-core']) {
    console.log('Removing @munlicode/munliwall-core from dependencies for packaging...')
    delete pkg.dependencies['@munlicode/munliwall-core']
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
  }

  try {
    // 4. Pack
    console.log(`Running electron-builder --linux ${args}...`)
    execSync(`npx electron-builder --linux ${args}`, { stdio: 'inherit', cwd: __dirname })
  } catch (e) {
    console.error('Build failed.')
    throw e
  } finally {
    // 5. Restore package.json
    console.log('Restoring package.json...')
    fs.writeFileSync(pkgPath, backupPkgContent)
  }
} catch (error) {
  console.error('Script failed:', error)
  process.exit(1)
}
