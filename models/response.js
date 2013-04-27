	
	var dbitem = require('babel/models/dbitem');
	var moment = require('babel/lib/moment');

	var response = dbitem.extend({

		getViewData: function(cb) {
			var data = this.data;
			data.date = new moment(Date(data.time)).format("dddd, MMMM Do YYYY, h:mm:ss a");

			this.getArguments(function(err, arguments){
				if (err) return cb(err);

				arguments.each('getViewData', 'user').then(function(argumentsViewData){
					data.arguments = argumentsViewData;

					cb(false, data);
				});
			});
		},

		getArguments: function(cb) {
			var Argument = require('./argument');

			Argument.find({response: this.getId()}, function(err, arguments){
				if (err) return cb(err);
				return cb(null, arguments);
			});
		},

		remove: function (cb) {
			var response = this;

			this.getArguments(function(err, arguments) {
				arguments.each('remove').then(function() {
					response._parent(cb);
				});
			});
		}

	});

	response.collection = 'responses';

	module.exports = response;