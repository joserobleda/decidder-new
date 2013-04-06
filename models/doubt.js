	
	var dbitem = require('babel/models/dbitem');

	var doubt = dbitem.extend({

		getViewData: function(cb) {
			var data = this.data;
			cb(null, data);
		}

	});

	doubt.collection = 'doubts';

	module.exports = doubt;