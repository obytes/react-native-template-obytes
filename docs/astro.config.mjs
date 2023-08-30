import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import expressiveCode from 'astro-expressive-code';

// https://astro.build/config
export default defineConfig({
  integrations: [
    expressiveCode(),
    starlight({
      title: 'Obytes Starter',
      social: {
        github: 'https://github.com/obytes/react-native-template-obytes',
      },
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
              link: '/get-started/create-new-app/',
            },
            {
              label: 'Customize Your App',
              link: '/get-started/customize-app/',
            },
            {
              label: 'Rules and Conventions',
              link: '/get-started/rules-and-conventions/',
            },
            {
              label: 'Project Structure',
              link: '/get-started/project-structure/',
            },
            {
              label: 'Environment Variables and Configurations',
              link: '/get-started/environment-vars-config/',
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
              label: 'Authentication',
              link: '/guides/authentication/',
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
        // '@fontsource/ibm-plex-mono/400.css',
        '@fontsource/ibm-plex-mono/500.css',
        '@fontsource/ibm-plex-mono/600.css',
        './src/styles/custom.css',
      ],
    }),
  ],
  // Process images with sharp: https://docs.astro.build/en/guides/assets/#using-sharp
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
});
