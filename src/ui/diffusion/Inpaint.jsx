import { state, setState, isDiffusionDisabled } from '../../core/app.js'
import Prompt from './Prompt.jsx'
import Results from './Results.jsx'
import Scalar from './Scalar.jsx'


export default node => ({
	view: node => (
		<>
			<div class="section ctrl">
				<Prompt
					hint="Describe what the selected patch should be painted in with"
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
			</div>
			<Results/>
		</>
	)
})
