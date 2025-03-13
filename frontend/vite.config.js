import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import purgecss from 'vite-plugin-purgecss'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": "http://localhost:8080",
    },
  },
  plugins: [
    react(),
    purgecss({
      content: [
        './index.html',
        './src/**/*.{js,jsx,ts,tsx,html}'
      ],
      // If you have classes that are dynamically generated,
      // add them to the safelist array to prevent them from being removed:
      safelist: ['dynamic-class']
    })
  ]
});
