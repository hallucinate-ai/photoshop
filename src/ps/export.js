import ps from 'photoshop'
import uxp from 'uxp'
import { createTempFolder } from './files.js'


const paddingMinSize = 512
const paddingFactor = 0.25


export async function exportImage({ bounds }){
	let folder = await createTempFolder()

	return await exportBatchResult({ 
		folder, 
		batch: [
			...(
				ps.app.activeDocument.activeLayers.length > 0
					? composeActiveLayersMerge()
					: composeAllLayersMerge()
			),
			...composeAreaExport({
				bounds,
				name: 'image',
				folder,
			})
		]
	})
}

export async function exportMask({ bounds }){
	let folder = await createTempFolder()
	
	return await exportBatchResult({ 
		folder, 
		batch: [
			...composeMask(),
			...composeAreaExport({
				bounds,
				name: 'mask',
				folder,
			})
		]
	})
}

export function calculateContextFrame({ bounds }){
	let docW = ps.app.activeDocument.width
	let docH = ps.app.activeDocument.height
	let x = bounds.x
	let y = bounds.y
	let w = bounds.w * (1 + paddingFactor)
	let h = bounds.h * (1 + paddingFactor)

	w = Math.max(w, paddingMinSize)
	w = Math.min(w, docW)

	h = Math.max(h, paddingMinSize)
	h = Math.min(h, docH)

	x += (bounds.w - w)/2
	x = Math.max(x, 0)
	x = Math.min(x, docW - w)

	y += (bounds.h - h)/2
	y = Math.max(y, 0)
	y = Math.min(y, docH - h)

	x = Math.round(x)
	y = Math.round(y)
	w = Math.round(w)
	h = Math.round(h)

	return {
		bounds: { x, y, w, h },
		frame: {
			x: bounds.x - x,
			y: bounds.y - y,
			w: bounds.w,
			h: bounds.h
		}
	}
}

async function exportBatchResult({ batch, folder }){
	let bytes

	await ps.core.executeAsModal(
		async ctrl => {
			let suspension = await ctrl.hostControl.suspendHistory({
				documentID: ps.app.activeDocument.id,
				name: 'Export Selection'
			})

			try{
				await ps.action.batchPlay(batch.filter(Boolean), {})
			}catch(error){
				console.log('export selection error:', error)
				throw error
			}

			let exportLayer = ps.app.activeDocument.activeLayers[0]

			if(!exportLayer){
				throw new Error(`Unexpected Photoshop image export failure.`)
			}

			for(let i=0; i<50; i++){
				bytes = new Uint8Array(
					await Array.from(await folder.getEntries())
						.find((entry) => entry.name === `${exportLayer.name}.png`)
						?.read({ format: uxp.storage.formats.binary })
				)

				if(bytes.length > 0)
					break

				await new Promise(resolve => setTimeout(resolve, 25))
			}

			await ctrl.hostControl.resumeHistory(suspension, false)
		},
		{ commandName: 'Exporting image area for hallucination' }
	)

	if(!bytes.length)
		throw new Error(`Photoshop failed to quick export layer. This is an internal bug of Photoshop. Try restarting Photoshop.`)

	return bytes
}

const composeAllLayersMerge = () => [{ _obj: 'mergeVisible' }]
const composeActiveLayersMerge = () => 
	ps.app.activeDocument.activeLayers.length > 1
		? [{ _obj: 'mergeLayersNew' }]
		: []
	
const composeMask = () => [
	{
		_obj: 'duplicate',
		_target: [
			{
				_property: 'selection',
				_ref: 'channel'
			}
		],
		name: 'Hallucinate Temp Mask'
	},
	{
		_obj: 'set',
		_target: [
			{
				'_property': 'selection',
				'_ref': 'channel'
			}
		],
		to: {
			'_enum': 'ordinal',
			'_value': 'none'
		}
	},
	{
		_obj: 'make',
		_target: [
			{
				'_ref': 'layer'
			}
		]
	},
	{
		_obj: 'fill',
		mode: {
			_enum: 'blendMode',
			_value: 'normal'
		},
		opacity: {
			_unit: 'percentUnit',
			_value: 100.0
		},
		using: {
			_enum: 'fillContents',
			_value: 'black'
		}
	},
	{
		_obj: 'set',
		_target: [
			{
				_property: 'selection',
				_ref: 'channel'
			}
		],
		to: {
			_name: 'Hallucinate Temp Mask',
			_ref: 'channel'
		}
	},
	{
		_obj: 'fill',
		mode: {
			'_enum': 'blendMode',
			'_value': 'normal'
		},
		opacity: {
			'_unit': 'percentUnit',
			'_value': 100.0
		},
		using: {
			'_enum': 'fillContents',
			'_value': 'white'
		}
	}
]

const composeBoundaryDots = ({ bounds }) => {
	let batch = []

	for(let x=0; x<2; x++){
		for(let y=0; y<2; y++){
			let bx = bounds.x + (bounds.w - 1) * x
			let by = bounds.y + (bounds.h - 1) * y

			batch = [
				...batch,
				{
					_obj: 'set',
					_target: [
						{
							_property: 'selection',
							_ref: 'channel'
						}
					],
					to: {
						_obj: 'rectangle',
						bottom: {
							_unit: 'pixelsUnit',
							_value: by + 1
						},
						left: {
							_unit: 'pixelsUnit',
							_value: bx
						},
						right: {
							_unit: 'pixelsUnit',
							_value: bx + 1
						},
						top: {
							_unit: 'pixelsUnit',
							_value: by
						}
					}
				},
				{
					_obj: 'fill',
					mode: {
						_enum: 'blendMode',
						_value: 'normal'
					},
					opacity: {
						_unit: 'percentUnit',
						_value: 1
					},
					using: {
						_enum: 'fillContents',
						_value: 'white'
					}
				},
			]
		}
	}
	
	return batch
}

const composeAreaExport = ({ bounds, name, folder }) => [
	{
		_obj: 'set',
		_target: [
			{
				'_property': 'selection',
				'_ref': 'channel'
			}
		],
		to: {
			_obj: 'rectangle',
			bottom: {
				'_unit': 'pixelsUnit',
				'_value': bounds.y + bounds.h
			},
			left: {
				'_unit': 'pixelsUnit',
				'_value': bounds.x
			},
			right: {
				'_unit': 'pixelsUnit',
				'_value': bounds.x + bounds.w
			},
			top: {
				'_unit': 'pixelsUnit',
				'_value': bounds.y
			}
		}
	},
	{
		_obj: 'copyToLayer'
	},
	...composeBoundaryDots({ bounds }),
	{
		_obj: 'set',
		_target: [
			{
				_enum: 'ordinal',
				_ref: 'layer'
			}
		],
		to: {
			_obj: 'layer',
			name: name
		}
	},
	{
		_obj: 'exportSelectionAsFileTypePressed',
		_target: {
			_enum: 'ordinal',
			_ref: 'layer'
		},
		fileType: 'png',
		quality: 32,
		metadata: 0,
		destFolder: folder.nativePath,
		sRGB: true,
		openWindow: false,
		_isCommand: true,
		_options: { 
			dialogOptions: 'dontDisplay' 
		}
	}
]