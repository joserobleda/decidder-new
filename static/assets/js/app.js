(function(w, undefined) {
	"use strict";


	var $canvas = $("#canvas"), 
		$question = $('form#question'),
		userId = window.__userid || false;



	var xhrReload = function (e) {
		e.preventDefault();

		var replaces = ["#responses", "#context", "#doubts", "#question h1"];

		$.get(document.location.pathname, function (res) {
			var $doc = $(res);

			for (var i in replaces) {
				var selector = replaces[i];
				$(selector).replaceWith($doc.find(selector));
			};
		});
	};




	// ------- all the custom events
	$.fn.bindCustomEvents = function() {
		var $ctx = $(this);


        /**
          *  Confirmar acciones
          *
          *
          */
		$ctx.find('.confirm').click(function (e) {
			var $this = $(this), txt = $this.data('confirm') || 'Are you sure?';

			if (!confirm(txt)) e.preventDefault();
		});


        /**
          *  Reload page by ajax
          *
          *
          */
		$ctx.find('a.xhr-refresh').click(xhrReload);


        /**
          *  Hide 
          *
          *
          */
		$ctx.find('.hide-target').click(function (e) {
			var $this = $(this), target = $this.data('target');

			$(target).hide();
		});



        /**
          *  Tipsy links
          *
          *
          */
 		$ctx.find('[title]').tipsy({gravity: $.fn.tipsy.autoNS});



        /**
          *  Get async content
          *
          *
          */
		$ctx.find(".async").click(function () {
			event.preventDefault();
			var href = $(this).attr("href"),
				target = $(this).attr("target");

			$.get(href, function (html) {
				var $dom = $(target).html(html);
				$dom.bindCustomEvents();
				$dom.show();
			});

		});

        /**
          *  Get async content
          *
          *
          */
		$ctx.find("form").each(function () {
			// form validtions
		});



        /**
          *  Popup window
          *
          *
          */
        $ctx.find('.popup').click(function (e) {
			var href = $(this).attr('href'), 
			wname = $(this).data('popup-name') || false,
			width = $(this).data('popup-width') || 500,
			height = $(this).data('popup-height') || 280,
			left = (screen.width/2)-(width/2),
			top = (screen.height/2)-(height/2);

			window.open(href, wname, "height="+height+",width="+width+",top="+top+",left="+left+",resizable=no");
        });

        /**
          *  Get twitter count
          *
          *
          */
        $ctx.find('.tw-count').each(function () {
			var $this = $(this),
			url = $this.data('fb-url') || location.href, 
			api = "http://urls.api.twitter.com/1/urls/count.json?url=" + encodeURI(url) + "&amp;callback=?";

			function onCount(count) {
				$this.html(count);
			};

			$.getJSON(api, function(res) {
				if (res) onCount(res.count);
			});
        });


        /**
          *  Get facebook count
          *
          *
          */
        $ctx.find('.fb-count').each(function () {
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
          *  Enable taglist
          *
          *
          */
		// $ctx.find('input.taglist').each(function () {
		// 	var $this = $(this), 
		// 		data = $this.data(),
		// 		tabindex = $this.attr('tabindex'),
		// 		placeholder = $this.attr('placeholder'),
		// 		hidden = $this.is(':hidden');

		// 	$(this).tagsInput({
		// 		defaultText: placeholder,
		// 		placeholderColor: '#bbb',
		// 		ready: function () {
		// 			if (hidden) $(this).hide();
		// 			if (tabindex) $(this).find('input').attr('tabindex', tabindex);

		// 			for (var key in data) {
		// 				var attr = key.replace(/([A-Z])/g, '-$1').toLowerCase();
		// 				$(this).attr('data-' + attr, data[key]);
		// 			}
		// 		}
		// 	});
		// });




        /**
          *  Open modalbox
          *
          *
          */
		$ctx.find('.reveal').click(function () {
			var $this = $(this),
				revealId = $this.data('reveal-target') || null,
				revealSrc = $this.data('reveal-src') || null;

			if ($ctx.hasClass('modal')) {
				$ctx.remove();
			}

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
		
		require(['widget/formEditable'], function () {

			$question.editable(function (widget) {
				$(widget).bind('edit', function () {
					$('input.taglist').tagsInput({
						defaultText: 'add predefined response',
						placeholderColor: '#bbb',
						ready: function () {
							$(this).attr('data-form-editing', true);
						}
					});
					$question.find('input.taglist').hide();
				});

				$(widget).bind('show', function () {
					console.log('$$$#@');
					$question.find('.tagsinput').remove();	
					$question.find('ul.predefinded').addClass("prueba");	
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

			var isOwner = $question.data('is-owner'),
				$domViewers = $("#viewers"), 
				$updates = $("#updates"),
				currentViewers = 1,
				questionId = document.location.pathname.split('/')[2],
				socket = io.connect(document.location.protocol+'//'+document.location.host+'/question');

			socket.on('connect', function () {
				socket.emit('join', questionId);
			});

			socket.on('change', function(data) {
				// no decirle al usuario que modifica una question que hay cambios cuando es él quien modifica
				if (isOwner == true && data.type == 'question') return;

				if (userId === data.user) return;

				// mostrar el link de actualizar
				$updates.slideDown();
			});



			socket.on('viewers', function (viewers) {
				if (currentViewers != viewers) {
					currentViewers = viewers;
					$domViewers.html(viewers);
				}
			});

		});
	};


	// BIND EVENTS
	$(document).bindCustomEvents();

})(window);