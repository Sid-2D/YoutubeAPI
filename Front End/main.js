var audioContext, searchRequest, display

window.onload = function() {
	audioContext = new (window.AudioContext || window.webkitAudioContext)()
	searchRequest = new XMLHttpRequest()
	searchRequest.addEventListener("load", searchComplete);
    searchRequest.addEventListener("error", searchFailed);
}

function playSong() {
	// Create buffer
	source = audioContext.createBufferSource()
	// Grab audio
	var request = new XMLHttpRequest()
	// Set audio src
	request.open('GET', '/safe.mp3', true)
	// Set response type to arraybuffer for decoding
	request.responseType = 'arraybuffer'
	request.onload = () => {
		audioContext.decodeAudioData(request.response, buffer => {
			source.buffer = buffer
			// Connect audio to source
			source.connect(audioContext.destination)
			// source.loop = true
			source.start(0)
		})
	}
	request.send()
}

function stopSong() {
	source.stop(0)
}

function getSearchResults() {
	var query = document.getElementById('searcgTerm').value.replace(/ /gi, '+')
	searchRequest.open('GET', `/search/${query}`, true)
}

/* ------ Utility functions ------ */ 

function searchComplete() {
	console.log(searchRequest.response)
}

function searchFailed() {
	console.log('Search error:', searchRequest.response)
}