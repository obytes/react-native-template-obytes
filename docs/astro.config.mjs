import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import expressiveCode from 'astro-expressive-code';
const site = 'https://starter.obytes.com/';

// https://astro.build/config
export default defineConfig({
  integrations: [
    expressiveCode(),
    starlight({
      title: 'Obytes Starter | React Native Template',
      description: `Your All-in-One Solution for Building Outstanding React Native/Expo Apps. From editor setup to store submission, we've got you covered!`,
      logo: {
				light: '/src/assets/logo-titled.svg',
        dark: '/src/assets/logo-titled.svg',
				replacesTitle: true,
			},
      components: {
        // Override the default `SocialIcons` component.
        LastUpdated: './src/components/lastUpdated.astro',
      },
      social: {
        github: 'https://github.com/obytes/react-native-template-obytes',
      },
      head:[
        {
					tag: 'meta',
					attrs: { property: 'og:image', content: site + 'og.jpg?v=1' },
				},
				{
					tag: 'meta',
					attrs: { property: 'twitter:image', content: site + 'og.jpg?v=1' },
				},
        {
          tag:'link',
          attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        },
        {
          tag:'link',
          attrs: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true },
        },
        {
          tag:'link',
          attrs: { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&display=swap' },
        },
        {
          tag: 'script',
          attrs: { src: 'https://cdn.jsdelivr.net/npm/@minimal-analytics/ga4/dist/index.js', async: true }
        },{
          tag: 'script',
          content: ` window.minimalAnalytics = {
            trackingId: 'G-GQ45JJD1JC',
            autoTrack: true,
          };`
        }
      ],
      sidebar: [
        {
          label: 'Overview',
          link: '/overview',
        },
        {
          label: 'Start Here',
          items: [
            // Each item here is one entry in the navigation menu.
            {
              label: 'Create New App',
              link: '/getting-started/create-new-app/',
            },
            {
              label: 'Customize Your App',
              link: '/getting-started/customize-app/',
            },
            {
              label: 'Rules and Conventions',
              link: '/getting-started/rules-and-conventions/',
            },
            {
              label: 'Project Structure',
              link: '/getting-started/project-structure/',
            },
            {
              label: 'Environment Variables and Configurations',
              link: '/getting-started/environment-vars-config/',
            },
          ],
        },

        {
          label: 'UI Components & Theming',
          items: [
            // Each item here is one entry in the navigation menu.
            {
              label: 'UI Theme',
              link: '/ui-and-theme/ui-theming/',
            },
            {
              label: 'Fonts',
              link: '/ui-and-theme/fonts/',
            },
            {
              label: 'UI Components',
              link: '/ui-and-theme/components/',
            },
            {
              label: 'Forms',
              link: '/ui-and-theme/forms/',
            },
          ],
        },
        {
          label: 'Guides',
          items: [
            // Each item here is one entry in the navigation menu.
            {
              label: 'Navigation',
              link: '/guides/navigation/',
            },
            {
              label: 'Authentication',
              link: '/guides/authentication/',
            },
            {
              label: 'Data Fetching',
              link: '/guides/data-fetching/',
            },
            {
              label: 'Internationalization',
              link: '/guides/internationalization/',
            },
            {
              label: 'Storage',
              link: '/guides/storage/',
            },
            {
              label: 'Upgrade Dependencies',
              link: '/guides/upgrading-deps/',
            },
          ],
        },
        {
          label: 'Testing',
          items: [
            // Each item here is one entry in the navigation menu.
            {
              label: 'Overview',
              link: '/testing/overview/',
            },
            {
              label: 'Unit Testing',
              link: '/testing/unit-testing/',
            },
            {
              label: 'E2E Testing',
              link: '/testing/end-to-end-testing/',
            },
          ],
        },
        {
          label: 'CI/CD',
          items: [
            // Each item here is one entry in the navigation menu.
            {
              label: 'Overview',
              link: '/ci-cd/overview/',
            },
            {
              label: 'Releasing Process',
              link: '/ci-cd/app-releasing-process/',
            },
            {
              label: 'Workflows Reference',
              link: '/ci-cd/workflows-references/',
            },
          ],
        },
        {
          label: 'How to contribute ?',
          link: '/how-to-contribute',
        },
        {
          label: 'Stay Updated',
          link: '/stay-updated',
        },
      ],
      customCss: [
        // Fontsource files for to regular and semi-bold font weights.
        // '@fontsource/ibm-plex-mono/500.css',
        // '@fontsource/ibm-plex-mono/600.css',
        './src/styles/custom.css',
      ],
      lastUpdated: true,
    }),
  ],
  // Process images with sharp: https://docs.astro.build/en/guides/assets/#using-sharp
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
});
