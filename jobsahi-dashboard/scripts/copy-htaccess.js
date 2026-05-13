import { copyFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const sourceFile = resolve(__dirname, '../public/.htaccess')
const destFile = resolve(__dirname, '../dist/.htaccess')

try {
  if (existsSync(sourceFile)) {
    copyFileSync(sourceFile, destFile)
    console.log('✅ .htaccess file copied successfully to dist folder')
  } else {
    console.warn('⚠️ Source .htaccess file not found:', sourceFile)
  }
} catch (error) {
  console.error('❌ Error copying .htaccess file:', error.message)
  process.exit(1)
}

