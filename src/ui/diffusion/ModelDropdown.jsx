import { state, setState } from '../../core/app.js'
import { getEligibleModelList, getEligibleModelListGroupedByCategory, setModel } from '../../core/models.js'
import { showModelBrowser } from '../dialogs.js'

export default {
	view: ({ state: { dom } }) => {
		let models = getEligibleModelList()
		let categories = getEligibleModelListGroupedByCategory()
		let loading = models.length === 0

		function select(index){
			if(index >= 0)
				setModel(models[index].id)
		}

		function isSuboptimal(id){
			let model = models.find(
				model => model.id === id
			)

			return state.mode === 'inpaint' && !model?.inpainting
		}

		return (
			<div class="model-dropdown">
				<sp-picker 
					class={isSuboptimal(state.model) && 'suboptimal'} 
					placeholder="Loading Models..."
					onchange={e => select(e.target.selectedIndex)}
					disabled={loading}
				>
					<sp-menu slot="options">
						{
							categories.map(({ category, list }) => (
								<>
									<sp-label>{category}</sp-label>
									{
										list.map(
											({ id, name, inpainting }) => (
												<sp-menu-item 
													class={isSuboptimal(id) && 'suboptimal'}
													selected={id === state.model}
												>
													{name}
												</sp-menu-item>
											)
										)
									}
									<sp-menu-divider></sp-menu-divider>
								</>
							))
						}
					</sp-menu>
				</sp-picker>
				<div class={`explore ${loading && 'disabled'}`} onclick={showModelBrowser}>
					<sp-icon name="ui:More" size="xs" slot="icon"></sp-icon>
				</div>
			</div>
		)
	}
}