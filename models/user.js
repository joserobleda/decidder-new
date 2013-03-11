
	var User = require('babel/models/user');
	var Question = require('./question');
	var Arguments = require('./argument');

	var CustomUser = User.extend({
		getViewData: function(cb, ctx) {
			if (ctx !== undefined) return cb(null, this.data);

			var self = this, data = this.data;


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
			Question.find({owner: this.getId()}, function(err, questions){
				if (err) return cb(err);
				return cb(null, questions);
			});
		},


		getArguments: function(cb) {
			Arguments.find({owner: this.getId()}, function(err, arguments){
				if (err) return cb(err);
				return cb(null, arguments);
			});
		}
	});


	module.exports = CustomUser;