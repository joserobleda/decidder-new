(function(w, undefined) {
	"use strict";

	var question = $('form#question'), $canvas = $("#canvas");

	if (question.length) {
		//console.log(question);
		require(['widget/formEditable'], function () {

			question.editable(function (widget) {
				$(widget).bind('edit', function () {
					$('input.taglist').tagsInput({
						defaultText: 'add predefined response',
						ready: function () {
							$(this).attr('data-form-editing', true);
						}
					});
				});

				$(widget).bind('show', function () {
					$(question).find('.tagsinput').remove();
				})

				$(widget).bind('error', function(){
					alert('Error, try again!');
				});

				/*
				if ($.address.value() === '/edit') {
					$(widget).bind('show', function() {
						location.href = '#';
					});

					widget.edit();
				};*/
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

		data.open = function () {
			$target.find("input:first").focus();
		};

		$target.reveal(data);
	});



})(window);