var audioContext, searchRequest, searchDisplay

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
	var loader = document.createElement('div')
	loader.setAttribute('class', 'loader')
	document.getElementById(id).appendChild(loader)

	function continuePlaying() {
		var audio = new Audio()
		audio.src = `/${id}.mp3`
		audio.controls = true
		audio.autoplay = true
		audio.setAttribute('style', 'animation: fadeIn 1s')
		var analyser = audioContext.createAnalyser()
		var source = audioContext.createAnalyser()
		source.connect(analyser)
		analyser.connect(audioContext.destination)
		// Remove button and add audio source
		var card = document.getElementById(id)
		var children = document.getElementById(id).childNodes;
		card.removeChild(children[children.length - 1])
		card.removeChild(children[children.length - 1])
		card.appendChild(audio)
		// Add card to player
		var player = document.getElementById('player')
		player.style.color = "#000"
		var div = document.createElement('div')
		div.setAttribute('class', 'card')
		div.setAttribute('style', 'margin: 10px; animation: fadeIn 2s;')

		var songCard = document.getElementById(id).cloneNode(true)
		div.appendChild(songCard)

		player.appendChild(div)
	}

	function errorPlaying() {
		console.log('Error playing:', request.response)
	}

}

function stopSong() {
	source.stop(0)
}

function fillResults() {
	var searchDisplay = document.getElementById('search')
	searchDisplay.innerHTML = ''
	searchDisplay.style.color = '#000'
	var response = JSON.parse(searchRequest.response)
	response.items.forEach(item => {
		if (item.id.kind == 'youtube#video') {
			searchDisplay.appendChild(makeCard(item.snippet.title, item.id.videoId, item.snippet.description))
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
	cardBlock.setAttribute('id', id)
	
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
	btnPlay.innerText = 'Listen'

	cardBlock.appendChild(btnPlay)
	div.appendChild(cardBlock)
	return div
}