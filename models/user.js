	
	var app = require('babel');
	var User = require('babel/models/user');
	var mail = require('babel/lib/mail');
	

	var CustomUser = User.extend({

		getViewData: function(cb, ctx) {
			var self = this, data = this.getSyncData();

			if (ctx !== undefined) return cb(null, data);



					

			var onQuestions = function(questions) {
				data.questions = questions;
				
				self.getArguments(function(err, arguments){
					if (err) return cb(err);

					arguments.each('getViewData', 'user').then(function(viewData){
						data.arguments = viewData;

						return cb(null, data);
					});
				});
			};

			this.getQuestions(function(err, questions){
				if (err) return cb(err);

				questions.each('getViewData', 'user').then(function(viewData){
					onQuestions(viewData);
				});
			});
			
		},

		getQuestions: function(cb) {
			var Question = require('./question');

			Question.find({owner: this.getId()}, function(err, questions){
				if (err) return cb(err);
				return cb(null, questions);
			});
		},


		getArguments: function(cb) {
			var Argument = require('./argument');

			Argument.find({owner: this.getId()}, function(err, arguments){
				if (err) return cb(err);
				return cb(null, arguments);
			});
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
								owner: owner
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