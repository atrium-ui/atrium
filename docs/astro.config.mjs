import lit from '@astrojs/lit';
import solid from '@astrojs/solid-js';
import starlight from '@astrojs/starlight';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  base: '/mono',
  publicDir: 'static',
  integrations: [
    lit(),
    solid(),
    tailwind({
      applyBaseStyles: false,
    }),
    starlight({
      title: 'Atrium',
      customCss: ['./src/styles/custom.css'],
      logo: {
        src: './src/assets/atrium.png',
      },
      social: {
        gitlab: 'https://gitlab.s-v.de/sv-components/mono',
      },
      sidebar: [
        {
          label: 'Installation',
          link: '/guides/installation',
        },
        {
          label: 'Primitives',
          link: '/guides/primitives',
        },
        {
          label: 'Development',
          link: '/guides/development',
        },
        {
          label: 'Components',
          link: '/guides/components',
        },
        {
          label: 'Components',
          autogenerate: { directory: 'components' },
        },
        {
          label: 'Primitives',
          autogenerate: { directory: 'primitives' },
        },
      ],
    }),
  ],

  // Process images with sharp: https://docs.astro.build/en/guides/assets/#using-sharp
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
});
