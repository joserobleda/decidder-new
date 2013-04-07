
	// var promises = require('babel/lib/promises');
	var mail = require('babel/lib/mail');
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

		getPredefinedText: function() {
			var predefined = this.data.predefinedresponses;

			if (predefined) {
				return predefined.join(', ') || '';
			}

			return '';
		},

		getLastEmail: function() {
			var lastEmail = this.data.lastEmail;
			if (lastEmail) return lastEmail;
			return false;
		},

		getSyncData: function () {
			var data = this.data, context = this.data.context || '';

			data.contextHTML = this.getContextHTML();
			data.contextResume = context.length > 120 ? context.substring(0, 120) + "..." : context.length;
			data.predefinedtext = this.getPredefinedText();
			data.date = new Date(data.time);

			return data;
		},

		getViewData: function(cb, ctx) {
			var self = this, data = this.getSyncData();

			self.getDoubts(function(err, doubts){
				if (err) return cb(err);
				data.numberDoubts = doubts.length;

				doubts.each('getViewData', 'question').then(function(doubtsViewData){
					if (err) return cb(err);
					data.doubts = doubtsViewData;

					self.getResponses(function(err, responses){
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
				});
			});
		},


		getViewDoubts: function(cb) {
			var self = this, data = {};
			this.getDoubts(function(err, doubts){
				if (err) return cb(err);
				doubts.each('getViewData', 'question').then(function(doubtsViewData){
					data.doubts = doubtsViewData;
					
					cb(null, data);
					
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


		getDoubts: function(cb) {
			var Doubt = require('./doubt'), doubt = this;
			Doubt.find({question: this.getId()}, function(err, doubts) {
				if (err) return cb.call(doubt, err);
				return cb.call(doubt, null, doubts);
			});
		},


		getRespondedDoubts: function(cb) {
			var Doubt = require('./doubt'), doubt = this;
			Doubt.find({question: this.getId()}, function(err, doubts) {
				if (err) return cb.call(doubt, err);
				return cb.call(doubt, null, doubts);
			});
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

		sendDoubt: function(info, cb) {
			var self = this;
			
			self.getUser(function(err, theUser){
				if (err) return cb(err);

				theUser.getViewData(function(err, userData){

					var mailOptions = {
					    from: "hello@babelbite.com",
					    to: userData.email,
					    subject: "Request more info",
					    forceEmbeddedImages: true,
					    html: "A user request more info about your question: " + info
					}

					var email = new mail();
					email.send(mailOptions, function(err) {
						cb(null, null);
					});
				})
			});
		},

		setEmailSentTime: function(val, cb) {
			var self = this;
			self.set({'lastEmail': val}).save(function(err, dbData) {
				if (err) return cb(err);
				cb(null, null);
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
