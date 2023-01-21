import { api, state, setState } from './app.js'


export function getModelById(id){
	if(!state.models)
		return

	return state.models.find(model => model.id === id)
}

export function getEligibleModelList(){
	if(!state.models)
		return []

	if(state.mode === 'inpaint'){
		return [
			...state.models.filter(
				({ inpainting }) => inpainting
			),
			...state.models.filter(
				({ inpainting }) => !inpainting
			)
		]
	}else{
		return state.models.filter(
			({ inpainting }) => !inpainting
		)
	}
}

export function getEligibleModelListGroupedByCategory(){
	let models = getEligibleModelList() || []
	let categories = []

	for(let model of models){
		let entry = categories.find(
			({ category }) => category === model.category
		)

		if(!entry){
			categories.push(entry = {
				category: model.category,
				list: []
			})
		}

		entry.list.push(model)
	}

	return categories
}

export async function fetchModelList(){
	let models = await api.getModels()

	setState({ models })
	applyModelSelectionRestrictions()

	console.log('model list:', models)
}

export function setModel(id){
	setState({
		model: id
	})
}

export function applyModelSelectionRestrictions(){
	let models = getEligibleModelList()

	if(models.length === 0)
		return

	if(!state.model){
		setModel(models[0].id)
	}else{
		let previousModel = state.models.find(
			model => model.id === state.model
		)

		if(models.every(model => model.id !== state.model)){
			let associatedModelFromInpainting = models.find(
				model => model.inpaintingModel === previousModel.id
			)

			if(associatedModelFromInpainting){
				setModel(associatedModelFromInpainting.id)
			}else{
				setModel(models[0].id)
			}
		}else if(state.mode === 'inpaint'){
			if(previousModel?.inpaintingModel){
				setModel(previousModel.inpaintingModel)
			}
		}
	}
}