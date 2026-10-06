import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';

// https://astro.build/config
export default defineConfig({
  integrations: [vue()],
  site: 'https://lemoinie.github.io',
  base: '/igmplus_wiki',
  build: {
    format: 'directory'
  }
});
