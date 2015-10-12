var https = require("https");

var fs = require("fs");

var url = require("url");

var encoder = require("form-urlencoded");

var accessToken;

var options = {
	key: fs.readFileSync('cert/key.pem'),
	cert: fs.readFileSync('cert/cert.pem'),
	passphrase: "cock"
}

var server = https.createServer(options, function(req, res){
	console.log(req.url);
	if(req.url.slice(0,6) === "/site/"){
		returnStaticFile(req.url, res);
	}
	else{
		console.log(req.url);
		if(req.url.match(/\/oauthcallback/)){
			return handleOAuth(req, res);
		}
		if(req.url.match(/\/info/)){
			return handleInfo(req, res);
		}
		return404(res);
	}
});



server.listen(8000);

console.log("server start");


function returnStaticFile (name, response) {
	fs.readFile(__dirname + name, function(err, data) {
		if(err)
		{
			return return404(response);
		}

		response.setHeader("Content-Type", convertNameToType(name));
		response.end(data);
	});
}

function convertNameToType (name) {
	if(name.slice(-5) === '.html')
		return 'text/html;charset=utf-8';
	else
		return 'application/javascript';
}


function return404 (response) {
	response.setHeader("Content-Type", "text/plain;charset=utf-8");
	response.statusCode = 404;
	response.end("СТРАНИЦА НИНАЙДЕНА");
}


function handleOAuth (req, res) {
	console.log(req.url);
	var authCode = url.parse(req.url, true).query.code;
	var params = {
		redirect_uri: 'https://localhost:8000/oauthcallback',
		scope: 'sc2.profile',
		grant_type: 'authorization_code',
		code: authCode
	};
	var encodedParams = encoder.encode(params);
	var options = {
		hostname: 'eu.battle.net',
		path: '/oauth/token',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': encodedParams.length,
			'Authorization': 'Basic ZW05YjR1dm40cTJoZnR1OG1jYXh3cnF4d2FlMjRtN2I6REs5OFE4YVRHWnFEaFdzWW4zSzlxUzN0eldDYU5zZzI='
		}
	};

	var bNetRequest = https.request(options, function(bNetResponse) {
		var data = '';
		bNetResponse.on('data', function(dataPart) {
			data += dataPart;
		});
		bNetResponse.on('end', function() {
			console.log(data);
			accessToken = JSON.parse(data).access_token;
			returnStaticFile('/site/info.html', res);
		});
	});

	
	console.log(encodedParams);
	bNetRequest.write(encodedParams);
	bNetRequest.end();
	
}

function handleInfo (req, res) {
	var options = {
		hostname: 'eu.api.battle.net',
		path: '/sc2/profile/user',
		headers: {
			'Authorization': 'Bearer ' + accessToken
		}
	};
	https.request(options, function(bNetResponse) {
		var data = '';
		bNetResponse.on('data', function(dataPart) {
			data += dataPart;
		});
		bNetResponse.on('end', function() {
			console.log(accessToken);
			console.log(data);
			console.log(bNetResponse.headers);
			res.end(data);
		});
	}).end();
}