
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


		function render (data) {
			data.permalink = app.constants.PROTOCOL + '//' + app.constants.DOMAIN + '/question/' + question.getId();
			
			res.render('question.twig', data);
		};

		var isResponsed = function (isResponsed) {
			question.getViewData(function(err, data){
				data.isResponsed = isResponsed;
			
				data.isOwnQuestion = user && user.getId() == data.owner._id;

				render(data);
			});
		};

		var hasResponse = function(){
			if (user) {
				question.hasResponse(user, function(err, bool) {
					isResponsed(bool);
				});
			} else {
				isResponsed(false);
			}

		}

		question.getUser(function(err, theUser){
			if (err) return console.error(err);

			if  (user && theUser.getId() == user.getId()  && question.getLastEmail() && false) {
				//MIentras hacemos pruebas que no ente aquí ya que reinicia el envio de email por qustion. Por eso el false del if...
				question.setEmailSentTime(0, function(err) {
					hasResponse();
				});
			} else {
				hasResponse();	
			}		

		});

		
		
	});


	/**
	  * Question POST method (create)
	  *
	  *
	  */
	app.post('/question', function(req, res){
		if (req.body.question) req.session.question = req.body.question;
		if (req.session.user === undefined) return res.redirect('/auth/login/twitter');
		req.session.question = null;
		
		

		var doc = { 
			title: req.body.question,
			owner: req.session.user.getId(),
			time: (new Date()).getTime()
		};

		var theQuestion = new Question(doc);
		
		theQuestion.save(function(err, dbData) {
			// console.log("Question " + dbData._id + " just created");
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





	/**
	  * Question SOCKET STREAM
	  *
	  *
	  */
	var io = app.io, namespace = '/question';

	io.of(namespace).on('connection', function (socket) {

		socket.on('join', function (questionId) {
			

			Question.findById(questionId, function (err, question) {
				var sockets = io.of(namespace).clients(questionId), noSockets = !sockets.length;

				socket.on('disconnect', function () {
					if (noSockets) {
						question.events.removeListener('change', question.events._room);
						delete(question.events._room);
					}
				});


				if (question.events._room === undefined) {

					question.events._room = function (data) {
						io.of(namespace).in(questionId).emit('change', data);
					};


					question.events.on('change', question.events._room);
				};

				// join to this question room
				socket.join(questionId);
			});
		});

	});
