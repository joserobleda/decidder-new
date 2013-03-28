
	var app = require('babel');
	var Question = app.require('question');
	var Response = app.require('response');

	// Sub routes
	//require('./question/stream');


	/**
	  * Question GET method (show)
	  *
	  *
	  */	
	app.get('/question/:question', function(req, res, next) {
		var question = req.param.question;
		var user = req.session.user;
		if (question === undefined) return next();

		var isResponsed = function (isResponsed) {
			question.getViewData(function(err, data){
				data.isResponsed = isResponsed;
			
				data.isOwnQuestion = user && user.getId() == data.owner._id;
				//console.log(data);

				res.render('question.twig', data);
			});
		};

		if (user) {
			question.hasResponse(user, function(err, bool) {
				isResponsed(bool);
			});
		} else {
			isResponsed(false);
		}
	});


	/**
	  * Question POST method (create)
	  *
	  *
	  */
	app.post('/question', function(req, res){
		if (req.body.question) req.session.question = req.body.question;
		if (req.session.user === undefined) return res.redirect('/auth/login');
		req.session.question = null;
		
		

		var doc = { 
			title: req.body.question,
			owner: req.session.user.getId(),
			time: (new Date()).getTime()
		};

		var theQuestion = new Question(doc);
		
		theQuestion.save(function(err, dbData) {
			console.log("Question " + dbData._id + " just created");
			res.redirect('/question/' + dbData._id + "#edit")
		});
	});



	/**
	  * Question PUT method (update)
	  *
	  *
	  */
	app.put('/question/:question', function(req, res){
		if (!req.session.user) return res.redirect('/auth');
	
		var question = req.param.question

		if (req.body.response) {
			question.setChosenResponse(req.body.response, function(err, response) {
				if (err) return res.redirect('/error');

				res.redirect('/question/' + question.getId());
			});
		}

		if (req.body.context !== undefined) {

			var predefined = req.body.predefinedresponses ? req.body.predefinedresponses.split(',') : '';
			var data = {
				predefinedresponses: predefined,
				context: req.body.context, 
				title: req.body.title,
				published: true
			};
			
			question.set(data).save(function(err) {
				if (err) return res.status(500).end();

				data.context = question.getContextHTML();
				data.predefinedresponses = question.data.predefinedresponses;
console.log(data.predefinedresponses);
				return res.json(data);
			});
		}

	});



	/**
	  * Question DELETE method (delete)
	  *
	  *
	  */
	app.delete('/question/:question', function(req, res, next) {
		if (req.param.question === undefined) return next();

		req.param.question.remove(function(err) {
			res.redirect('back');
		});
	});
