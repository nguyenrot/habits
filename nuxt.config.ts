import tailwindcss from '@tailwindcss/vite'

// Set the .dark class before hydration so Liquid Glass renders in the right
// theme with no flash. Reads the kn:theme cookie; falls back to the OS setting.
const themePreboot = `
(function(){try{
  var m=document.cookie.match(/(?:^|; )kn:theme=([^;]+)/);
  var t=m?decodeURIComponent(m[1]):'system';
  var dark = t==='dark' || (t!=='light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
}catch(e){}})();
`

export default defineNuxtConfig({
  compatibilityDate: '2026-06-06',

  // SPA like ledger — auth is a localStorage token, so SSR would only flash a
  // no-auth shell. The client talks to api.kynguyen.cc directly with Bearer.
  ssr: false,

  devtools: { enabled: false },

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  // SPA HTML must never be heuristically cached by the browser — a stale index
  // points at old chunk hashes and breaks the app after a deploy. Hashed
  // /_nuxt/* assets stay immutable.
  nitro: {
    routeRules: {
      '/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
      '/**': { headers: { 'cache-control': 'no-cache' } },
    },
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://api.kynguyen.cc',
    },
  },

  app: {
    head: {
      title: 'Habits — theo dõi thói quen',
      htmlAttrs: { lang: 'vi' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'Xây thói quen mỗi ngày — nhẹ nhàng, trong trẻo.' },
        { name: 'theme-color', content: '#0a0b0c', media: '(prefers-color-scheme: dark)' },
        { name: 'theme-color', content: '#eef2f0', media: '(prefers-color-scheme: light)' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
      script: [{ innerHTML: themePreboot, tagPosition: 'head' }],
    },
  },

  typescript: {
    strict: true,
  },
})
