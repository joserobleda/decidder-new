
	var app = require("babel");

	app.delete('/argument/:argument', function(req, res) {
		var argument = req.param.argument;

		argument.getResponse(function(err, response) {
			var numArguments = response.get('numArguments') - 1;


			var then = function(err, dbData) {
				if (err) return res.redirect("/error?e=delete_error");

				argument.remove(function(err) {
					res.redirect('back');
				});
			};


			if (numArguments) {
				response.set('numArguments', numArguments).save(then);
			} else {
				response.remove(then);
			}

		});
	});