export default {
	view: ({ attrs }) => (
		<div class="warning">
			<sp-icon name="ui:AlertSmall" size="s" slot="icon"></sp-icon>
			<span>{attrs.message}</span>
		</div>
	)
}