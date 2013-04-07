	
	var dbitem = require('babel/models/dbitem');

	var doubt = dbitem.extend({

		getViewData: function(cb) {
			var  self = this, data = this.data;
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
		}

	});

	doubt.collection = 'doubts';

	module.exports = doubt;