(function(w, undefined) {
	"use strict";

	// ------- all the custom events
	$.fn.bindCustomEvents = function() {

		$(this).find(".slideEffect").click(function () {

			$($(this).data("tohide")).hide();
			$($(this).data("addtext")).html($(this).data("text"));
			$("#new-response-doubt").attr('action', $("#new-response-doubt").attr('action') + $(this).data("value"));
			$($(this).data("target")).animate({width:'toggle'});
		});

	};



	var $canvas = $("#canvas"),
		$question = $('form#question');

	if ($question.length) {
		//console.log(question);
		require(['widget/formEditable'], function () {

			$question.editable(function (widget) {
				$(widget).bind('edit', function () {
					$('input.taglist').tagsInput({
						defaultText: 'add predefined response',
						ready: function () {
							$(this).attr('data-form-editing', true);
						}
					});
				});

				$(widget).bind('show', function () {
					$question.find('.tagsinput').remove();
				})

				$(widget).bind('error', function(){
					alert('Error, try again!');
				});

				
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
			revealId = $this.data('reveal-target') || null,
			revealSrc = $this.data('reveal-src') || null;

		function lock () {
			$canvas.css({'height':'100%', 'overflow':'hidden'});
		};

		function unlock () {
			$canvas.css({'height':'inherit', 'overflow':'auto'});
		};

		function open (ref) {
			var $target = $(ref), data = $this.data();

			// once modalbox is open
			data.open = function () {
				$target.find("input:first").focus();
			};

			data.close = function () {
				unlock();
				if (typeof ref == 'object') $target.remove();
			};

			// adjusts dimensions
			$target.css('margin-left', '-' + ($target.outerWidth()/2) + 'px');
			$target.css('margin-top', '-' + ($target.outerHeight()/2) + 'px');

			// open reveal
			$target.reveal(data).bindCustomEvents();
		};

		// prevent scroll
		lock();

		// if we have id..
		if (revealId) return open (revealId);

		// if we have src 
		if (revealSrc) {
			var $loading = $("#loading"),
				xhrError = false,
				xhr,
				src = revealSrc,
				method = 'get',
				iof = src.indexOf(':'), 
				methodDefined = (iof > -1 && iof < 5);

			if (methodDefined) {
				method = src.substring(0, iof);
				src = src.substring(iof+1);
			}

			// show loading layer
			$loading.reveal({
				close: function () {
					unlock();
					if (xhr && xhr.abort()) xhr.abort();
				},

				opened: function () {
					if (xhrError) $loading.trigger('reveal:close');
				}
			});
			

			xhr = $.ajax({
				url: src, 
				type: method,
				error: function (xhr, status, error) {
					alert(error);
					xhrError = error;
				},
				success: function (res, status, xhr) {

					var contentType = xhr.getResponseHeader('content-type');
					
					if (contentType.indexOf('text/html') === 0) {
						// append content to body
						var $dom = $(res).hide().appendTo($canvas);

						// hide loading layer
						$loading.hide();

						// show content
						open($dom);
					}

				}
			});
		};
		
	});


})(window);