
	var User = require('babel/models/user');
	

	var CustomUser = User.extend({

		getViewData: function(cb, ctx) {
			var self = this, data = this.getSyncData();

			if (ctx !== undefined) return cb(null, data);



			this.wait(this.getQuestions, this.getArguments, function (err, questionList, argumentsList) {
				if (err) return cb(err);


				var getArgumentsViewData = function (cb) {
					argumentsList.each('getViewData', 'user').then(function(viewData){
						return cb(null, viewData);
					});
				};

				var getQuestionsViewData = function (cb) {
					questionList.each('getViewData', 'user').then(function(viewData){
						return cb(null, viewData);
					});
				};


				this.wait(getQuestionsViewData, getArgumentsViewData, function (err, questionsViewData, argumentsViewData) {
					data.questions = questionsViewData;
					data.arguments = argumentsViewData;

					return cb(null, data);
				});

			});
		},

		getQuestions: function(cb, howMany) {
			var Question = require('./question');
			var sortBy = [['time','desc']];
			var howMany = howMany || 7;

			Question.find({owner: this.getId()}, function(err, questions){
				if (err) return cb(err);
				return cb(null, questions);
			}, {
				'sort': sortBy, 
				limit: howMany
			});
		},


		getArguments: function(cb) {
			var Argument = require('./argument');
			var sortBy = [['time','desc']];
			var howMany = howMany || 7;

			Argument.find({owner: this.getId()}, function(err, arguments){
				if (err) return cb(err);
				return cb(null, arguments);
			}, {
				'sort': sortBy, 
				limit: howMany
			});
		},

		getSyncData: function () {
			var data = this.data;
			data._id = data._id.toString();

			return data;
		}

	});


	module.exports = CustomUser;