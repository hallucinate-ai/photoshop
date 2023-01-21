import './lib/patches.js'
import { entrypoints } from 'uxp'
import { version } from '../package.json'
import { init } from './core/app.js'
import DiffusionPanel from './ui/diffusion/Panel.jsx'


let diffusionPanel


entrypoints.setup({
	plugin: {
		async create() {
			console.log(`*** Hallucinate v${version} ***`)
			console.log(`plugin initialized`)
			try{
				await init()
			}catch(error){
				console.error('runtime initialization error:', error)
			}
		},
		destroy() {
			console.log(`plugin is unloading`)
		},
	},
	panels: {
		diffusion: {
			create(){
				diffusionPanel = document.createElement('div')
				diffusionPanel.className = 'diffusion panel'
				m.mount(diffusionPanel, DiffusionPanel)
			},
		
			show(){
				document.body.appendChild(diffusionPanel)
			},
		
			hide(){
				document.body.removeChild(diffusionPanel)
			}
		}
	}
})