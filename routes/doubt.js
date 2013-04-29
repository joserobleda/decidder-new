
	var app = require('babel');
	var Question = app.require('question');
	var Doubt = app.require('doubt');
	var mail = require('babel/lib/mail');

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

			lastEmailDoubt = question.getLastEmailDoubt();

			if (!lastEmailDoubt) {

				var items = {	protocol: app.constants.PROTOCOL,
							domain: app.constants.DOMAIN,
							question : question.data,
							text: req.body.text,
							user: req.session.user.data
						}

				app.render('email/request-info.twig', items , function(err, html){

					question.sendEmail(html, "A user requested more info", function(err) {
						if (err) return res.error('Error enviando email')

						var time = (new Date()).getTime();
						question.setEmailSentTimeDoubt(time, function(err) {
							if (err) return res.error('Error actualizando campo timeDoubt');
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
			if (err) return res.error('Error guardando la respuesta de una duda');

			items = {
					protocol: app.constants.PROTOCOL,
					domain: app.constants.DOMAIN,
					question : question.data,
					doubt : doubt.data,
					response: req.body.text,
				}

			app.render('email/response-doubt.twig', items , function(err, html){
				if (err) return res.error('Error actualizando campo timeDoubt');

				question.getUser(function(err, doubtUser){
					var mailOptions = {
						subject: "You have the answer to your doubt",
					    html: html
					}

					var email = new mail(mailOptions);
					email.send(doubtUser.data.email, function(err) {
						if (err) return res.error('Error envio email duda respuesta');
						res.redirect('/question/' + question.getId());
					});
				});
			});
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
		var question = req.param.question;
		var user = req.session.user;

		if (!doubt) return next();

		question.getUser(function(err, userOwner){
			if (err) return res.error('Error obteniendo owner de question');
			if (user && user.getId() != userOwner.getId()) return res.status(401).end();

			doubt.remove(function (err) {
				res.redirect('back');
			});
		});
	});