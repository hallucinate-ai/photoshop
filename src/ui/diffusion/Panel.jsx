import { setMode, setState, state } from '../../core/app.js'
import SegmentedBar from '../common/SegmentedBar.jsx'
import ModelDropdown from './ModelDropdown.jsx'
import Generate from './Generate.jsx'
import Inpaint from './Inpaint.jsx'
import Outpaint from './Outpaint.jsx'
import Spinner from '../common/Spinner.jsx'

import '../../../styles/global.scss'
import '../../../styles/dialogs.scss'
import '../../../styles/diffusion.scss'
import { getModelById } from '../../core/models.js'
import Warning from '../common/Warning.jsx'

const modes = [
	{
		value: 'generate',
		label: 'Generate',
		content: Generate
	},
	{
		value: 'inpaint',
		label: 'Inpaint',
		content: Inpaint
	},
	{
		value: 'outpaint',
		label: 'Outpaint',
		content: Outpaint
	}
]

export default {
	view: () => {
		if(state.ready){
			const activeMode = modes.find(
				({ value })  => value === state.mode
			)

			return (
				<>
					<div class="section head">
						<SegmentedBar
							options={modes}
							active={state.mode}
							onchange={mode => setMode(mode)}
						/>
					</div>
					<div class="section model">
						<>
							<ModelDropdown key={state.model}/>
						</>
						{
							state.mode === 'inpaint' 
							&& !getModelById(state.model)?.inpainting
							&& (
								<Warning message="This is not a native inpainting model. Only use it for large patches."/>
							)
						}
					</div>
					<activeMode.content/>
				</>
			)
		}else{
			return (
				<div class="loading">
					<Spinner/>
				</div>
			)
		}
	}
}