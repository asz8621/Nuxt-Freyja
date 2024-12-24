// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      title: "高雄享樂酒店｜Kaohsiung Enjoyment Luxury Hotel",
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      meta: [
        { "http-equiv": "X-UA-Compatible", content: "IE=edge" },
        { "http-equiv": "X-Content-Type-Options", content: "nosniff" },
        { name: "author", content: "高雄享樂酒店" },
        { name: "keywords", content: "高雄享樂酒店,享樂酒店,高雄旅遊,高雄住宿,四人房,雙人房,景觀房,全台最大酒店,高雄市住宿,奢華酒店,頂級住宿" },
        { name: "description", content: "位於高雄市中心，提供無與倫比的奢華住宿體驗。盡情欣賞壯麗的市景，並享受頂級設施，讓每一刻都彷彿置身於極致的舒適與優雅之中。立即預訂，開啟一段難忘的尊貴之旅！" },
        { name: "theme-color", content: "#ffffff" },
        { name: "robots", content: "index, follow" },
        { property: "og:locale", content: "zh-TW" },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://freyja-nuxt.onrender.com/" },
        { property: "og:title", content: "高雄享樂酒店｜Kaohsiung Enjoyment Luxury Hotel" },
        { property: "og:image", content: "https://freyja-nuxt.onrender.com/images/home-hero.png" },
        { property: "og:description", content: "位於高雄市中心，提供無與倫比的奢華住宿體驗。盡情欣賞壯麗的市景，並享受頂級設施，讓每一刻都彷彿置身於極致的舒適與優雅之中。立即預訂，開啟一段難忘的尊貴之旅！" },
        { property: "og:site_name", content: "高雄享樂酒店" },
        { property: "og:updated_time", content: "2024-12-24T00:00:00Z" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@HotelName" },
        { name: "twitter:title", content: "高雄享樂酒店｜Kaohsiung Enjoyment Luxury Hotel" },
        { name: "twitter:description", content: "位於高雄市中心，提供無與倫比的奢華住宿體驗。盡情欣賞壯麗的市景，並享受頂級設施，讓每一刻都彷彿置身於極致的舒適與優雅之中。" },
        { name: "twitter:image", content: "https://freyja-nuxt.onrender.com/images/home-hero.png" },
        { name: "robots", content: "index, follow" },
      ],
      link: [
        { rel: "canonical", href: "https://freyja-nuxt.onrender.com/" },
        { rel: "icon", href: "/favicon.ico" },
      ]
    }
  },  
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
