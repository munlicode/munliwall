import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const MONOREPO_ROOT = path.resolve(__dirname, '../../')

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin({ exclude: ['@munlicode/munliwall-core', 'conf'] })],
    build: {
      outDir: 'dist/main',
      rollupOptions: {
        external: ['sharp', 'electron', 'path', 'fs'],
        input: 'src/main/index.ts',
        output: {
          format: 'cjs',
          entryFileNames: 'index.js'
        }
      }
    }
  },

  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'dist/preload',
      rollupOptions: {
        input: 'src/preload/index.ts',
        output: {
          format: 'cjs',
          entryFileNames: 'index.js'
        }
      }
    }
  },

  renderer: {
    resolve: {
      alias: {
        '@renderer': path.resolve(__dirname, 'src/renderer/src'),
        '@munlicode/munliwall-core': path.resolve(MONOREPO_ROOT, 'packages/core/src')
      }
    },

    server: {
      port: 5173,
      strictPort: true
    },

    plugins: [react()],

    root: 'src/renderer/src/',

    build: {
      outDir: 'dist/renderer',
      rollupOptions: {
        input: 'src/renderer/src/index.html'
      }
    }
  }
})
