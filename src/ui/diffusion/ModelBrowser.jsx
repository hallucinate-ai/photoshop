import { state } from '../../core/app.js'
import { getEligibleModelList, getEligibleModelListGroupedByCategory, setModel } from '../../core/models.js'
import Warning from '../common/Warning.jsx'

export default {
	oncreate: ({ state, dom }) => {
		state.dialog = dom.parentNode
	},
	view: ({ state: { dialog } }) => {
		let models = getEligibleModelList()
		let categories = getEligibleModelListGroupedByCategory()

		function select(model){
			setModel(model.id)
			setTimeout(() => dialog.close('close'), 100)
		}

		function isSuboptimal(id){
			let model = models.find(
				model => model.id === id
			)

			return state.mode === 'inpaint' && !model?.inpainting
		}

		return (
			<div class="model-browser">
				{
					categories.map(({ category, list }) => (
						<>
							<span class="category">{category}</span>
							{
								list.map(
									model => <Model 
										model={model} 
										onselect={() => select(model)}
										suboptimal={isSuboptimal(model.id)}
										warning={isSuboptimal(model.id) && 'Not a native inpainting model!'}
									/>
								) 
							}
						</>
					))
				}
			</div>
		)
	}
}

const Model = {
	oncreate: ({ attrs, dom }) => {
		if(attrs.model.id === state.model){
			setTimeout(
				() => {
					let bounds = dom.getBoundingClientRect()
					let containerBounds = dom.parentNode.parentNode.getBoundingClientRect()

					if(bounds.y < 0 || bounds.y + bounds.height > containerBounds.height)
						dom.scrollIntoView()
				},
				25
			)
		}
	},
	view: ({ attrs }) => {
		let { model, suboptimal, warning } = attrs

		return (
			<div class={`model ${model.id === state.model && 'selected'} ${suboptimal && 'suboptimal'}`}>
				<div class="info">
					<span class="name">{model.name}</span>
					<span class="description">{model.description}</span>
					{warning && <Warning message={warning}/>}
				</div>
				{
					state.model === model.id
						? (
							<sp-button variant="primary" disabled>
								<sp-icon name="ui:SuccessSmall" size="s" slot="icon"></sp-icon>
								Selected
							</sp-button>
						)
						: (
							<sp-button variant="primary" onclick={attrs.onselect}>
								Select
							</sp-button>
						)
				}
				<div class="images">
					{
						model.images.map(
							url => (
								<div style={`background-image: url(${url})`}/>
							)
						)
					}
				</div>
			</div>
		)
	}
}