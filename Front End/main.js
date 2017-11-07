var audioContext, searchRequest, display

window.onload = function() {
	audioContext = new (window.AudioContext || window.webkitAudioContext)()
	searchRequest = new XMLHttpRequest()
	searchRequest.addEventListener("load", searchComplete);
    searchRequest.addEventListener("error", searchFailed);
}

function playSong(id) {
	// Send request to server
	var request = new XMLHttpRequest()
	request.addEventListener('load', continuePlaying)
	request.addEventListener('error', errorPlaying)
	request.open('GET', `/play/${id}`, true)
	request.send()

	function continuePlaying() {
		// Create buffer
		source = audioContext.createBufferSource()
		// Grab audio
		var audioSource = new XMLHttpRequest()
		// Set audio src
		audioSource.open('GET', `/${request.response}`, true)
		// Set response type to arraybuffer for decoding
		audioSource.responseType = 'arraybuffer'
		audioSource.onload = () => {
			audioContext.decodeAudioData(audioSource.response, buffer => {
				source.buffer = buffer
				// Connect audio to source
				source.connect(audioContext.destination)
				// source.loop = true
				source.start(0)
			})
		}
		audioSource.send()
	}

	function errorPlaying() {
		console.log('Error playing:', request.response)
	}
}

function stopSong() {
	source.stop(0)
}

function fillResults() {
	var display = document.getElementById('display')
	display.innerHTML = ''
	var response = JSON.parse(searchRequest.response)
	response.items.forEach(item => {
		if (item.id.kind == 'youtube#video') {
			display.appendChild(makeCard(item.snippet.title, item.id.videoId, item.snippet.description))
		}
	})	
}

function getSearchResults() {
	var query = document.getElementById('searchTerm').value.replace(/ /gi, '+')
	console.log('query = ', query)
	searchRequest.open('GET', `/search/${query}`, true)
	searchRequest.send()
}

/* ------ Utility functions ------ */ 

function searchComplete() {
	console.log('Search successful')
	console.log(searchRequest.response)
	fillResults()
}

function searchFailed() {
	console.log('Search error:', searchRequest.response)
}

function makeCard(cardTitle, id, cardSnippet) {
	var div = document.createElement('div')
	div.setAttribute('class', 'card')
	div.setAttribute('style', 'margin: 10px; animation: fadeIn 2s;')
	
	var cardBlock = document.createElement('div')
	cardBlock.setAttribute('class', 'card-block')
	
	var title = document.createElement('h4')
	title.innerText = cardTitle
	title.setAttribute('class', 'card-title')
	cardBlock.appendChild(title)
	
	var snippet = document.createElement('p')
	snippet.setAttribute('class', 'card-text')
	snippet.innerText = cardSnippet
	cardBlock.appendChild(snippet)

	var btnPlay = document.createElement('button')
	btnPlay.setAttribute('class', 'btn btn-success')
	btnPlay.style.marginRight = '10px'
	btnPlay.setAttribute('onclick', `playSong('${id}')`)
	btnPlay.innerText = 'Play'

	var btnStop = document.createElement('button')
	btnStop.setAttribute('class', 'btn btn-danger')
	btnStop.style.marginRight = '10px'
	btnStop.setAttribute('onclick', `stopSong()`)
	btnStop.innerText = 'Stop'

	var btnLoad = document.createElement('a')
	btnLoad.setAttribute('class', 'btn btn-primary')
	btnLoad.setAttribute('href', `/${id}.mp3`)
	btnLoad.setAttribute('download', `${cardTitle}`)
	btnLoad.innerText = 'Load'
	btnLoad.appendChild(link)

	cardBlock.appendChild(btnPlay)
	cardBlock.appendChild(btnStop)
	cardBlock.appendChild(btnLoad)
	div.appendChild(cardBlock)
	return div
}