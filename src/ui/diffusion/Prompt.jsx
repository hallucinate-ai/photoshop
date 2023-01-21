import { state as appState, setState, isDiffusionDisabled } from '../../core/app.js'


export default {
	oncreate: ({ attrs, state, dom }) => {
		state.didFocus = () => {
			
		}
	},
	view: ({ attrs, state }) => (
		<div class="prompt-field">
			<sp-label slot="label">Prompt</sp-label>
			<sp-textarea 
				size="l"
				placeholder={attrs.hint} 
				value={appState.prompt}
				oninput={e => setState({ prompt: e.target.value })}
				onfocus={() => setState({ promptInvalid: false })}
				invalid={appState.promptInvalid}
				disabled={isDiffusionDisabled()}
			/>
		</div>
	)
}