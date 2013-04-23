
	var app = require('babel');
	var Question = app.require('question');
	var Doubt = app.require('doubt');

	app.post('/question/:question/doubt', function(req, res) {

		if (!req.session.user) return res.redirect('/auth');

		var question = req.param.question;

		var dataDoubt = {
			user: req.session.user.getId(),
			question: question.getId(), 
			text: req.body.text,
			time: (new Date()).getTime()
		};

		var theDoubt = new Doubt(dataDoubt);

		theDoubt.save(function(err, argData) {

			lastEmail = question.getLastEmail();

			if (!lastEmail) {

				items = {	protocol: app.constants.PROTOCOL,
							domain: app.constants.DOMAIN,
							question : question.data,
							text: req.body.text,
							user: req.session.user.data
						}

				app.render('email/request-info.twig', items , function(err, html){

					question.sendDoubt(html, function(err) {
						if (err) return console.log(err);

						var time = (new Date()).getTime();
						question.setEmailSentTime(time, function(err) {
							if (err) return console.log(err);
						});
					});
				});
			}


			res.redirect('/question/' + question.getId());
			
		});
	
	});


	app.get('/question/:question/doubt', function(req, res){
			
			var question = req.param.question;
			if (question === undefined) return next();
			question.getViewDoubtsPending(function(err, data){
				data.question = question.getSyncData();
				res.render('question-doubts.twig', data);
			});

	});



	app.post('/question/:question/doubt/:doubt', function(req, res) {

		if (!req.session.user) return res.redirect('/auth');
		var question = req.param.question;
		var doubt = req.param.doubt;

		doubt.set({'response': req.body.text}).save(function(err, dbData) {
			if (err) return cb(err);
			res.redirect('/question/' + question.getId());
		});

	});


	app.get('/question/:question/doubt/:doubt', function(req, res) {
		if (!req.session.user) return res.redirect('/auth');
		var doubt = req.param.doubt;

		doubt.getViewData(function(err, data){
			res.render('show-doubt.twig', data);
		});

	});

	app.delete('/question/:question/doubt/:doubt', function(req, res, next) {
		var doubt = req.param.doubt;
		var user = req.session.user;

		if (!doubt) return next();

		doubt.getUser(function(err, userOwner){
			if (userOwner.eq(user) === false) return res.status(401).end();
			doubt.remove(function (err) {
				res.redirect('back');
			});
		});

	});