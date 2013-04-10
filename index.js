
	var app = require('babel');

	app.define({
		// ---- Twitter API
		TWITTER_PUBLIC: 'l9iwqBYwfDeEhFtxF02rg',
		TWITTER_SECRET: 'IeuhfDxJlp5xDBoLoU5aWH4qbeEC9DIgmXguE44wyo',

		// ----- Facebook API
		FACEBOOK_APP_ID: '443773182342689',
		FACEBOOK_APP_SECRET: '023659594ae1689c2d892c9c3d516a87',

		// ----- Linkedin API
		LINKEDIN_PUBLIC: 'h1pyz174zm4o',
		LINKEDIN_SECRET: 'PNFdQd4xgYbjge6W',

		// ----- Mongo dbname
		DBNAME: 'decidder',

		// ----- Email credentials
		SMTP_EMAIL: 'hello@decidder.com',
		SMTP_PASS: 'theamazingpassword'

	// Configuration for all environments
	}).configure(function(){

		/*
		app.set('partials', {
			helveticaneue: 'fonts/helveticaneue.css',
			response: "response",
			argument: "argument"
		});*/

		app.io = require('socket.io').listen(app.server, { log: false });

	// Configuracion for developments only
	}).configure('development', function(){
		app.define({
			PROTOCOL: 'http:',
			DOMAIN: 'localhost',
			PORT: 3000
		});

	// Configuracion solo para producción
	}).configure('production', function(){
		app.define({
			PROTOCOL: 'http:',
			DOMAIN: 'www.decidder.com',
			PORT: 3000
		});

	// Run before all request
	}).all('*', function(req, res, next) {
		res.removeHeader("Etag");
		res.set('Cache-control', 'no-cache, no-store, public');

		next();


	// Start app
	}).start();