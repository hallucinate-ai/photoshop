import { isDiffusionDisabled } from '../../core/app.js'

export default {
	view: ({ attrs }) => (
		<sp-slider 
			variant="filled" 
			fill-offset="left" 
			min="0" 
			max="100" 
			value={attrs.freedom}
			onchange={e => attrs.onchange(e.target.value)}
			disabled={isDiffusionDisabled()}
		>
			<sp-label slot="label">{attrs.label}</sp-label>
		</sp-slider>
	)
}