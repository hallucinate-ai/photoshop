import { state as appState } from '../../core/app.js'
import { generate } from '../../core/generate.js'
import { enterPreviewMode, leavePreviewMode, deletePreviewImage, toggleEpochMinimization, willCreateNewEpoch } from '../../core/results.js'
import FolderIcon from '../common/FolderIcon.jsx'
import TrashIcon from '../common/TrashIcon.jsx'

const progressStageLabels = {
	upload: 'Uploading',
	wait: 'Waiting',
	init: 'Warming up',
	encode: 'Encoding',
	sample: 'Sampling',
	decode: 'Decoding',
	receive: 'Receiving',
}


export default {
	view: node => (
		<>
			<div class="section results">
				<div class="backdrop" onclick={leavePreviewMode}/>
				<List/>
			</div>
			<div class="section foot">
				<div 
					class={`tool-btn delete ${appState.previewing ? '' : 'disabled'}`}
					onclick={deletePreviewImage}
				>
					<TrashIcon/>
				</div>
			</div>
		</>
	)
}

const List = {
	view: () => {
		let newEpoch = willCreateNewEpoch()

		return (
			<div class="list">
				{ newEpoch ? <EpochPlaceholder/> : null }
				{ 
					appState.epochs.slice().reverse().map(
						(epoch, i) => (
							<Epoch 
								epoch={epoch} 
								sealed={i > 0 || newEpoch}
							/>
						)
					) 
				}
				<div class="spacer"/>
			</div>
		)
	}
}

const Epoch = {
	view: ({ attrs }) => {
		let items = []
		let epoch = attrs.epoch
		let sealed = attrs.sealed

		let numItems = epoch.results.length
		let numItemsPadded = Math.max(2, Math.ceil((numItems + 1) / 2) * 2)
		let placedGenerateTrigger = false

		for(let i=0; i<numItemsPadded; i++){
			let result = epoch.results[i]

			if(result){
				if(result.computeHandle){
					items.push(
						result.computeHandle.stage === 'queue'
							? <InQueue handle={result.computeHandle}/>
							: <Progress handle={result.computeHandle}/>
					)
				}else{
					items.push(<Result result={result}/>)
				}
			}else if(!sealed){
				if(!placedGenerateTrigger){
					items.push(<GenerateTrigger/>)
					placedGenerateTrigger = true
				}else{
					items.push(<Stub/>)
				}
			}
		}

		return (
			<div class="epoch">
				<div class="head" onclick={() => toggleEpochMinimization(epoch)}>
					<FolderIcon open={!epoch.minimized}/>
					<span>{attrs.epoch.prompt}</span>
				</div>
				{
					!epoch.minimized && 
					(
						<div class="items">
							{ items }
						</div>
					)
				}
			</div>
		)
	}
}

const EpochPlaceholder = {
	view: () => (
		<div class="epoch placeholder">
			{
				appState.prompt.length > 0 &&
				(
					<div class="head">
						<FolderIcon open={true}/>
						<span>{appState.prompt}</span>
					</div>
				)
			}
			<div class="items">
				<GenerateTrigger/>
				<Stub/>
			</div>
		</div>
	)
}

const Stub = {
	view: () => (
		<div class="placeholder stub">
			<div/>
		</div>
	)
}

const GenerateTrigger = {
	view: () => (
		<div>
			<div class="placeholder generate" onclick={() => generate()}>
				<span>Click to Generate</span>
			</div>
		</div>
	)
}

const Progress = {
	view: ({ attrs }) => (
		<div>
			<div class="placeholder progress">
				{
					attrs.handle.progress
						? <ProgressBar value={attrs.handle.progress}/>
						: null
				}
				<span>{progressStageLabels[attrs.handle.stage]} ...</span>
				<Cancel handle={attrs.handle}/>
			</div>
		</div>
	)
}

const ProgressBar = {
	view: ({ attrs, dom }) => {
		if(dom)
			dom.value = attrs.value

		return <sp-progressbar value={attrs.value} max="1"/>
	}
}

const InQueue = {
	view: ({ attrs }) => (
		<div>
			<div class="placeholder in-queue">
				<div class="pos">{attrs.handle.position}</div>
				<span>In Queue</span>
				<Cancel handle={attrs.handle}/>
			</div>
		</div>
	)
}

const Cancel = {
	view: ({ attrs }) => (
		<div class="cancel" onclick={attrs.handle.cancel}>
			✕
		</div>
	)
}

const Result = {
	oncreate: ({ dom }) => {
		let img = dom.querySelector('img')
		let cap = () => {
			let w = img.naturalWidth
			let h = img.naturalHeight

			if(w / h > 16 / 12)
				img.style.width = '100%'
			else
				img.style.height = '30vw'
		}

		if(img.complete)
			cap()
		else
			img.onload = cap
	},
	view: ({ attrs }) => (
		<div>
			<div class={`image ${appState.previewing === attrs.result ? `active` : ``}`}>
				<div class="wrap">
					<img src={attrs.result.uri} onclick={() => enterPreviewMode(attrs.result)}/>
				</div>
			</div>
		</div>
	)
}