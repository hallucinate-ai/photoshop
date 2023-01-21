export default {
	view: ({ attrs }) => (
		<div slot="icon" style="fill: currentColor">
			{ attrs.open ? <Open/> : <Closed/> }
		</div>
	)
}

const Open = {
	view: () => (
		<svg width="26px" height="11px" viewBox="0 0 26 11">
			<g transform="matrix( 1, 0, 0, 1, 0,0) ">
				<path fill="#FFFFFF" stroke="none" d="
					M 0 3.5
					L 4.45 7.9 8.85 3.5 8.15 2.75 4.45 6.45 0.75 2.75 0 3.5
					M 26.9 11.15
					L 26.9 2 19.75 2 19.75 0 12.55 0 12.55 11.15 26.9 11.15
					M 25.85 3.05
					L 25.85 5.05 13.55 5.05 13.55 1.05 18.75 1.05 18.75 3.05 25.85 3.05 Z"/>
			</g>
		</svg>
	)
}

const Closed = {
	view: () => (
		<svg width="26px" height="11px" viewBox="0 0 26 11">
			<g transform="matrix( 1, 0, 0, 1, 0,0) ">
				<path fill="#FFFFFF" stroke="none" d="
					M 2.7 10.2
					L 6.25 5.5 2.7 0.8 1.85 1.4 4.95 5.5 1.85 9.6 2.7 10.2
					M 19.75 1
					L 19.75 0 12.55 0 12.55 1 19.75 1
					M 26.85 11.15
					L 26.85 2.05 12.55 2.05 12.55 11.15 26.85 11.15 Z"/>
			</g>
		</svg>
	)
}