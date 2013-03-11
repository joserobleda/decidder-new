
	// var promises = require('babel/lib/promises');
	var Dbitem = require('babel/models/dbitem');
	var Response = require('./response');
	var Argument = require('./argument');
	var ghm = require("ghm");
	


	var Question = Dbitem.extend({

		getUser: function(cb) {
			var User = require('./user');
			var userID = this.get('owner');

			User.findById(userID, function(err, theUser){
				if (err) return cb(err);
				cb(null, theUser);
			});
		},

		hasResponse: function(user, cb) {
			var question = this;

			Argument.find({owner:user.getId(), question:question.getId()}, function(err, arguments) {
				cb.call(question, err, !!(arguments && arguments.length));
			});
		},

		getContextHTML: function() {
			return ghm.parse(this.data.context || '');
		},

		getPredefinedResponsesHTML: function() {
			var predefined = this.data.predefinedresponses;

			if (predefined) {
				return predefined.join(', ') || '';
			}

			return '';
		},

		getViewData: function(cb, ctx) {
			var self = this, data = this.data;

			data.contextHTML = this.getContextHTML();
			data.predefinedresponsesHTML = this.getPredefinedResponsesHTML();
			data.date = new Date(data.time);

			this.getResponses(function(err, responses){
				if (err) return cb(err);

				responses.each('getViewData', 'question').then(function(responsesViewData){
					data.responses = responsesViewData;

					self.getUser(function(err, theUser){
						if (err) return cb(err);

						if (ctx === 'user') {
							data.owner = theUser.data;
							return cb(null, data);
						};

						theUser.getViewData(function(err, userData){
							data.owner = userData;

							cb(null, data);
						}, 'question');
					});
				});

			});
		},


		getResponses: function(cb) {
			var Response = require('./response'), response = this;

			Response.find({question: this.getId()}, function(err, responses) {
				if (err) return cb.call(response, err);
				return cb.call(response, null, responses);
			}, {"sort": [['isChosen','desc'], ['numArguments','desc']]});
		},


		setChosenResponse: function(response, cb) {
			var self = this;
			this.set({'chosen': response}).save(function(err, dbData) {
				if (err) return cb(err);

				Response.findOne({'isChosen':true}, function(err, theResponse){
					if (err) return cb(err);

					var afterClear = function() {
						response.set({'isChosen': true}).save(function(err, dbData) {
							if (err) return cb(err);

							cb(null, response);
						});
					};

					if (theResponse){
						theResponse.set({'isChosen': false}).save(function(err, dbData) {
							if (err) return cb(err)
							afterClear();
						});
					} else {
						afterClear();
					}

				});

			});
		},

		remove: function (cb) {
			var question = this;

			this.getResponses(function(err, responses) {
				responses.each('remove').then(function() {
					question._parent(cb);
				});
			})
		}
	});

	Question.collection = 'questions';

	module.exports = Question;
