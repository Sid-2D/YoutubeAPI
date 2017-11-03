var express = require('express'),
	app = express(),
	request = require('request'),
	childProcess = require('child_process')

var query = 'Capital+Cities'

express.static(__dirname)

app.use(express.static('Music'))

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/Front End/index.html')
})

app.get('/search', (req, res) => {
	request(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=${process.env.APIKEY}`, (err, response, body) => {
		if (err) {
			console.log('Error making request: ', err)
		}
		body = JSON.parse(body)
		console.log(body)
		res.send(JSON.stringify(body, null , 2))
	})
})

app.listen(3000, err => {
	if (err) {
		console.log('Error starting server:', err)
	} else {
		console.log('Listening on port 3000...')
	}
})