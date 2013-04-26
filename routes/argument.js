
	var app = require("babel");

	app.delete('/argument/:argument', function(req, res, next) {
		var argument = req.param.argument;
		var user = req.session.user;

		// not found
		if (!argument) return next();

		argument.getUser(function (err, argumentUser) {
			if (err) return res.redirect("/error?e=delete_error");

			// -- same user
			if (argumentUser.eq(user) === false) {
				argument.getQuestionOwner(function (err, questionOwner) {
					if (err) return res.redirect("/error?e=delete_error");

					// -- same user
					if (questionOwner.eq(user) === false) return res.status(401).end();
				});
			};

			argument.remove(function (err) {
				res.redirect('back');
			});
		});

		

	});