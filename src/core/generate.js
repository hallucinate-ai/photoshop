import { api, state, setState } from './app.js'
import { exportMask, exportImageAndMask, exportImage, calculateContextFrame } from '../ps/export.js'
import { getDocumentDimensions, readSelectionBounds } from '../ps/utils.js'
import { alert } from '../ui/dialogs.js'
import { createAnyChangeObserver } from '../ps/listeners.js'
import { addResult, createEpoch, leavePreviewMode, putResultImage, removeResult, willCreateNewEpoch } from './results.js'
import { writeSavestate } from './save.js'
import { encodeBase64 } from '../lib/base64.js'


let currentImageData


export async function generate(){
	let epoch

	if(state.prompt.trim().length === 0){
		setState({ promptInvalid: true })
		return
	}

	try{
		await leavePreviewMode()
		await writeSavestate()
		await pullImageData()
	}catch(error){
		alert({
			title: 'Failed to generate',
			message: error.message
		})
	}
	

	if(willCreateNewEpoch()){
		epoch = await createEpoch()
	}else{
		epoch = state.epochs[state.epochs.length - 1]
	}

	let seed = epoch.seed++
	let { width, height, image, mask, frame, bounds } = currentImageData
	let params = state.img2Img
		? { ...state.params }
		: { freedom_prompt: state.params.freedom_prompt }

	let computeHandle = api.generate({
		mode: epoch.mode,
		model: state.model,
		prompt: state.prompt,
		...params,
		seed,
		width,
		height,
		frame,
		image,
		mask
	})

	computeHandle.on('status', () => {
		m.redraw()
	})

	computeHandle.on('cancel', ({ message }) => {
		removeResult({ epoch, result })

		if(message){
			alert({
				title: `Image generation failed`,
				message
			})
		}
	})

	computeHandle.on('result', ({ image }) => {
		putResultImage({ epoch, result, image })
	})

	let result = {
		prompt: state.prompt,
		params: state.params,
		seed,
		bounds,
		computeHandle
	}

	addResult({ epoch, result })
}

export function cancelAllTasks(){
	
}

async function pullImageData(){
	if(currentImageData)
		return

	let bounds = await readSelectionBounds()

	if(bounds){
		if(state.img2Img){
			let { bounds: paddedBounds, frame } = calculateContextFrame({ bounds })

			currentImageData = {
				bounds,
				image: await exportImage({ bounds: paddedBounds }),
				mask: await exportMask({ bounds: paddedBounds }),
				width: paddedBounds.w,
				height: paddedBounds.h,
				frame
			}
		}else{
			currentImageData = {
				bounds,
				mask: await exportMask({ bounds }),
				width: bounds.w,
				height: bounds.h
			}
		}
	}else{
		let { w: width, h: height } = getDocumentDimensions()
		let bounds = {
			x: 0,
			y: 0,
			w: width,
			h: height
		}

		currentImageData = { 
			width, 
			height,
			image: state.img2Img
				? await exportImage({ bounds })
				: undefined
		}
	}

	createAnyChangeObserver()
		.promise
		.then(() => currentImageData = undefined)
}