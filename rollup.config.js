import babel from '@rollup/plugin-babel'
import jsx from '@babel/plugin-transform-react-jsx'
import json from '@rollup/plugin-json'
import scss from 'rollup-plugin-scss'
import { nodeResolve } from '@rollup/plugin-node-resolve'

export default {
	input: 'src/plugin.js',
	output: {
		file: 'dist/plugin.js',
		format: 'cjs',
		globals: {
			m: 'mithril'
		}
	},
	plugins: [
		babel({
			plugins: [
				[
					jsx,
					{
						pragma: 'm',
						pragmaFrag: `'['`
					}
				]
			],
			babelHelpers: 'bundled'
		}),
		json({ 
			compact: true 
		}),
		nodeResolve(),
		scss({
			output: 'dist/style.css',
			failOnError: true,
		})
	],
	external: [
		'photoshop',
		'uxp'
	]
}