import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { copyFileSync } from 'fs'

// Plugin to copy .htaccess to dist folder
const copyHtaccessPlugin = () => {
  return {
    name: 'copy-htaccess',
    closeBundle() {
      try {
        copyFileSync(
          path.resolve(__dirname, 'public/.htaccess'),
          path.resolve(__dirname, 'dist/.htaccess')
        )
        console.log('✅ .htaccess file copied to dist folder')
      } catch (error) {
        console.warn('⚠️ Could not copy .htaccess file:', error.message)
      }
    }
  }
}

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    copyHtaccessPlugin()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@app': path.resolve(__dirname, 'src/app'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@shared': path.resolve(__dirname, 'src/shared'),
    }
  },
  optimizeDeps: {
    include: ['xlsx']
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
