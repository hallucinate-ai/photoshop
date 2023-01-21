import { state, setState, isDiffusionDisabled } from '../../core/app.js'
import Prompt from './Prompt.jsx'
import Results from './Results.jsx'
import Scalar from './Scalar.jsx'


export default node => ({
	view: node => (
		<>
			<div class="section ctrl">
				<Prompt
					hint="Describe how the generated image should look like"
				/>
				<div class="parameters">
					<Scalar
						label="Prompt Freedom"
						value={state.params.freedom_prompt}
						onchange={value => setState({ 
							params: { 
								...state.params, 
								freedom_prompt: value
							}
						})}
					/>
					{
						state.img2Img && (
							<Scalar
								label="Image Freedom"
								value={state.params.freedom_image}
								onchange={value => setState({ 
									params: { 
										...state.params, 
										freedom_image: value
									}
								})}
							/>
						)
					}
				</div>
				<sp-checkbox
					checked={state.img2Img}
					onchange={e => setState({ img2Img: e.target.checked })}
					disabled={isDiffusionDisabled()}
				>
					Use image input
				</sp-checkbox>
			</div>
			<Results/>
		</>
	)
})
