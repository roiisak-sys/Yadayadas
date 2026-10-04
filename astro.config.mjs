import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://yadayadasmusic.com',
  output: 'static',
  trailingSlash: 'always',
  image: {
    domains: [],
  },
});
