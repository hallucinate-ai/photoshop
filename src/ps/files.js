import uxp from 'uxp'

export async function readDataDir(path){
	try{
		let folder = await uxp.storage.localFileSystem.getDataFolder()
		let entry = await folder.getEntry(path)

		return await entry.getEntries()
	}catch(error){
		console.log(`non existent dir: ${path}`)
		return []
	}
}

export async function createDataFolder(path){
	let folder = await uxp.storage.localFileSystem.getDataFolder()
	let parts = path.split('/')

	for(let part of parts){
		let entries = await folder.getEntries()
		let subfolder = entries.find(entry => entry.name === part)

		folder = subfolder
			? subfolder
			: await folder.createFolder(part)
	}

	console.log(`created data folder: ${folder.nativePath}`)
	
	return folder
}

export async function createTempFolder(){
	let xid = generateXid()
	let tempFolder = await uxp.storage.localFileSystem.getTemporaryFolder()
	
	return await tempFolder.createFolder(xid)
}

export async function getFileForWriting(path){
	let folder = await uxp.storage.localFileSystem.getDataFolder()
	let parts = path.split('/')
	let base = (
		parts.length > 0
			? await folder.getEntry(parts.slice(0, -1).join('/'))
			: folder
	)
	
	return await base.createFile(
		parts[parts.length - 1], 
		{ overwrite: true }
	)
}

export async function writeJson(path, data){
	let file = await getFileForWriting(path)
		
	await file.write(
		JSON.stringify(data, null, 4)
	)
}

export async function writeBinary(path, data){
	let file = await getFileForWriting(path)
		
	await file.write(
		data,
		{ format: uxp.storage.formats.binary }
	)
}

export async function readJson(path){
	try{
		let folder = await uxp.storage.localFileSystem.getDataFolder()
		let file = await folder.getEntry(path)

		return JSON.parse(
			await file.read()
		)
	}catch{
		return null
	}
}

export async function readBinary(path){
	try{
		let folder = await uxp.storage.localFileSystem.getDataFolder()
		let file = await folder.getEntry(path)

		return await file.read({
			format: uxp.storage.formats.binary
		})
	}catch{
		return null
	}
}

export async function deleteFile(path){
	let folder = await uxp.storage.localFileSystem.getDataFolder()
	let file = await folder.getEntry(path)

	await file.delete()
}

export function generateXid(){
	return Math.random()
		.toString(16)
		.slice(3, 13)
		.toUpperCase()
}