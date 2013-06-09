
	var app = require('babel');	
	
	app.get('/user', function(req, res) {
		if (!req.session.user) return res.redirect('/');

		var user = req.session.user;
		user.getViewData(function(err, viewData){
			res.render('profile.twig', viewData);
		});
	});