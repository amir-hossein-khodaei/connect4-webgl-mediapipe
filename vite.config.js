import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/connect4-3d-hand/', // <--- IMPORTANT: Makes the app work in any subfolder
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable source maps for production (cleaner/lighter)
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