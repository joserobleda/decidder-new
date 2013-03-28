
	var app = require('babel');
	

	app.post('/question/:question/doubt', function(req, res){
		res.render('question-doubts.twig');
	});