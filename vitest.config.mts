import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
  test: {
    // @ai-why: Node en niet jsdom. De enige geteste module (lib/analytics.ts) raakt
    // van de browser alleen `window.gtag`, en die stubben we per test zelf. Een DOM
    // meeslepen kost een dependency en startuptijd voor niets. Komen er ooit
    // componenttests bij, dan is jsdom of happy-dom hier de plek om het aan te zetten.
    environment: 'node',
    include: ['**/*.test.ts'],
    exclude: ['node_modules/**', '.next/**'],
  },
});
