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

  // SSR + Nitro. Habit data is per-user and always fresh — no route rules.
  ssr: true,

  devtools: { enabled: false },

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  runtimeConfig: {
    // server-only — Django API base used by server/ routes
    apiBase: process.env.NUXT_API_BASE || process.env.API_URL || 'https://api.kynguyen.cc',
    cookieDomain: process.env.COOKIE_DOMAIN || '',
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
