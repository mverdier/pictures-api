//Using HTTP and Express libraries
var http = require('http'),
	express = require('express'),
	path = require('path');

var MongoClient = require('mongodb').MongoClient,
Server = require('mongodb').Server,
PicturesDriver = require('./picturesDriver').PicturesDriver;
IpDriver = require('./ipDriver').IpDriver;

var app = express();
app.set('port', process.env.PORT || 3004);

var url = 'mongodb://localhost:27017/pictures';
var mongoHost = 'localhost';
var mongoPort = 27017; 
var picturesDriver;
var ipDriver;

//Starting the collection driver linked to our mongo database
MongoClient.connect(url, function(err, db) {
	if (!MongoClient) {
		console.error("Error! Exiting... Must start MongoDB first");
		process.exit(1);
	}

	//Fetching the pictures database and both collection drivers
	picturesDriver = new PicturesDriver(db);
	ipDriver = new IpDriver(db);
});

app.use(express.static(path.join(__dirname, 'public')));

/*
 * Getting a list of the available albums
 * 
 * GET /albums
 */
app.get('/albums', function (req, res) {
	console.log(new Date().toJSON() + ' - [INFO] GET request on /albums');

	//Fetching data
	picturesDriver.latest("albums", function(error, objs) {
		if (error) { res.send(400, error); }
		else { 
			objs.toArray(function (err, articles) {
				res.send(200, articles);
			});
		}
	});

	incrementIp(req.headers['x-forwarded-for'], "albums", "");
});

/*
 * Getting a list of pictures from an album
 * 
 * GET /album?name={albumName}
 */
app.get('/album', function (req, res) {

	var params = req.query;
	var name = "";
	params["__proto__"] = null;
	console.log(new Date().toJSON() + ' - [INFO] GET request on /album with parameters ' + JSON.stringify(params));

	if (params["name"] !== false && typeof params["name"] === "name") {
		//Fetching data
		picturesDriver.albumContents("pictures", params["name"], function(error, objs) {
			if (error) { res.send(400, error); }
			else { 
				res.send(200, objs);
			}
		});

		name = params["name"];
	}

	incrementIp(req.headers['x-forwarded-for'], "album", name);
});

/*
 * Getting the full details of a specific picture
 * The "name" data is the one coming from the album contents
 * 
 * GET /picture?name={pictureName}
 */
app.get('/picture', function (req, res) {

	var params = req.query;
	var name = "";
	params["__proto__"] = null;
	console.log(new Date().toJSON() + ' - [INFO] GET request on /picture with parameters ' + JSON.stringify(params));

	if (params["name"] !== false && typeof params["name"] === "name") {
		//Incrementing viewcount
		picturesDriver.incrementViewcount("viewcount", params["name"], req.headers['x-forwarded-for'], function(error, objs) {
			if (error) { res.send(400, error); }
			else { 
				res.send(200, objs);
			}
		});

		//Fetching data
		picturesDriver.picture("pictures", params["name"], function(error, objs) {
			if (error) { res.send(400, error); }
			else { 
				res.send(200, objs);
			}
		});

		name = params["name"];
	}

	incrementIp(req.headers['x-forwarded-for'], "picture", name);
});

/*
 * Getting the view count of a specific picture
 * The "picture" data is the picture's name coming from the album contents
 * 
 * GET /viewcount?picture={pictureName}
 */
app.get('/viewcount', function (req, res) {

	var params = req.query;
	var name = "";
	params["__proto__"] = null;
	console.log(new Date().toJSON() + ' - [INFO] GET request on /viewcount with parameters ' + JSON.stringify(params));

	if (params["picture"] !== false && typeof params["picture"] === "picture") {
		//Fetching data
		picturesDriver.viewcount("viewcount", params["picture"], function(error, objs) {
			if (error) { res.send(400, error); }
			else { 
				res.send(200, objs);
			}
		});
	}
});


//Creating the web server
http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});

function incrementIp(ip, endpoint, params) {
	//Incrementing IP request count
	ipDriver.increment("ip", id, endpoint, params, function(error) {
		if (error) {
			console.log(new Date().toJSON() + " - [ERROR] Error while incrementing request count for IP " + ip + " on endpoint /" + endpoint + " with parameter " + params + ": " + error);
		}
	});
}