import ps from 'photoshop'
import uxp from 'uxp'
import { readSelectionBounds } from './utils.js'


export async function placeImage({ path, name, bounds }){
	let folder = await uxp.storage.localFileSystem.getDataFolder()
	let file = await folder.getEntry(path)
	let token = uxp.storage.localFileSystem.createSessionToken(file)
	let selection = await readSelectionBounds()
	let offset

	if(bounds){
		let x = bounds.x + bounds.w/2 - ps.app.activeDocument.width/2
		let y = bounds.y + bounds.h/2 - ps.app.activeDocument.height/2

		if(selection){
			x -= (selection.x + selection.w/2) - ps.app.activeDocument.width/2
			y -= (selection.y + selection.h/2) - ps.app.activeDocument.height/2
		}

		offset = { x, y }
	}

	await ps.core.executeAsModal(
		async ctrl => {
			let suspension = await ctrl.hostControl.suspendHistory({
				documentID: ps.app.activeDocument.id,
				name: 'Place Hallucinate Image'
			})

			await ps.action.batchPlay(
				selection
					? [
						...composeSaveCurrentSelection(),
						...composePlaceAsNewLayerRasterized({
							token,
							offset,
							name
						}),
						...composeRestoreCurrentSelection()
					]
					: composePlaceAsNewLayerRasterized({
						token,
						offset,
						name
					}), 
				{ 
					synchronousExecution: true
				}
			)
			
			await ctrl.hostControl.resumeHistory(suspension)
		},
		{ 
			commandName: 'Placing hallucination image'
		}
	)
}

const composePlaceAsNewLayerRasterized = ({ token, offset, name }) => [
	{
		_obj: 'placeEvent',
		null: {
			_kind: 'local',
			_path: token
		},
		freeTransformCenterState: {
			_enum: 'quadCenterState',
			_value: 'QCSAverage'
		},
		offset: {
			_obj: 'offset',
			horizontal: {
				'_unit': 'pixelsUnit',
				'_value': offset?.x || 0
			},
			vertical: {
				'_unit': 'pixelsUnit',
				'_value': offset?.y || 0
			}
		}
	},
	{
		_obj: 'set',
		_target: [{ _enum: 'ordinal', _ref: 'layer' }],
		to: { _obj: 'layer', name }
	},
	{
		_obj: 'rasterizeLayer',
		_target: [{ _enum: 'ordinal', _ref: 'layer' }]
	}
]

const composeSaveCurrentSelection = () => [
	{
		_obj: 'duplicate',
		_target: [
			{
				_property: 'selection',
				_ref: 'channel'
			}
		],
		name: 'Hallucinate Temp Mask'
	}
]

const composeRestoreCurrentSelection = () => [
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
		_obj: 'delete',
		_target: [
			{
				_enum: 'ordinal',
				_ref: 'channel'
			}
		]
	}
]