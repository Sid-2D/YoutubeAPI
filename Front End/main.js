var audioContext, searchRequest, searchDisplay, currentSong

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

	var audio = new Audio()
	audio.play()

	function continuePlaying() {
		audio.src = `/${id}.mp3`
		audio.controls = true
		// audio.autoplay = true
		audio.setAttribute('style', 'animation: fadeIn 1s')
		var analyser = audioContext.createAnalyser()
		var source = audioContext.createAnalyser()
		source.connect(analyser)
		analyser.connect(audioContext.destination)
		// Remove button and add audio source
		var card = document.getElementById(id)
		var children = document.getElementById(id).childNodes;
		card.removeChild(children[children.length - 1])
		children[children.length - 1].className = 'btn btn-danger'
		// Add card to player
		var player = document.getElementById('player')
		player.style.color = "#000"
		// Create card div
		var div = document.createElement('div')
		div.setAttribute('class', 'card')
		div.setAttribute('style', 'margin: 10px; animation: fadeIn 2s;')
		// Insert card
		var songCard = document.getElementById(id).cloneNode(true)
		songCard.appendChild(audio)
		div.appendChild(songCard)
		// Play song
		audio.play()
		if (currentSong) {
			currentSong.pause()
		}
		currentSong = audio
		songCard.removeChild(songCard.childNodes[songCard.childNodes.length - 2])
		player.insertBefore(div, player.childNodes[0])
		document.getElementById('playerResults').style.animation = 'colorChange 1s'
		setTimeout(() => {
			document.getElementById('playerResults').style.animation = null
			document.getElementById('playerResults').style.animation = 'none'
		}, 1000)
		// Fill related
		fillRelated(id) 
	}

	function errorPlaying() {
		console.log('Error playing:', request.response)
	}

}

function fillRelated(id) {
	var relatedRequest = new XMLHttpRequest()
	relatedRequest.addEventListener('load', relatedSuccess)
	relatedRequest.addEventListener('error', relatedError)
	relatedRequest.open('GET', `/related/${id}/0`, true)
	relatedRequest.send()

	function relatedSuccess() {
		var relatedDisplay = document.getElementById('related')
		relatedDisplay.innerHTML = ''
		relatedDisplay.style.color = '#000'
		var response = JSON.parse(relatedRequest.response)
		response.items.forEach(item => {
			relatedDisplay.appendChild(makeCard(item.snippet.title, item.id.videoId, item.snippet.description))
		})
	}

	function relatedError() {
		console.log('Error playing:', relatedRequest.response)
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
		// if (item.id.kind == 'youtube#video') {
		searchDisplay.appendChild(makeCard(item.snippet.title, item.id.videoId, item.snippet.description))
		// }
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
	// Animate tab
	document.getElementById('searchResults').style.animation = 'colorChange 1s'
	setTimeout(() => {
		document.getElementById('searchResults').style.animation = null
		document.getElementById('searchResults').style.animation = 'none'
	}, 1000)
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
	
	var title = document.createElement('h5')
	title.innerText = cardTitle
	title.setAttribute('class', 'card-title')
	cardBlock.appendChild(title)
	
	// var snippet = document.createElement('p')
	// snippet.setAttribute('class', 'card-text')
	// snippet.innerText = cardSnippet
	// cardBlock.appendChild(snippet)

	var btnPlay = document.createElement('button')
	btnPlay.setAttribute('class', 'btn btn-success')
	btnPlay.style.marginRight = '10px'
	btnPlay.style.fontSize = 'smaller'
	btnPlay.setAttribute('onclick', `playSong('${id}')`)
	btnPlay.innerText = 'Listen'

	cardBlock.appendChild(btnPlay)
	div.appendChild(cardBlock)
	return div
}