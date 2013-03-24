(function(w, undefined) {
	"use strict";

	var question = $('form#question'), $canvas = $("#canvas");

	if (question.length) {
		//console.log(question);
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


	$('.reveal').click(function () {
		var $this = $(this), 
			$target = $('#'+$this.data('reveal-id')),
			data = $this.data();

		$canvas.css({'height':'100%', 'overflow':'hidden'});
		$target.css('margin-left', '-' + ($target.outerWidth()/2) + 'px');
		$target.css('margin-top', '-' + ($target.outerHeight()/2) + 'px');

		data.close = function () {
			$canvas.css({'height':'inherit', 'overflow':'auto'});
		};

		$target.reveal(data);
	});

})(window);