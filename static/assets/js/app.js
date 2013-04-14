(function(w, undefined) {
	"use strict";


	var $canvas = $("#canvas"), $question = $('form#question');







	// ------- all the custom events
	$.fn.bindCustomEvents = function() {

		$(this).find(".async").click(function () {

			var href = $(this).attr("href"),
				target = $(this).data("target"),
				hide = $(this).data("hide");

			$.get(href, function (html) {
				$(target).html(html).show();
				$(hide).hide();
			});

			return false;

		});



        /**
          *  Popup window
          *
          *
          */
        $(this).find('.popup').click(function (e) {
          var href = $(this).attr('href'), 
            wname = $(this).data('popup-name') || false,
            width = $(this).data('popup-width') || 500,
            height = $(this).data('popup-height') || 280,
            left = (screen.width/2)-(width/2),
            top = (screen.height/2)-(height/2);

          window.open(href, wname, "height="+height+",width="+width+",top="+top+",left="+left+",resizable=no");
        });


        $(this).find('.tw-count').each(function () {
          var $this = $(this),
            url = $this.data('fb-url') || location.href, 
            api = "http://urls.api.twitter.com/1/urls/count.json?url=" + encodeURI(url) + "&amp;callback=?";

          function onCount(count) {
            $this.html(count);
          };
          
          $.getJSON(api, function(res) {
            if (res) onCount(res.count);
          })

        });


        /**
          *  Get facebook count
          *
          *
          */
        $(this).find('.fb-count').each(function () {
          // total_count,like_count,comment_count,share_count,click_count
          var $this = $(this), 
            data,
            count = ($this.data('fb-count') || 'share') + '_count',
            url = $this.data('fb-url') || location.href, 
            api = "https://api.facebook.com/method/fql.query?query=select "+ count +" from link_stat where url='"+ encodeURI(url) +"'&format=json"

          function onCount(count) {
            $this.html(count);
          };


          $.getJSON(api, function (res) {
            if (res[0] && res[0][count] !== undefined) onCount(res[0][count]);
          });

        });




        /**
          *  Open modalbox
          *
          *
          */
		$(this).find('.reveal').click(function () {
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
					$target.find("input[type=text],textarea,select").not(':disabled').filter(':first').focus();
				};

				data.close = function () {
					unlock();
					if (typeof ref == 'object') $target.remove();
				};

				// adjusts dimensions
				$target.css('margin-left', '-' + ($target.outerWidth()/2) + 'px');
				$target.css('margin-top', '-' + ($target.outerHeight()/2) + 'px');

				// open reveal
				$target.reveal(data);
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

							// bind events
							$dom.bindCustomEvents();

							// show content
							open($dom);
						}

					}
				});
			};
			
		});
	};




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



		require(['/socket.io/socket.io.js'], function(){
			var questionId = document.location.pathname.split('/')[2];
			var socket = io.connect(document.location.protocol+'//'+document.location.host+'/question');

			socket.on('connect', function () {
				socket.emit('join', questionId);
			});

			socket.on('change', function(data) {
				$.get(document.location.pathname, function (res) {
					var html = $(res).find('#responses').html();
					$("#responses").html(html);
				})
			});

		});
	};


	// BIND EVENTS
	$(document).bindCustomEvents();

})(window);