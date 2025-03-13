import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import purgecss from 'vite-plugin-purgecss'

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
      safelist: {
        // Using a regex that matches any class ensures no CSS is removed.
        // This will whitelist every class from your external libraries (e.g. Bootstrap, Slick Slider)
        // as well as your own classes.
        deep: [/^.*$/]
      }
    })
  ]
});
