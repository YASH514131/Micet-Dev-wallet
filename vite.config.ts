import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-files',
      closeBundle() {
        // Copy manifest.json
        copyFileSync('manifest.json', 'build/manifest.json');
        
        // Copy public files
        const publicDir = 'public';
        const buildDir = 'build';
        
        if (!existsSync(`${buildDir}/icons`)) {
          mkdirSync(`${buildDir}/icons`, { recursive: true });
        }
        
        // Copy inject.js
        if (existsSync(`${publicDir}/inject.js`)) {
          copyFileSync(`${publicDir}/inject.js`, `${buildDir}/inject.js`);
        }
        
        // Copy approval.js
        if (existsSync(`${publicDir}/approval.js`)) {
          copyFileSync(`${publicDir}/approval.js`, `${buildDir}/approval.js`);
        }
        
        // Copy approval.html
        if (existsSync('approval.html')) {
          copyFileSync('approval.html', `${buildDir}/approval.html`);
        }
        
        // Copy transaction.js
        if (existsSync(`${publicDir}/transaction.js`)) {
          copyFileSync(`${publicDir}/transaction.js`, `${buildDir}/transaction.js`);
        }
        
        // Copy transaction.html
        if (existsSync(`${publicDir}/transaction.html`)) {
          copyFileSync(`${publicDir}/transaction.html`, `${buildDir}/transaction.html`);
        }
        
        // Copy signer.html
        if (existsSync(`${publicDir}/signer.html`)) {
          copyFileSync(`${publicDir}/signer.html`, `${buildDir}/signer.html`);
        }
      }
    }
  ],
  build: {
    outDir: 'build',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, 'src/background/index.ts'),
        content: resolve(__dirname, 'src/content/inject.ts'),
        signer: resolve(__dirname, 'src/signer/index.ts'),
      },
      output: {
        entryFileNames: (chunkInfo: any) => {
          if (chunkInfo.name === 'background') return 'background.js';
          if (chunkInfo.name === 'content') return 'content.js';
          if (chunkInfo.name === 'signer') return 'signer.js';
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
});
