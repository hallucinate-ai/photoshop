import ps from 'photoshop'

export function getDocumentDimensions(){
	return {
		w: ps.app.activeDocument.width,
		h: ps.app.activeDocument.height
	}
}

export async function readSelectionBounds({ defaultToFullDocument } = {}){
	let [{ selection }] = await ps.action.batchPlay(
		[{
			_obj: 'get',
			_target: [
				{
					_property: 'selection'
				},
				{
					_ref: 'document',
					_id: ps.app.activeDocument?.id
				}
			],
			_options: {
				dialogOptions: 'dontDisplay'
			}
		}],
		{}
	)

	if(selection && selection.top._unit === 'pixelsUnit'){
		return {
			x: selection.left._value,
			y: selection.top._value,
			w: selection.right._value - selection.left._value,
			h: selection.bottom._value - selection.top._value,
		}
	}else if(defaultToFullDocument){
		return {
			x: 0,
			y: 0,
			w: ps.app.activeDocument.width,
			h: ps.app.activeDocument.height
		}
	}else{
		return null
	}
}


export function generateXid(){
	return Math.random()
		.toString(16)
		.slice(3, 13)
		.toUpperCase()
}