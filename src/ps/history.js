import ps from 'photoshop'
import { createAnyChangeObserver } from './listeners.js'

export async function deleteHistoryEntry(){
	await ps.core.executeAsModal(
		async () => {
			await ps.action.batchPlay(
				[
					{
						'_obj':'delete',
						'_target': [
							{
								'_property':'currentHistoryState',
								'_ref':'historyState'
							}
						]
					}
				], 
				{ 
					synchronousExecution: true
				}
			)
		},
		{}
	)
}

export function createHistoryModificationObserver(){
	let historyStates = ps.app.activeDocument.historyStates
	let baseState = historyStates[historyStates.length - 1]

	return createAnyChangeObserver({
		criteria: () => baseState.id !== historyStates[historyStates.length - 1].id
	})
}