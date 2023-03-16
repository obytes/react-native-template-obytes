// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Obytes Starter",
  tagline: "A template for your next React Native project 🚀",
  url: "https://starter.obytes.com",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "obytes", // Usually your GitHub org/user name.
  projectName: "obytes-starter", // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },


  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/obytes/react-native-template-obytes/tree/main/docs/docs",
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/obytes/react-native-template-obytes/tree/main/docs/docs",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
        gtag: {
          trackingID: "G-GQ45JJD1JC",
          anonymizeIP: true,
        },
      }),
    ],
  ],
  plugins: [require.resolve('docusaurus-lunr-search')],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: "Obytes Starter",
        logo: {
          alt: "Obytes Starter Logo",
          src: "img/logo.png",
        },
        items: [
          {
            type: "doc",
            docId: "overview",
            position: "left",
            label: "Docs",
          },
          {
            href: "https://github.com/obytes/react-native-template-obytes",
            label: "GitHub",
            position: "right",
          },
          {
            href: "https://obytes.com",
            label: "Obytes",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Docs",
            items: [
              {
                label: "Overview",
                to: "/docs/overview",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "Obytes",
                href: "https://obytes.com",
              },
              {
                label: "GitHub",
                href: "https://github.com/obytes/react-native-template-obytes",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Obytes. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      metadata: [
        {
          name:'title',
          content: 'Obytes Starter | A template for your next React Native project 🚀',
        },
        {
          name: "description",
          content: "A template for your next React Native project 🚀.Made with developer experience and performance first: Expo,TypeScript,tailwindcss, Husky, Lint-Staged, react-navigation, react-query, react-hook-form, I18n.",
        },

        {
          name: "og:title",
          content: "Obytes Starter | A template for your next React Native project 🚀",
        },
        {
          name: "og:description",
          content: "A template for your next React Native project 🚀.Made with developer experience and performance first: Expo,TypeScript,tailwindcss, Husky, Lint-Staged, react-navigation, react-query, react-hook-form, I18n.",
        },
        {
          name: "og:image",
          content: "https://starter.obytes.com/img/cover.jpg",
        },
        {
          name: "og:url",
          content: "https://starter.obytes.com",
        },

        {
          name: "twitter:title",
          content: "Obytes Starter | A template for your next React Native project 🚀",
        },
        {
          name: "twitter:description",
          content: "A template for your next React Native project 🚀.Made with developer experience and performance first: Expo,TypeScript,tailwindcss, Husky, Lint-Staged, react-navigation, react-query, react-hook-form, I18n.",
        },
        {
          name: "twitter:image",
          content: "https://starter.obytes.com/img/cover.jpg",
        },
        {
          name: "twitter:card",
          content: "summary_large_image",
        },
        {
          name :'keywords',
          content:"react-native, expo, typescript, tailwindcss, husky, lint-staged, react-navigation, react-query, react-hook-form, i18n, obytes, starter, template, react-native-template-obytes"
        }
      ],

    }),
};

module.exports = config;
