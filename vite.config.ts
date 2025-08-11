import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'certs/localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'certs/localhost.pem')),
    },
    port: 5173
  },
  build: {
    rollupOptions: {
      input: {
        // Make BOTH root (/) and /taskpane.html use the same file
        main: path.resolve(__dirname, 'taskpane.html'),
        taskpane: path.resolve(__dirname, 'taskpane.html'),
      },
    },
  },
})
