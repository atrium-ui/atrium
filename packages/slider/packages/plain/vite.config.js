import { resolve } from "path";
import { defineConfig } from "vite";
// import legacy from '@vitejs/plugin-legacy' // not working with lib mode: https://github.com/vitejs/vite/issues/1639
import { babel } from "@rollup/plugin-babel";
import { visualizer } from "rollup-plugin-visualizer";
import removeConsole from "vite-plugin-remove-console";

export default defineConfig({
	build: {
		outDir: resolve(__dirname, "../../dist/plain"),
		lib: {
			entry: resolve(__dirname, "../../src/index.plain.js"),
			name: "@sv/slider",
			fileName: "sv-slider",
			// formats: ['es', 'amd', 'umd', 'cjs']
			formats: ["es", "umd", "cjs"],
		},
		rollupOptions: {
			external: ["vue", "gsap"],
			output: {
				assetFileNames: (assetInfo) => {
					return assetInfo.name === "style.css" ? "sv-slider.css" : assetInfo.name;
				},
				globals: {
					vue: "Vue",
					gsap: "gsap",
				},
			},
		},
		sourcemap: true,
	},
	css: {
		devSourcemap: true,
	},
	plugins: [
		babel({
			babelHelpers: "runtime",
			extensions: [".js", ".jsx", ".es6", ".es", ".mjs", "ts"],
			plugins: ["@babel/plugin-transform-runtime"],
			presets: [
				[
					"@babel/preset-env",
					{
						useBuiltIns: "usage",
						corejs: 3,
					},
				],
			],
		}),
		removeConsole(),
		visualizer(),
		// legacy({
		//   targets: ['defaults', 'not IE 11']
		// })
	],
});
