import { state, setState, packState } from './app.js'
import { readBinary, readDataDir, readJson, writeJson } from '../ps/files.js'

let flushTimeout


export async function scheduleSavestateFlush(){
	if(!flushTimeout){
		flushTimeout = setTimeout(
			() => {
				writeSavestate()
				flushTimeout = undefined
			},
			1000
		)
	}
}

export async function writeSavestate(){
	await writeJson(
		'state.json',
		{
			activeMode: state.mode,
			modeStates: {
				...state.modeStates,
				[state.mode]: packState()
			}
		}
	)
}

export async function resumeFromSavestate(savestate){
	let modeStates = {}

	for(let [mode, state] of Object.entries(savestate.modeStates)){
		let epochFolders = await readDataDir(`epochs/${mode}`)
		let epochs = []

		for(let epochFolder of epochFolders){
			let epoch = await readJson(`epochs/${mode}/${epochFolder.name}/meta.json`)

			if(epoch)
				epochs.push(epoch)
		}

		epochs.sort(
			(a, b) => a.date - b.date
		)

		for(let i=0; i<epochs.length; i++){
			let epoch = epochs[i]

			if(i === epochs.length - 1)
				await loadEpochImagesFromDrive(epoch)
			else
				epoch.minimized = true
		}

		modeStates[mode] = {
			...state,
			epochs
		}
	}

	setState({
		mode: savestate.activeMode,
		modeStates,
		...modeStates[savestate.activeMode]
	})
}

async function loadEpochImagesFromDrive(epoch){
	for(let result of epoch.results){
		Object.assign(result, {
			uri: URL.createObjectURL(
				new Blob([
					await readBinary(result.path)
				])
			)
		})
	}
}