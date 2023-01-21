import AlertModal from './common/AlertModal.jsx'
import ConfirmModal from './common/ConfirmModal.jsx'
import ModelBrowser from './diffusion/ModelBrowser.jsx'

export async function alert({ title, message }){
	return await presentModal({
		options: {
			title: title || 'Alert'
		},
		view: node => m(AlertModal, {
			message
		})
	})
}

export async function confirm({ title, question, actionLabel }){
	return await presentModal({
		options: {
			title: title || 'Are you sure?'
		},
		view: node => m(ConfirmModal, {
			question,
			actionLabel
		})
	}) === 'confirm'
}

export async function showModelBrowser(){
	await presentModal({
		options: {
			title: 'Model Browser'
		},
		view: node => m(ModelBrowser)
	})
}

async function presentModal(Component){
	let dialog = document.createElement('dialog')

	m.mount(dialog, Component)
	document.body.appendChild(dialog)

	try{
		return await dialog.uxpShowModal(Component.options)
	}catch(err){
		return 'error'
	}finally{
		dialog.remove()
	}
}