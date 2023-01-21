export default {
	oncreate: node => {
		node.state.dialog = node.dom.parentNode
	},
	view: ({ attrs, state }) => (
		<div class="alert">
			<div class="body">
				<sp-icon name="ui:AlertSmall" size="xs" slot="icon"></sp-icon>
				<span>{attrs.message}</span>
			</div>
			<div class="actions">
				<button onclick={() => state.dialog.close('close')}>
					Close
				</button>
			</div>
		</div>
	)
}