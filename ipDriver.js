var ObjectID = require('mongodb').ObjectID;
var crypto = require('crypto');

IpDriver = function(db) {
	this.db = db;
};

//Alows getting of a collection
IpDriver.prototype.getCollection = function(collectionName, callback) {
	this.db.collection(collectionName, function(error, the_collection) {
		if (error) callback(error);
		else callback(null, the_collection);
	});
};

//Increases the request amount for an IP address
IpDriver.prototype.increment = function(collectionName, address, endpoint, param, callback) {
	
	var secret = "";
	
	//Getting hash secret
	this.getCollection("password", function(error, passwordCollection) {
		if (error) callback(error);
		else {
			//Getting the hash secret from the DB
			passwordCollection.find({"name": "ip"}, function(error, doc) {
				if (error) callback(error);
				else {
					doc.toArray(function (err, pw) {
						if (pw.length !== 0 && pw[0]['secret'] !== undefined) {
							secret = pw[0]['secret'];
						}
					});	
				}
			})
		}
	});
	
	this.getCollection(collectionName, function(error, the_collection) {
		if (error) callback(error);
		else {					
			var ip = {};

			ip['ip'] = crypto.createHmac('sha256', secret).update(address).digest('hex');
			ip['date'] = new Date();
			ip['endpoint'] = endpoint;
			ip['param'] = param;

			//Saving the data
			the_collection.save(ip, {w:1}, function(error, doc) {
				if (error) callback(error);
			});
		}
	});
};

exports.IpDriver = IpDriver;
