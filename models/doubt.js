	
	var dbitem = require('babel/models/dbitem');

	var doubt = dbitem.extend({


		getSyncData: function () {
			var data = this.data;

			return data;
		},

		getViewData: function(cb) {
			var  self = this, data = this.getSyncData();
			this.getQuestion(function (err, question) {
				if (question) data.question = question.getSyncData();
				cb(null, data);
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

		getUser: function (cb) {
			var User = require('./user');
			var userID = this.get('user').toString();

			User.findById(userID, function(err, user){
				if (err) return cb(err);
				cb(null, user);
			});
		}

	});

	doubt.collection = 'doubts';

	module.exports = doubt;