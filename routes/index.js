
	var app = require('babel');
	
	app.get('/', function(req, res){
		if (req.session.question) {
			return res.redirect('/question?question='+ encodeURIComponent(req.session.question) +'&_method=post');
		}
		
		res.render('index.twig');
	});
