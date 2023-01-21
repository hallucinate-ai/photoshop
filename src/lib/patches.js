const orgAddListener = EventTarget.prototype.addEventListener
const orgRemoveListener = EventTarget.prototype.removeEventListener

EventTarget.prototype.addEventListener = function (type, handler, ...args){
	if(typeof handler === 'object'){
		handler._patchedHandleEvent = handler.handleEvent.bind(handler)
		handler = handler._patchedHandleEvent
	}

	return orgAddListener.call(this, type, handler, ...args)
}

EventTarget.prototype.removeEventListener = function (type, handler, ...args){
	if(typeof handler === 'object'){
		handler = handler._patchedHandleEvent
	}

	return orgRemoveListener.call(this, type, handler, ...args)
}