
	var app = require('babel');
	var Question = app.require('question');
	var Doubt = app.require('doubt');

	app.post('/question/:question/doubt', function(req, res) {

		if (!req.session.user) return res.redirect('/auth');

		var questionID = req.param.question.getId();

		var dataDoubt = {
			user: req.session.user.getId(),
			question: questionID, 
			text: req.body.text,
			time: (new Date()).getTime()
		};

		var theDoubt = new Doubt(dataDoubt);

		theDoubt.save(function(err, argData) {

			Question.findById(questionID, function(err, question){
				if (err) return cb(err);

				lastEmail = question.getLastEmail();

				if (!lastEmail || lastEmail == 0) {
					question.sendDoubt(req.body.text, function(err) {
						if (err) return cb(err);
						time = (new Date()).getTime();
						question.setEmailSentTime(time, function(err) {
							if (err) return cb(err);
							res.redirect('/question/' + questionID);
						});
					});
				} else {
					res.redirect('/question/' + questionID);
				}
			});
			
		});
	
	});


	app.get('/question/:question/doubt', function(req, res){
			
			var question = req.param.question;
			if (question === undefined) return next();
			question.getViewDoubts(function(err, data){
				res.render('question-doubts.twig', data);
			});

	});
