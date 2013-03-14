(function(window, undefined) {

	function widget(dom) {
		var $dom = $(dom);
		this.editing = false;
		this.inputs = $dom.find('*[name]:visible');
		this.action = $dom.attr('action');
		this.method = $dom.attr('method') || 'post';
		this.edited = false;


		var widget = this, last = this.inputs.length - 1;

		$(widget).bind('error', function(){
			alert('Error, try again!');
		});


		this.reset = function(e) {
			e.preventDefault();
			widget.edited = false; // simulating not edited
			widget.show();
		};

		this.submit = function(e) {
			e.preventDefault();
			if (widget.editing) widget.show();
			else widget.edit();
		};

		this.layers = function(e) {
			$dom.find('[data-form-editing]').toggle();
			$dom.find('[data-form-showing]').toggle();
		};

		this.edit = function() {
			if (widget.editing) return;
			widget.editing = true;
			widget.edited = false;


			widget.inputs.each(function(i) {
				var tagName = $(this).data('tag') || 'input'
					, text = $(this).data('raw') || $(this).text()
					, name = $(this).attr('name')
					, tabindex = $(this).data('form-tabindex')
					, placeholder = $(this).data('form-placeholder')
					, $dom = $(document.createElement(tagName))
				;

				$dom.attr({type:'text', name:name, placeholder:placeholder, tabindex:tabindex}).addClass(this.tagName.toLowerCase()).val(text).insertBefore(this);

				if (tagName === 'textarea') {
					var textarea = $dom.get(0);
					$dom.css('height', textarea.scrollHeight + 5);

					$dom.keyup(function() {
						var currentHeight = $dom.height(), 
							diff = textarea.scrollHeight - currentHeight;

						if (diff > 15) $dom.css('height', textarea.scrollHeight);
					});
				};

				// If user change somethings, we need to sync with server
				$dom.one('keyup', function() {
					widget.edited = true;
				})

				$(this).hide();
				this.input = $dom;

				if (i === last) $(widget).trigger('edit');
			});
		};


		this.addLoadingLayer = function() {
			var css = $dom.offset(), image = 'data:image/gif;base64,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'
			
			css.background = 'url('+image+') #000 no-repeat center center';
			css.opacity = 0.3;
			css.width = $dom.outerWidth();
			css.height = $dom.outerHeight();
			css.position = 'absolute';

			return $(document.createElement('div')).css(css).appendTo(document.body);
		};



		this.show = function() {
			if (!widget.editing) return;
			widget.editing = false;
			
			if (widget.edited) {
				var $layer = widget.addLoadingLayer(), data = $dom.serialize();

				$.ajax({
					url: widget.action,
					type: widget.method,	
					dataType: "json",
					data: data, 
					complete: function() {
						$layer.remove();
					},
					success: function(res) {
						$(widget).trigger('save');

						widget.inputs.each(function(i) {
							var $dom = this.input, 
								name = $dom.attr('name'),
								value = res[name] || $dom.val();

							
							$(this).data('raw', $dom.val());

							$dom.remove();
							$(this).html(value).show();

							if (i === last) $(widget).trigger('show');
						});
					},
					error: function(xhr, status, errorMessage) {
						widget.editing = true;
						$(widget).trigger('error');
					}
				});
			} else {
				widget.inputs.each(function(i) {
					this.input.remove();
					$(this).show();
					if (i === last) $(widget).trigger('show');
				});
			}
		};


		$(widget).bind('edit', this.layers);
		$(widget).bind('show', this.layers);

		$dom.submit(this.submit);
		$dom.on('reset', this.reset);
	};

	$.fn.editable = function(cb) {
		return this.each(function() {  
			cb(new widget(this));
		});
	};

	return widget;
})(window);