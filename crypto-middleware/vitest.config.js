import { defineConfig } from 'vitest/config'
export default defineConfig({
    test: {
      coverage: {
        provider: 'istanbul'
      },
      browser: {
        enabled: true,
        name: 'chrome', // browser name is required
        headless: false
      },
    }
  })