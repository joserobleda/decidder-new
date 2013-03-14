(function(w, undefined) {
	"use strict";

	var question = $('form#question');

	if (question.length) {
		console.log(question);
		require(['widget/formEditable'], function() {

			question.editable(function(widget){
				if ($.address.value() === '/edit') {
					$(widget).bind('show', function() {
						location.href = '#';
					});

					widget.edit();
				};
			});
		});
	};

})(window);