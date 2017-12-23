var audioContext, searchRequest, searchDisplay, currentSong, gainNode

window.onload = function() {
	audioContext = new (window.AudioContext || window.webkitAudioContext)()
	gainNode = audioContext.createGain()
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
		source.connect(gainNode)
		gainNode.connect(audioContext.destination)
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
		div.setAttribute('style', 'margin: 10px; animation: fadeIn 1s;')
		// Insert card
		var songCard = document.getElementById(id).cloneNode(true)
		songCard.appendChild(audio)

		// Add Panel here
		var btn = document.createElement('button')
		btn.innerHTML = 'Panel'
		btn.setAttribute('class', 'btn btn-sm btn-primary')
		btn.setAttribute('data-toggle', 'collapse')
		btn.setAttribute('data-target', `#panel${id}`)
		songCard.appendChild(document.createElement('br'))
		songCard.appendChild(btn)
		div.appendChild(songCard)

		if (currentSong) {
			currentSong.pause()
			currentSong.currentTime = 0
		}
		currentSong = audio
		audio.volume = 0.1
		audio.play()

		audio.addEventListener('canplaythrough', function() { 
			songCard.appendChild(makeAudioPanel(id, audio))
		}, false);

		// Add onplay event and play
		audio.onplay = () => {
			if (currentSong && currentSong != audio) {
				currentSong.pause()
				currentSong.currentTime = 0
				currentSong = audio
				fillRelated(id)
			}
		}
		songCard.removeChild(songCard.childNodes[songCard.childNodes.length - 4])
		// Only keep limited number of active songs on player
		player.insertBefore(div, player.childNodes[0])
		if (player.childNodes.length == 10) {
			player.removeChild(player.childNodes[9])
		}
		// Play a little blink effect on tab
		document.getElementById('playerResults').style.animation = 'colorChange 1s'
		// Reset animation
		setTimeout(() => {
			document.getElementById('playerResults').style.animation = null
			document.getElementById('playerResults').style.animation = 'none'
		}, 1000)
		fillRelated(id);
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
		// Add more button
		// var btn = document.createElement('button')
		// btn.setAttribute('class', 'btn btn-default')
		// btn.style.margin = '2px'
		// btn.style.width = '100%'
		// btn.innerHTML = 'More'
		// var pageNo = 1
		// btn.setAttribute('onclick', 'getMoreRelated()')
		// relatedDisplay.appendChild(btn)

		// function getMoreRelated() {
		// 	// Request for number
		// 	pageNo++;
		// 	console.log(pageNo)
		// }
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

function getTimeString(seconds) {
	let minutes = parseInt(seconds / 60)
	let hours = parseInt(minutes / 60)
	if (minutes < 10) {
		minutes = '0' + minutes
	}
	seconds = parseInt(seconds % 60)
	if (seconds < 10) {
		seconds = '0' + seconds
	}
	if (hours) {
		minutes = parseInt(minutes % 60)
		if (minutes < 10) {
			minutes = '0' + minutes
		}
		return hours + ':' + minutes + ':' + seconds
	}
	return minutes + ':' + seconds
}

function searchComplete() {
	console.log('Search successful')
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
	div.setAttribute('style', 'margin: 10px; animation: fadeIn 1s;')
	
	var cardBlock = document.createElement('div')
	cardBlock.setAttribute('class', 'card-block')
	cardBlock.setAttribute('id', id)
	
	var title = document.createElement('h5')
	title.innerText = cardTitle
	title.setAttribute('class', 'card-title')
	cardBlock.appendChild(title)

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

function makeAudioPanel(id, audio) {
	var div = document.createElement('div')
	div.setAttribute('id', `panel${id}`)
	div.setAttribute('class', `collapse`)
	// div.style.marginLeft = '10px'
	div.style.background = '#e8ecf2'
	div.style.borderRadius = '25px'
	div.style.paddingLeft = '5px'
	div.style.paddingRight = '5px'
	div.appendChild(document.createElement('br'))
	// Precise Seek
	let h6 = document.createElement('h6')
	h6.innerHTML = 'Seek:'
	div.appendChild(h6)
	var seekSlider = document.createElement('div')
	noUiSlider.create(seekSlider, {
		start: [ 0 ],
		connect: true,
		range: {
			'min': [  0 ],
			'max': [ audio.duration ]
		}
	})

	var seekSliderValueElement = document.createElement('div')
	seekSlider.appendChild(seekSliderValueElement)
	seekSliderValueElement.innerHTML = 0

	seekSlider.noUiSlider.on('update', (values, handle) => {
		seekSliderValueElement.innerHTML = getTimeString(values[handle])
		
	})

	seekSlider.noUiSlider.on('end', (value) => {
		audio.currentTime = value
	});

	let range = []
	var rangeSlider = document.createElement('div')
	var rangeSliderValueElement = document.createElement('div')
	// Range Loop
	noUiSlider.create(rangeSlider, {
		start: [ 0, audio.duration ],
		connect: [ false, true, false ],
		range: {
			'min': [ 0 ],
			'max': [ audio.duration ]
		}
	});

	rangeSlider.noUiSlider.on('update', (values, handle) => {
		rangeSliderValueElement.innerHTML = getTimeString(values[0]) + ' - ' + getTimeString(values[1])
	})

	rangeSlider.noUiSlider.on('end', (values) => {
		rangeSliderValueElement.innerHTML = getTimeString(values[0]) + ' - ' + getTimeString(values[1])
		range[0] = values[0]
		range[1] = values[1]
	});

	rangeSlider.appendChild(rangeSliderValueElement)
	rangeSliderValueElement.innerHTML = getTimeString(0) + ' - ' + getTimeString(audio.duration)

	div.appendChild(seekSlider)
	div.appendChild(document.createElement('br'))

	h6 = document.createElement('h6')
	h6.innerHTML = 'Range:'
	h6.style.marginTop = '15px'
	div.appendChild(h6)

	let loopBtn = document.createElement('button')
	loopBtn.innerHTML = 'Loop'
	loopBtn.setAttribute('class', 'btn btn-sm btn-success')
	loopBtn.onclick = loopFunction.bind(null, audio)
	rangeSlider.appendChild(loopBtn)

	let saveBtn = document.createElement('button')
	saveBtn.innerHTML = 'Save'
	saveBtn.setAttribute('class', 'btn btn-sm btn-info')
	saveBtn.style.marginLeft = '5px'
	rangeSlider.appendChild(saveBtn)

	div.appendChild(rangeSlider)
	div.appendChild(document.createElement('br'))
	div.appendChild(document.createElement('br'))

	// Add Volume boost
	h6 = document.createElement('h6')
	h6.innerHTML = 'Volume Boost:'
	h6.style.marginTop = '15px'

	div.appendChild(h6)

	let stepSlider = document.createElement('div')
	noUiSlider.create(stepSlider, {
		start: [ 1 ],
		step: 0.2,
		range: {
			'min': [ 1 ],
			'max': [ 2 ]
		}
	})

	div.appendChild(stepSlider)
	div.appendChild(document.createElement('br'))
	return div
	
}

function loopFunction(audio) {
	console.log(audio.duration)
	gainNode.gain.setValueAtTime(0, audioContext.currentTime)
	// gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 10)
	gainNode.gain.value = 0.01
}

function getLocal() {
	var request = new XMLHttpRequest()
	let div = document.getElementById('tempLocal')
	request.addEventListener('load', continuePlaying)
	request.addEventListener('error', errorPlaying)
	request.open('GET', `file:///storage/emulated/0/Download/`, true)
	request.send()
	function continuePlaying() {
		div.innerHTML = request.response
	}
	function errorPlaying() {
		div.innerHTML = request.response
	}
}