
	var app = require('babel');
	var Argument = app.require('argument');
	var Question = app.require('question');
	var Response = app.require('response');
	

	app.post('/question/:question/response', function(req, res){

		if (!req.session.user) return res.redirect('/auth');

		var doc = { 
			title: req.body.title,
			question: req.param.question.getId(),
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
					res.redirect('/question/' + req.param.question.getId());
				});
				
			});
		});
	});