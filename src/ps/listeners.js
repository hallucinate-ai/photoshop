import ps from 'photoshop'
import { updateActiveSelection } from '../core/app.js'

export async function initGenericListeners(){
	ps.action.addNotificationListener(
		[{event: 'set'}], 
		updateActiveSelection
	)
}

export function createAnyChangeObserver({ criteria } = {}){
	let resolve
	let promise = new Promise(r => resolve = r)
	
	let cancel = () => {
		ps.action.removeNotificationListener(
			[{event: 'all'}], 
			eventHandler
		)
	}

	let eventHandler = () => {
		if(criteria && !criteria())
			return
			
		cancel()
		resolve()
	}

	ps.action.addNotificationListener(
		[{event: 'all'}], 
		eventHandler
	)

	return { promise, cancel }
}