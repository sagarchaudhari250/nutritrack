var http = require('http');
var express = require('express');
var app = express();

const util = require('util');

var NutritionixClient = require('nutritionix');
var nutritionix = new NutritionixClient({
	appId: 'af96dc5f',
	appKey: 'e6fef1590a42ea8f6b1cb64164f25c98'
});

app.use(express.static(__dirname));

app.get('/search/', function (req, res) {
	var n = req.query.q;
	nutritionix.autocomplete({ q: n })
	.then(function(data){
		res.send(data);
	})
	.catch(function(){
		console.log("error1");
	});
});

app.listen(8085);
console.log("app listening on port 8085");