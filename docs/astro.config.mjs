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
	vite: {
		resolve: {
			alias: {
				'~/': '/src/',
			},
		},
	},
	integrations: [
		lit(),
		solid(),
		tailwind({
			applyBaseStyles: false,
		}),
		starlight({
			components: {
				ContentPanel: './src/components/ContentPanel.astro',
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
					label: 'Installation',
					link: '/installation',
				},
				{
					label: 'Concept',
					link: '/concept',
				},
				{
					label: 'Usage',
					link: '/usage',
				},
				{
					label: 'Component Templates',
					collapsed: false,
					autogenerate: { directory: 'components' },
				},
				{
					label: 'Elements',
					collapsed: false,
					autogenerate: { directory: 'elements' },
				},
				{
					label: 'Packages',
					collapsed: false,
					autogenerate: { directory: 'packages' },
				},
				{
					label: 'Experimental',
					badge: 'new',
					collapsed: true,
					autogenerate: { directory: 'experimental' },
				},
			],
		}),
	],
});
