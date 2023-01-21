import { setState, state } from './app.js'
import { createDataFolder, writeJson, deleteFile, writeBinary } from '../ps/files.js'
import { createHistoryModificationObserver, deleteHistoryEntry } from '../ps/history.js'
import { placeImage } from '../ps/import.js'
import { generateXid } from '../ps/utils.js'
import { confirm } from '../ui/dialogs.js'


let previewCancel


export function addResult({ epoch, result }){
	Object.assign(result, {
		path: `${epoch.folder}/${result.seed}.png`
	})

	epoch.results.push(result)

	m.redraw()
}

export function removeResult({ epoch, result }){
	epoch.results.splice(
		epoch.results.indexOf(result),
		1
	)

	if(epoch.results.length === 0){
		deleteEpoch(epoch)
	}

	m.redraw()
}

export function putResultImage({ epoch, result, image }){
	result.uri = URL.createObjectURL(
		new Blob([image])
	)

	delete result.computeHandle

	writeBinary(result.path, image)
	storeEpoch(epoch)

	m.redraw()
}

export function willCreateNewEpoch(){
	let epoch = state.epochs[state.epochs.length - 1]
	return !epoch || !isSamePrompt(epoch.prompt, state.prompt)
}

export async function createEpoch(){
	let epoch = {
		mode: state.mode,
		prompt: state.prompt,
		xid: generateXid(),
		seed: 1 + Math.floor(1000000 * Math.random()),
		date: Math.floor(Date.now() / 1000),
		results: []
	}

	epoch.folder = `epochs/${epoch.mode}/${epoch.xid}`

	try{
		await createDataFolder(epoch.folder)
		await storeEpoch(epoch)
	}catch(error){
		console.log(`failed to write epoch to drive:`, error)
	}

	setState({
		epochs: [
			...state.epochs,
			epoch
		]
	})

	return epoch
}

export async function storeEpoch({ minimized, ...epoch }){
	await writeJson(
		`${epoch.folder}/meta.json`, 
		{
			...epoch,
			results: epoch.results
				.filter(({ computeHandle }) => !computeHandle)
				.map(({ uri, ...image }) => image)
		}
	)
}

export async function deleteEpoch(epoch){
	try{
		await deleteFile(`${epoch.folder}/meta.json`)
		await deleteFile(epoch.folder)
		console.log(`deleted epoch folder at: ${epoch.folder}`)
	}catch(error){
		console.error(`failed to delete epoch folder: ${epoch.folder}`, error)
	}

	setState({
		epochs: state.epochs.filter(
			e => e !== epoch
		)
	})
}


export async function deletePreviewImage(){
	if(!state.previewing)
		return

	let userIsSure = await confirm({
		question: `Do you really want to delete this image? This is irreversible.`,
		actionLabel: `Delete`
	})

	if(!userIsSure)
		return

	let image = state.previewing
	let epoch = state.epochs.find(
		epoch => epoch.results.includes(image)
	)

	epoch.results =  epoch.results.filter(
		result => result !== image
	)

	await previewCancel()
	await deleteFile(image.path)

	if(epoch.results.length > 0){
		await storeEpoch(epoch)
	}else{
		await deleteEpoch(epoch)
	}
}

export async function enterPreviewMode(image){
	if(previewCancel)
		await previewCancel()

	setState({ previewing: image })

	try{
		await placeImage({
			path: image.path,
			name: image.prompt,
			bounds: image.placementBounds
		})
	}catch(error){
		console.error(`could not place image:`, error)
	}

	let { promise, cancel } = createHistoryModificationObserver()

	promise.then(
		() => {
			previewCancel = null
			setState({ previewing: null })
		}
	)

	previewCancel = async () => {
		previewCancel = null
		await cancel()
		await deleteHistoryEntry()
		setState({ previewing: null })
	}
}

export async function leavePreviewMode(){
	if(previewCancel)
		await previewCancel()
}

export async function toggleEpochMinimization(epoch){
	if(epoch.minimized){
		if(!epoch.results[0].uri)
			await loadEpochImagesFromDrive(epoch)

		epoch.minimized = false
	}else{
		epoch.minimized = true
	}

	m.redraw()
}

function isSamePrompt(a, b){
	return a.trim() === b.trim()
}