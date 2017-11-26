var express = require('express'),
	app = express(),
	request = require('request'),
	utilities = require('./utilities.js'),	// Make this additional file containing your own functions 
	bodyParser = require('body-parser')

express.static(__dirname)

app.use(bodyParser.json());

app.use(express.static('Front\ End'))

app.use(express.static('Music'))

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/Front End/index.html')
})

app.get('/search/:query', (req, res) => {
	var query = req.params['query']
	request(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${query}&key=${process.env.APIKEY}`, (err, response, body) => {
		if (err) {
			console.log('Error making request: ', err)
		}
		body = JSON.parse(body)
		// console.log(body)
		res.send(JSON.stringify(body, null , 2))	
	})
})

app.get('/play/:id', (req, res) => {
	var id = req.params['id']
	// Embed the youtube player and watch the video here or purchase a legal
	// copy of music by calling appropriate APIs, this feature will not be included
	// in this project.
	utilities.download(id, (err, link) => {
		if (err) {
			console.log('Download error')
			return res.send('Download error')
		}
		res.send(link)
	})
})

app.get('/related/:id/:page', (req, res) => {
	var id = req.params['id']
	var page = parseInt(req.params['page'])
	request(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&relatedToVideoId=${id}&type=video&key=${process.env.APIKEY}`, (err, response, body) => {
		if (err) {
			console.log('Error making related request: ', err)
		}
		body = JSON.parse(body)
		body.items = body.items.slice(page * 10, (page + 1) * 10)
		res.send(JSON.stringify(body, null , 2))	
	})
})

app.listen(process.env.PORT || 3000, err => {
	if (err) {
		console.log('Error starting server:', err)
	} else {
		console.log('Listening on port', process.env.PORT || 3000)
	}
})