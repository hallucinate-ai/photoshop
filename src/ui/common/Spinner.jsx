export default {
	oncreate: node => {
		let spinnerDom = node.dom.querySelector('g')
		let start = Date.now()
		
		function tick(){
			let angle = (Date.now() - start) / 7
			spinnerDom.setAttribute('transform', `rotate(${angle} 41 41)`)

			if(!node.state.removed)
				requestAnimationFrame(tick)
		}

		tick()
	},
	onremove: node => {
		node.state.removed = true
	},
	view: node => (
		<svg class="spinner" width="32px" height="32px" viewBox="0 0 82 82">
			<g>
				<path class="bg" fill="#444444" stroke="none" d="
				M 41.6 0.05
				Q 41.4 0.05 41.2 0.05 24.15 0.05 12.05 12.15 0 24.2 0 41.3 0 56.75 9.85 68.1 10.9 69.3 12.05 70.45 24.15 82.55 41.2 82.55 58.3 82.55 70.35 70.45 82.45 58.4 82.45 41.3 82.45 24.2 70.35 12.15 58.45 0.2 41.6 0.05
				M 41.2 12.85
				Q 41.4005859375 12.85 41.6 12.85 53.1419921875 12.991015625 61.35 21.15 69.65 29.5 69.65 41.3 69.65 53.1 61.35 61.4 53 69.75 41.2 69.75 29.45 69.75 21.1 61.4 12.75 53.1 12.75 41.3 12.75 29.5 21.1 21.15 29.45 12.85 41.2 12.85 Z"/>
				
				<path class="fg" fill="#444444" stroke="none" d="
				M 41.6 0
				L 41.6 12.85
				Q 53.1419921875 12.991015625 61.35 21.15 69.65 29.5 69.65 41.3
				L 82.45 41.3
				Q 82.45 27.85 74.35 16.9 66.3 5.95 53.45 1.9 47.55 0.05 41.6 0 Z"/>
			</g>
		</svg>
	)
}