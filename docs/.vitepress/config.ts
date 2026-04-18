import { defineConfig } from 'vitepress'

// ml foundation project sidebars
import blogsSidebar from '../blogs/sidebar/sidebar'
// import mlFoundationMr from '../ml-foundation/sidebar/mr'

export default defineConfig({
  title: "SDET DOCS",
  description: "Automation & AI Documentation",
  base: '/',

  // ✅ Language metadata ONLY
  locales: {
    root: {
      label: "English",
      lang: "en"
    },
    mr: {
      label: "मराठी",
      lang: "mr"
    }
  },

  themeConfig: {
    logo: "/logo.jpg",

    nav: [
      {
        text: "AI/ML",
        link: ""
      },
      {
        text: "Automation",
        link: ""
      }
    ],

    sidebar: {
      "/blogs/": blogsSidebar,
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/" }
    ],

    footer: {
      message: "Built with VitePress",
      copyright: "© 2026 Prasad"
    }
  }
})