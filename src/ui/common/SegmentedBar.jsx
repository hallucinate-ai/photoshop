export default {
	view: ({ attrs }) => (
		<div class="segmented-bar">
			{
				attrs.options.map(
					option => (
						<div 
							class={option.value === attrs.active ? 'active' : ''}
							onclick={() => attrs.onchange(option.value)}
						>
							<label>{option.label}</label>
						</div>
					)
				)
			}
		</div>
	)
}