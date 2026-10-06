/**
 * Base URL helper.
 * Strips trailing slash so it can be prefixed cleanly (e.g. `${base}/classes` or `${base}/images/x.png`).
 * In Astro, import.meta.env.BASE_URL is derived directly from `base` in astro.config.mjs.
 * When base is '/' -> base is ''
 * When base is '/igmplus_wiki' -> base is '/igmplus_wiki'
 */
export const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
