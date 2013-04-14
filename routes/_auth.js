	
	var app = require('babel'),
		social = require('babel/lib/social'),
		User = app.require('user');
	

	// Enable logout
	app.get('/auth/exit', function(req, res){
		req.session = {};
		res.redirect(301, 'back');
	});



	// Do this on every request first!
	app.all('*', function(req, res, next){
		
		res.locals.env = {
			'logo': app.constants.PROTOCOL +'//'+ app.constants.DOMAIN +'/assets/images/logo.png'
		};


		if(req.session.userID) {
			User.findById(req.session.userID, function(err, user){
				if (err) {
					req.session = {};
					return next();
				}

				if (user) {
					user.getViewData(function(err, userData) {
						req.session.user = user;

						res.locals.session = {
							user: userData
						};


						// If no email defined
						if (!user.get('email')) {
							if (req.body.email) {
								return user.set({email: req.body.email}).save(function(err, dbData) {
									if (err) return res.redirect('/auth/error');

									res.redirect('/');
								});
							} else {
								return res.render('input-email.twig', {user: user});
							}
						};/**/

						next();
					}, 'session');
				}
			});
		} else {
			next();
		}
	});


	/*
	app.get('/auth', function(req, res){
		res.render('login.html');
	});
	*/

	social.twitter.login('/auth/login/twitter', function(err, req, res){
		if (err) return res.redirect("/error?e=twitter_login_error");

		var username = req.body.screen_name;
		social.twitter.getProfileImage(username, function(err, URLImage) {
			var doc = {
				nick: username,
				twitter: req.body,
				image: URLImage
			};
			
			//console.log(doc);
			User.findOrCreate({'twitter.user_id': doc.twitter.user_id}, doc, function(err, user) {
				if (err) return res.redirect("/error?e=twitter_login_error");

				req.session.userID = user.getId();
				res.redirect("/");
			});
		});

	});

	
	social.facebook.login('/auth/login/facebook', function(err, req, res) {
		if (err) return res.redirect("/error?e=facebook_login_error");

		social.facebook.getProfileImage(req.body.id, function(err, URLImage) {
			var doc = {
				nick: req.body.first_name,
				email: req.body.email,
				facebook: req.body,
				image: URLImage
			};

			User.findOrCreate({'facebook.id': doc.facebook.id, $or:[{ email:doc.email }]}, doc, function(err, user) {
				if (err) return res.redirect("/error?e=facebook_login_error");

				user.set(doc).save(function() {
					req.session.userID = user.getId();
					res.redirect("/");	
				});
			});		
		});

	});

	/*
	social.linkedin.login('/auth/linkedin', function(err, req, res) {
		if (err) return res.redirect("/error?e=linkedin_login_error");

		var doc = {
			nick: req.body.name,
			email: req.body.email,
			image: req.body.image,
			linkedin: req.body
		};

		
		User.findOrCreate({'linkedin.id': doc.linkedin.id, "$or": [{ email:doc.email }]}, doc, function(err, user) {
			if (err) return res.redirect("/error?e=linkedin_login_error");

			req.session.userID = user.getId();
			res.redirect("/");
		});

	});
	*/