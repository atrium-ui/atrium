import lit from '@astrojs/lit';
import solid from '@astrojs/solid-js';
import starlight from '@astrojs/starlight';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	base: '/sv-frontend-library/mono',
	site: 'https://sv.pages.s-v.de',
	publicDir: 'static',
	integrations: [
		lit(),
		solid(),
		tailwind({
			applyBaseStyles: false,
		}),
		starlight({
			components: {
				ContentPanel: './src/components/ContentPanel.astro',
				Head: './src/components/Head.astro',
				Sidebar: './src/components/Sidebar.astro',
			},
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
					label: 'Concept',
					link: '/concept',
				},
				{
					label: 'Installation',
					link: '/installation',
				},
				{
					label: 'Usage',
					link: '/usage',
				},
				{
					label: 'Components',
					autogenerate: { directory: 'components' },
				},
				{
					label: 'Elements',
					collapsed: true,
					autogenerate: { directory: 'elements' },
				},
				{
					label: 'Packages',
					collapsed: true,
					autogenerate: { directory: 'packages' },
				},
			],
		}),
	],
});
