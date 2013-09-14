	
	var app = require('babel');
	var User = require('babel/models/user');
	var mail = require('babel/lib/mail');
	var promises = require('babel/lib/promises');

	var CustomUser = User.extend({

		getViewData: function(cb, ctx) {
			var self = this, data = this.getSyncData();

			if (ctx !== undefined) return cb(null, data);


			var questionsPromise = this.getQuestions().then(function (questionList) {
				return questionList.each('getViewData', 'user');
			}).then(function (questionsData) {
				return questionsData;
			});


			var argumentsPromise = this.getArguments().then(function (argumentList) {
				return argumentList.each('getViewData', 'user');
			}).then(function (argumentsData) {
				return argumentsData;
			});


			promises.all([questionsPromise, argumentsPromise]).then (function (results) {
				data.questions = results[0];
				data.arguments = results[1];

				return cb(null, data);
			}, cb);

		},

		getQuestions: function(cb, howMany) {
			var Question = require('./question');
			var sortBy = [['time','desc']];
			var howMany = howMany || 7;

			var deferred = new promises.Deferred();
	
			Question.find({owner: this.getId()}, function(err, questions){
				if (err) return deferred.reject(err);

				deferred.resolve(questions);
			}, {
				'sort': sortBy, 
				limit: howMany
			});

			return deferred.promise;
		},


		getArguments: function(cb) {
			var Argument = require('./argument');
			var sortBy = [['time','desc']];
			var howMany = howMany || 7;

			var deferred = new promises.Deferred();
	
			Argument.find({owner: this.getId()}, function(err, arguments){
				if (err) return deferred.reject(err);

				deferred.resolve(arguments);
			}, {
				'sort': sortBy, 
				limit: howMany
			});

			return deferred.promise;
		},

		getSyncData: function () {
			var data = this.data;
			data._id = data._id.toString();

			return data;
		},

		sendUpdateContextEmail: function (cb, question) {
			var data = this.data;

			question.getUser(function(err, owner){

				var items = {
								protocol: app.constants.PROTOCOL,
								domain: app.constants.DOMAIN,
								question : question.data,
								user: data,
								owner: owner.data
						}

				app.render('email/update-context.twig', items , function(err, html){
				
					var mailOptions = {
						    subject: "Question context updated",
						    html: html
					}

					var email = new mail(mailOptions);
					email.send(data.email, function(err) {
						cb(err, null);
					});
				});
			});
		}
	}); 


	module.exports = CustomUser;