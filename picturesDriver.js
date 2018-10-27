var ObjectID = require('mongodb').ObjectID;

PicturesDriver = function(db) {
	this.db = db;
};

//Alows getting of a collection
PicturesDriver.prototype.getCollection = function(collectionName, callback) {
	this.db.collection(collectionName, function(error, the_collection) {
		if (error) callback(error);
		else callback(null, the_collection);
	});
};

/*
 * Gets the album list
 */
PicturesDriver.prototype.albums = function(collectionName, callback) {
	this.getCollection(collectionName, function(error, the_collection) {
		if (error) callback(error);
		else {
			//Finding data in the DB
			the_collection.find({"hidden": false}, function(error, doc) {
				if (error) callback(error);
				else callback(null, doc);
			});
		}
	});
};

/*
 * Gets the contents of an album
 */
PicturesDriver.prototype.albumContents = function(collectionName, album, callback) {
	this.getCollection(collectionName, function(error, the_collection) {
		if (error) callback(error);
		else {
			//Finding data in the DB
			the_collection.find({"album": album}, function(error, doc) {
				if (error) callback(error);
				else callback(null, doc);
			});
		}
	});
};

/*
 * Gets the details of a picture
 */
PicturesDriver.prototype.picture = function(collectionName, name, callback) {
	this.getCollection(collectionName, function(error, the_collection) {
		if (error) callback(error);
		else {
			//Finding data in the DB
			the_collection.findOne({"name": name}, function(error, doc) {
				if (error) callback(error);
				else callback(null, doc);
			});
		}
	});
};

/*
 * Gets the viewcount of a picture
 */
PicturesDriver.prototype.viewcount = function(collectionName, picture, callback) {
	this.getCollection(collectionName, function(error, the_collection) {
		if (error) callback(error);
		else {
			//Counting data in the DB
			the_collection.count({"picture": picture}, function(error, doc) {
				if (error) callback(error);
				else {
					callback(null, doc);
				}
			});
		}
	});
};

exports.PicturesDriver = PicturesDriver;