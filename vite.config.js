import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // CHANGE THIS LINE: Use your repository name with slashes
  base: '/connect4-webgl-mediapipe/', 
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'],
          mediapipe: ['@mediapipe/hands', '@mediapipe/drawing_utils', '@mediapipe/camera_utils'],
          react: ['react', 'react-dom', 'zustand'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})