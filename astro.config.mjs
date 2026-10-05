import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://stardustbowie.com',
  output: 'static',
  trailingSlash: 'always',
  image: {
    domains: [],
  },
});
