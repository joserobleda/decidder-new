
	var request = require('babel/lib/request'),
		search = '"help me" decide ?',
		last = null,
		keys = {
			token:'1075186592-a5B54LrlOs68gHdyqD6v6UwWRuZ2tGRVLCa3c5U',
 			secret: 'a2Umbf19tiFiVvCuy0ERCx3CamdQSPwnkLQ033IHU',
 		},
 		AllTweets = [];


	function searchAndComment() {
		if (!last) console.log("\n\nLooking in twitter to needed people... poors... ;) ");

		request.getJSON('http://search.twitter.com/search.json?q=' + encodeURIComponent(search) + '&count=100&result_type=recent&since_id=' + last, function(err, res) {
			if (err) return console.log(err);

			var tweets = res.results;
			for (var i in tweets) {
				if (tweets.hasOwnProperty(i)) {
					var tweet = tweets[i];

					last = tweet.id;
					if (tweet.text.indexOf('@') !== -1) continue; // we dont want mentions
					if (tweet.text.indexOf('RT @') !== -1) continue; // we dont want retweets
					if (tweet.text[0] === "@") continue; // we dont want responses or 'direct' messages
					if (AllTweets.indexOf(tweet.id) !== -1) continue;

					AllTweets.push(tweet.id);

					var data = {
						text: tweet.text,
						user: tweet.from_user,
						id: tweet.id
					};

					console.log("Question found! " + data.text + " ...");
					/*twitter.send(keys.token, keys.secret, data.text, function (err, data, res) {
						if (err) return console.log(err);
						console.log("done");
					});*/

				}
			}

			setTimeout(searchAndComment, 1000);
		});
	};

	searchAndComment();