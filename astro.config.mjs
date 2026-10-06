import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';

// Base path configuration:
// - On Vercel: VERCEL environment variable is automatically set to "1", so base defaults to "/"
// - Can be explicitly overridden with BASE_PATH (e.g. BASE_PATH=/igmplus_wiki for GitHub Pages)
// - Defaults to "/" for local development and Vercel deployments
const base = process.env.BASE_PATH ?? (process.env.VERCEL ? '/' : (process.env.GITHUB_PAGES ? '/igmplus_wiki' : '/'));

// https://astro.build/config
export default defineConfig({
  integrations: [vue()],
  base,
  build: {
    format: 'directory'
  }
});
