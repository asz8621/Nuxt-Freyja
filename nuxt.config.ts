// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['@/assets/styles/all.scss'],
  runtimeConfig: {
    public: {
      API_URL: "https://freyja-ob3p.onrender.com/api/v1",
    }
  },
  modules: ["@pinia/nuxt"],
})
