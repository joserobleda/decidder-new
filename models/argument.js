
	var Dbitem = require('babel/models/dbitem');
	var Response = require('./response');
	
	
	var Argument = Dbitem.extend({
		
		getUser: function(cb) {
			var User = require('./user');
			var userID = this.get('owner');

			User.findById(userID, function(err, theUser){
				if (err) return cb(err);
				cb(null, theUser);
			});
		},

		getResponse: function(cb) {
			var responseID = this.get('response').toString();

			Response.findById(responseID, function(err, response){
				if (err) return cb(err);
				cb(null, response);
			});
		},

		getQuestion: function (cb) {
			var Question = require('./question');
			var questionID = this.get('question').toString();

			Question.findById(questionID, function(err, question){
				if (err) return cb(err);
				cb(null, question);
			});
		},

		getViewData: function(cb, ctx) {
			var  self = this, data = this.data, date = new Date(data.time);;

			data.date = date;
			self.getUser(function(err, theUser){

				if (ctx === 'response') {
					data.owner = theUser.data;
					return cb(null, data);
				};

				if (err) return cb(err);

				theUser.getViewData(function(err, userData){
					data.owner = userData;


					self.getResponse(function(err, response) {
						if (response) data.response = response.data;
						cb(null, data);
					})

					
				}, 'response');
			});
		}
	});

	Argument.events.on('new', function (argument) {
		argument.getQuestion(function (err, question) {
			if (err) return err;
			return question.events.emit('change', {type: 'argument', argument: argument});
		});
	});


	Argument.events.on('remove', function (argument) {
		argument.getQuestion(function (err, question) {
			if (err) return err;
			return question.events.emit('change', {type: 'argument', argument: argument});
		});
	});

	Argument.collection = 'arguments';
	
	module.exports = Argument;