
	var app = require('babel');
	
	app.get('/', function(req, res){
		if (req.session.question) {
			return res.redirect('/question?question='+ encodeURIComponent(req.session.question) +'&_method=post');
		}
		
		var data = {};

		if (req.query.q) {
			data.question = req.query.q;
		}

		res.render('index.twig', data);
	});
