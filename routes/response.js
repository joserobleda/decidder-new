
	var app = require('babel');
	var Argument = app.require('argument');
	var Question = app.require('question');
	var Response = app.require('response');
	

	app.post('/question/:question/response', function(req, res){

		if (!req.session.user) return res.redirect('/auth/login/twitter');

		question = req.param.question;

		var doc = { 
			title: req.body.title,
			question: question.getId(),
			time: (new Date()).getTime()
		};
		
		Response.findOrCreate({title:doc.title, question:doc.question}, doc, function(err, response) {

			var dataArgument = {
				owner: req.session.user.getId(),
				response: response.getId(), 
				question: doc.question,
				text: req.body.argument,
				time: (new Date()).getTime()
			};

			var theArgument = new Argument(dataArgument);

			theArgument.save(function(err, argData) {
				var numArguments = response.get('numArguments') || 0;
				response.set('numArguments', numArguments+1).save(function(err, dbData) {
					question.getUser(function(err, userOwner){
						
						items = {
							protocol: app.constants.PROTOCOL,
							domain: app.constants.DOMAIN,
							question : question.data,
							text: doc.title,
							user: req.session.user.data
						}

						app.render('email/response-question.twig', items , function(err, html){

							lastEmailResponse = question.getLastEmailResponse();

							if (!lastEmailResponse) {
								question.sendEmail(html, "A new response for your question", function(err) {
									if (err) return console.log(err);
									var time = (new Date()).getTime();
									question.setEmailSentTimeResponse(time, function(err) {
										res.redirect('/question/' + req.param.question.getId());
									});
								});
							} else {
								res.redirect('/question/' + req.param.question.getId());
							}
						});				
					});
				});
				
			});
		});
	});