
	var app = require('babel');
	var Question = app.require('question');
	var Response = app.require('response');
	var Argument = app.require('argument');
	var Doubt = app.require('doubt');

	// ******
	// Transform response 
	// ******
	app.query('response', function(req, res, next, id) {
		Response.findById(id, function(err, response){
			if (err) return next();

			req.query.response = response;
			next();
		});
	});


	// ******
	// Transform argument 
	// ******
	app.param('argument', function(req, res, next, id) {
		Argument.findById(id, function(err, argument){
			if (err) return next();

			req.param.argument = argument;
			next();
		});
	});


	// ******
	// Transform question 
	// ******
	app.param('question', function(req, res, next, id){
		Question.findById(id, function(err, question){
			if (err) return next();

			req.param.question = question;
			next();
		});
	});


	// ******
	// Transform doubt 
	// ******
	app.param('doubt', function(req, res, next, id){
		Doubt.findById(id, function(err, doubt){
			if (err) return next();
			req.param.doubt = doubt;
			next();
		});
	});