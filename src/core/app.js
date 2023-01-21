import { createEmitter } from '@mwni/events'
import { createApiInterface } from './api.js'
import { readJson, writeBinary } from '../ps/files.js'
import { readSelectionBounds } from '../ps/utils.js'
import { alert } from '../ui/dialogs.js'
import { initGenericListeners } from '../ps/listeners.js'
import { applyModelSelectionRestrictions, fetchModelList } from './models.js'
import { resumeFromSavestate, scheduleSavestateFlush } from './save.js'
import { leavePreviewMode } from './results.js'
import { cancelAllTasks } from './generate.js'




export const api = createApiInterface()
export const events = createEmitter()
export const state = {
	ready: false,
	mode: null,
	prompt: '',
	promptInvalid: false,
	params: null,
	previewing: false,
	epochs: [],
	modeStates: {
		generate: {
			params: {
				freedom_prompt: 50,
				freedom_image: 50,
			},
			img2Img: false,
			epochs: []
		},
		inpaint: {
			params: {
				freedom_prompt: 50,
			},
			epochs: []
		},
		outpaint: {
			params: {
				freedom_prompt: 50,
				freedom_image: 50,
			},
			epochs: []
		}
	}
}

export async function init(){
	let savestate = await readJson('state.json')

	if(savestate){
		try{
			await resumeFromSavestate(savestate)
			console.log('resumed from savestate:', savestate)
		}catch(error){
			console.log('failed to resume from savestate:', error)
		}
	}

	console.log('runtime initialized')

	fetchModelList()

	await initGenericListeners()
	await updateActiveSelection()
	
	setMode(state.mode || 'generate')
	setState({ ready: true })
}

export function setMode(newMode){
	if(state.mode === newMode)
		return

	leavePreviewMode()
	cancelAllTasks()

	if(state.mode){
		state.modeStates[state.mode] = packState()
	}

	setState({ 
		...state.modeStates[newMode],
		mode: newMode,
	})

	applyModelSelectionRestrictions()
	scheduleSavestateFlush()
}

export function setState(newState){
	Object.assign(state, newState)
	m.redraw()

	scheduleSavestateFlush()
}

export function packState(){
	return {
		prompt: state.prompt,
		params: state.params,
		img2Img: state.img2Img,
		epochs: state.epochs
	}
}

export function isDiffusionDisabled(){
	return !state.model
}

export async function updateActiveSelection(){
	setState({
		activeSelection: await readSelectionBounds()
	})
}