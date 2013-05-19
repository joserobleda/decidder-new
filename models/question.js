
	var mail = require('babel/lib/mail');
	var Dbitem = require('babel/models/dbitem');
	var moment = require('babel/lib/moment');
	


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
			var Argument = require('./argument');
			var question = this;

			Argument.find({owner:user.getId(), question:question.getId()}, function(err, arguments) {
				cb.call(question, err, !!(arguments && arguments.length));
			});
		},

		getContextHTML: function() {
			return (this.data.context || '').tweetify('target="_blank"').ghm();
		},

		getPredefinedText: function() {
			var predefined = this.data.predefinedresponses;

			if (predefined) {
				return predefined.join(', ') || '';
			}

			return '';
		},

		getLastEmailDoubt: function() {
			var lastEmailDoubt = this.data.lastEmailDoubt;
			if (lastEmailDoubt) return lastEmailDoubt;
			return false;
		},

		getLastEmailResponse: function() {
			var lastEmailResponse = this.data.lastEmailResponse;
			if (lastEmailResponse) return lastEmailResponse;
			return false;
		},

		getSyncData: function () {
			var data = this.data, context = this.data.context || '';

			data.contextHTML = this.getContextHTML();
			data.contextResume = context.length > 120 ? context.substring(0, 120) + "..." : context;
			data.predefinedtext = this.getPredefinedText();
			data.date = new moment(Date(data.time)).format("dddd, MMMM Do YYYY, h:mm:ss a");

			return data;
		},

		getViewData: function(cb, ctx) {
			var self = this, data = this.getSyncData();

			self.getDoubtsPending(function(err, pendingDoubts){
				if (err) return cb(err);

				data.numberPendingDoubts = pendingDoubts.length;
				
				self.getDoubts(function(err, doubts){
					if (err) return cb(err);

					data.hasDoubts = !!doubts.length;

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

		getViewDoubtsPending: function(cb) {
			var self = this, data = {};
			this.getDoubtsPending(function(err, doubts){
				if (err) return cb(err);
				doubts.each('getViewData', 'question').then(function(doubtsViewData){
					data.doubts = doubtsViewData;
					
					cb(null, data);
					
				});

			});
		},

		getResponses: function(cb) {
			var Response = require('./response');
			var question = this;

			Response.find({question: this.getId()}, function(err, responses) {
				if (err) return cb.call(question, err);
				return cb.call(question, null, responses);
			}, {"sort": [['isChosen','desc'], ['numArguments','desc']]});
		},


		getDoubts: function(cb) {
			var Doubt = require('./doubt');
			var doubt = this;
			Doubt.find({question: this.getId()}, function(err, doubts) {
				if (err) return cb.call(doubt, err);
				return cb.call(doubt, null, doubts);
			});
		},

		getDoubtsPending: function(cb) {
			var Doubt = require('./doubt');
			var doubt = this;
			Doubt.find({question: this.getId(), response: {$exists: false}}, function(err, doubts) {
				if (err) return cb.call(doubt, err);
				return cb.call(doubt, null, doubts);
			});
		},

		getVisits: function() {
			var visits = this.data.visits;
			if (visits) return visits;
			return false;
		},

		addVisit: function(cb) {
			var self = this;
			var visits = this.data.visits;
			visits = visits ? visits + 1 : 1;
			self.set({'visits': visits}).save(function(err, dbData) {
				if (err) return cb(err);
				cb(null, null);
			});
		},

		setChosenResponse: function(response, cb) {
			var self = this;
			var Response = require('./response');

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

		sendEmail: function(template, subject, cb) {
			var self = this;
			
			self.getUser(function(err, theUser){
				if (err) return cb(err);

				var mailOptions = {
				    subject: subject,
				    html: template
				}

				var email = new mail(mailOptions);
				email.send(theUser.data.email, function(err) {
					cb(err, null);
				});
			});
		},

		setEmailSentTimeDoubt: function(val, cb) {
			var self = this;
			self.set({'lastEmailDoubt': val}).save(function(err, dbData) {
				if (err) return cb(err);
				cb(null, null);
			});
		},

		setEmailSentTimeResponse: function(val, cb) {
			var self = this;
			self.set({'lastEmailResponse': val}).save(function(err, dbData) {
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
		},

		getUsers: function (cb) {
			this.getArguments(function(err, arguments) {
				if (err) return cb(err);		
					arguments.each('getUser').then(function(users){
						cb(false, users);
					})
			})
		},

		getArguments: function(cb) {
			var Argument = require('./argument');
			var question = this;
			Argument.find({question: this.getId()}, function(err, arguments) {
				if (err) return cb.call(question, err);
				return cb.call(question, null, arguments);
			});
		}

	});

	Question.collection = 'questions';

	module.exports = Question;
