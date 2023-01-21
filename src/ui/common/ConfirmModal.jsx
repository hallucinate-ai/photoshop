export default {
	oncreate: node => {
		node.state.dialog = node.dom.parentNode
	},
	view: ({ attrs, state }) => (
		<div class="confirm">
			<div class="body">
				<sp-icon name="ui:AlertSmall" size="xs" slot="icon"></sp-icon>
				<span>{attrs.question}</span>
			</div>
			<div class="actions">
				<sp-button 
					variant="warning" 
					onclick={() => state.dialog.close('confirm')}
				>
					{attrs.actionLabel}
				</sp-button>
				<sp-button 
					variant="secondary"
					onclick={() => state.dialog.close('close')}
				>
					Cancel
				</sp-button>
			</div>
		</div>
	)
}