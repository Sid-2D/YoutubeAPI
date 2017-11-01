var express = require('express'),
	app = express(),
	request = require('request')

var query = 'Capital+Cities'

request(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=${process.env.APIKEY}`, (err, res, body) => {
	if (err) {
		console.log(err)
	}
	console.log(body)
})