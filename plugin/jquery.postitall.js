/**
* jquery.postitall.js v0.1
* jQuery Post It All Plugin - released under MIT License
* Author: Javi Filella <txusko@gmail.com>
* http://github.com/txusko/PostItAll
* Copyright (c) 2013 Javi Filella
*
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*
*/

if(jQuery) (function( $ ) {
	
	// Public methods
	$.extend($.fn, {
		postitall: function(method, data) {
			
			switch(method) {
				
				// Destroy the control
				case 'destroy':
					$(this).each( function() {
						destroy($(this));
					});
					return $(this);
					
				// Get/set options on the fly
				case 'options':
					if( data === undefined ) {
						return $(this).data('PIA-options');
					} else {
						// Setter
						$(this).each( function() {
							var options = $(this).data('PIA-options') || {};
							destroy($(this));
							$(this).postitall($.extend(true, options, data));
						});
						return $(this);
					}
					
				// Initializes the control
				case 'create':
				default:
					if( method !== 'create' ) data = method;
					$(this).each( function() {
						init($(this), data);
					});
					return $(this);
				
			}
			
		}
	});
	
	// Global Defaults
	$.fn.postitall.defaults = {
	
		// Basic Settings
		id				: 0, //Id
		created			: Date.now(),
		domain			: window.location.origin, //Domain in the url
		page			: window.location.pathname, //Page in the url
		backgroundcolor	: '#FFFC7F', //Background color
		textcolor		: '#333333', //Text color
		textshadow		: true, //Shadow in the text
		position		: 'relative', //Position absolute or relative
		posX			: '5px', //top position
		posY			: '5px', //left position
		height			: 180, //height
		width			: 200, //width
		minHeight		: 152, //resizable min-width
		minWidth		: 131, //resizable min-height
		description		: '', //content
		newPostit		: false,

		// Callbacks / Event Handlers
		onChange: function () {},
		onSelect: function () {},
		onDblClick: function () {},
		onRelease: function () {}
	};
	
	// Set options
	function setOptions( opt ) {
		if (typeof(opt) !== 'object') opt = {};
		options = $.extend(options, opt);
		$.each(['onChange','onSelect','onRelease','onDblClick'],function(i,e) {
			if (typeof(options[e]) !== 'function') options[e] = function () {};
		});
	}
	
	// Initialize elements
	function init(obj, opt) {
		
		//Default options
		options = $.extend({}, $.fn.postitall.defaults);
		
		//Set options
		if (typeof(opt) !== 'object') {
			opt = {};
		}
		setOptions(opt);
		
		//Check if we shold create a new postit
		if(options.newPostit) {
			
			//New postit
			options.newPostit = false;
			if(options.id <= 0) {
				index = getIndex();
				options.id = index;
			} else {
				index = options.id;
			}
			console.log('PIA:new content '+index);
			PIAcontent = $('<div />', { 'id' : 'newPostIt_'+index });
			obj.append(PIAcontent);
			return create(PIAcontent, options);
			
		} else {
			
			// Do nothing if already initialized
			if( obj.data('PIA-initialized') ) return;
			
			//Modify page content
			console.log('PIA:modified content');
			return create(obj, options);
			
		}
		
	}
	
	function getIndex() {
		var index = 0;
		$('.PIApostit').each(function() {
			var id = $(this).data('PIA-id');
			if(id > index) {
				index = id; 
			}
		});
		index = index + 1
		return parseInt(index);
	}
	
	function create(obj,options) {
		//Increase index
		if(options.id <= 0) {
			index = getIndex();
			options.id = index;
		} else {
			index = options.id;
		}
		obj.data('PIA-id', index)
			.data('PIA-initialized', true)
			.data('PIA-options', options);
		
		//Postit editable content
		kk = obj.html();
		options.description = options.description?options.description:kk?kk:'';
	
		//Front page: toolbar
		toolbar = $('<div />', { id: 'pia_toolbar_'+index, class: 'PIAtoolbar'});
			//Grag support without jQuery UI
			if(!$.ui) {
				toolbar.drags();
			}
			//Config icon
			toolbar.append(
					$('<div />', { 
						id: 'pia_config_'+index, 
						class: 'PIAconfig PIAicon'
					})
					.click(function(e) {
						var id = obj.data('PIA-id');
						console.log('PIA:config #idPostIt_'+id);
						$('#idPostIt_'+id).parent().addClass('flip');
						//$(this).parent().parent().parent().parent().addClass('flip');
						e.preventDefault();
					})
			)
			//Delete icon
			.append($('<div />', { id: 'pia_delete_'+index, class: 'PIAdelete PIAicon'})
				.click(function (e) {
					if($(this).parent().find('.ui-widget').length <= 0) {
						var cont = '<div class="ui-widget float-left">'
							+'<div class="PIAwarning">'
							+'<span class="PIAdelwar float-left"></span>&nbsp;Sure?&nbsp;'
							+'<a id="sure_delete_'+index+'" href="#"><span class="PIAdelyes float-right"></span></a>'
							+'<a id="cancel_'+index+'" href="#"><span class="PIAdelno float-right"></span></a>'
							+'</div>'
							+'</div>';
						$(this).parent().append(cont);
						$('#sure_delete_'+index).click(function(e) {
							//var id = $(this).closest('.PIApostit').children().attr('data-id');
							var id = obj.data('PIA-id');
							console.log('PIA:destroy #idPostIt_'+id);
							destroy($('#idPostIt_'+id).parent());
							e.preventDefault();
						});
						$('#cancel_'+index).click(function(e) {
							$(this).parent().parent().remove();
							e.preventDefault();
						});
					}
					e.preventDefault();
				})
			);
		//Front page: content
		content = $('<div />', { id: 'pia_editable_'+index, class: 'PIAeditable PIAcontent'})
			.change(function() {
				options.description = $(this).html();
				obj.data('PIA-options', options);
				autoresize(obj);
			})
			.attr('contenteditable', true)
			.html(options.description);
		//Front page
		front = $('<div />', { 
			class: 'front'
		})
		.append(toolbar)
		.append(content);
		
		
		//Back page: toolbar
		toolbar = $('<div />', { class: 'PIAtoolbar'})
			//Close config icon
			.append($('<div />', { id: 'pia_close_'+index, class: 'PIAclose PIAicon'})
				.click(function(e) {
					//var id = $(this).closest('.PIApostit').children().attr('data-id');
					var id = obj.data('PIA-id');
					console.log('PIA:close config #idPostIt_'+id);
					$('#idPostIt_'+id).parent().removeClass('flip');
					e.preventDefault();
				})
			);
		//Back page: content
		bgLabel = $('<label />', { 
			'for': 'minicolors_bg_'+index 
		}).html('Background-color:');
		bgString = $('<input />', { 
			'class': 'minicolors', 
			'id': 'minicolors_bg_'+index, 
			'type': 'text',
			'width': '75px',
			'value': options.backgroundcolor, 
			'data-default-value': options.backgroundcolor 
		});
		tcLabel = $('<label />', { 
			'for': 'minicolors_text_'+index 
		}).html('Text color:');
		tcString = $('<input />', { 
			'class': 'minicolors', 
			'id': 'minicolors_text_'+index, 
			'type': 'text',
			'width': '75px',
			'value': options.textcolor, 
			'data-default-value': options.textcolor 
		});
		if(options.textshadow) {
			checked = 'checked'
		} else {
			checked = '';
		}
		tsString = $('<input />', {
			'id': 'textshadow_'+index,
			'style': 'vertical-align:top;',
			'type': 'checkbox',
			'checked': checked
		});
		tsLabel = $('<label />', { 
			'for': 'textshadow_'+index 
		}).append(tsString).append(' Text shadow');
		content = $('<div />', { class: 'PIAcontent'})
			.append(bgLabel).append(bgString) // Bg color
			.append(tcLabel).append(tcString) // Text color
			.append(tsLabel) // Text shadow
			;
		//Back page
		back = $('<div />', { 
			class: 'back'
		})
		.append(toolbar)
		.append(content);
		
		//Create postit
		postit = $('<div />', { id: 'idPostIt_'+index, 'data-id': index })
			.append(front).append(back);
		
		//Convert relative position to prevent height and width object in html layout
		if(options.position === "relative") {
			options.position = "absolute";
			//Increase top and left to prevent overlaying postits in the same position
			options.posX = obj.offset().top + parseInt(options.posX) + (index * 5);
			options.posX += "px";
			options.posY = obj.offset().left + parseInt(options.posY) + (index * 5);
			options.posY += "px";
		}
		
		//Modify final Postit Object
		obj.removeClass()
			.addClass('block panel PIApostit')
			.css('position', options.position)
			.css('left', options.posY)
			.css('top', options.posX)
			.css('width', options.width + 'px')
			.css('height', (options.height + 30) + 'px') //Increase 30 pixels for the toolbar
			.css('background-color', options.backgroundcolor)
			.css('color', options.textcolor);
		if(options.textshadow) {
			obj.css('text-shadow', '1px 1px 0px white');
			obj.css('-moz-text-shadow', '1px 1px 0px white');
		} else {
			obj.css('text-shadow', '0px 0px 0px');
			obj.css('-moz-text-shadow', '0px 0px 0px');
		}
		
		obj.html(postit)
			.on('focus', '[contenteditable]', function() {
			    var $this = $(this);
			    $this.data('before', $this.html());
			    return $this;
			})
			.on('blur keyup paste', '[contenteditable]', function() {
			    var $this = $(this);
			    if ($this.data('before') !== $this.html()) {
			        $this.data('before', $this.html());
			        $this.trigger('change');
			    }
			    return $this;
			})
			.click(function() {
				$('.PIApostit').css('z-index', 9995);
				$(this).css('z-index', 9999);
			});
		
		if($.ui) {
			obj.draggable({ 
				handle: ".PIAtoolbar",
				scroll: false,
				start: function() {
					//Remove draggable postit option
					$('.PIApostit').css('z-index', 9995);
					$(this).css('z-index', 9999);
					$(this).draggable('disable');
				},
				stop: function() {
					//Enable draggable postit option
					$(this).draggable('enable');
					autoresize($(this))
				}
			})
			.resizable({
				animate: false,
				helper: 'ui-resizable-helper',
				minHeight: options.minHeight,
				minWidth: options.minWidth,
				stop: function(e, ui) { 
					autoresize($(this))
				}
			})
			.show("scale",{percent:100},1000, function() {
				autoresize($(this));
			});
		} else {
			obj.slideDown('slow', function() {
				autoresize($(this));
			});
		}
		
		//Rest of actions
		
		//Config: text shadow
		$('#textshadow_'+index).click(function() {
			if($(this).is(':checked')) {
				$(this).closest('.PIApostit').find('.PIAcontent').css('text-shadow', '1px 1px 0 white');
				options.textshadow = true;
			} else {
				$(this).closest('.PIApostit').find('.PIAcontent').css('text-shadow', '0px 0px 0');
				options.textshadow = false;
			}
			setOptions(options);
		});
		
		//Background and text color
		if($.minicolors) {
			//Config: change background-color
			$('#minicolors_bg_'+index).minicolors({
				change: function(hex, opacity) {
					$(this).closest('.PIApostit').css('background-color', hex);
					options.backgroundcolor = hex;
					setOptions(options);
				}
			});
			//Config: text color
			$('#minicolors_text_'+index).minicolors({
				change: function(hex, opacity) {
					$(this).closest('.PIApostit').css('color', hex);
					options.textcolor = hex;
					setOptions(options);
				}
			});
		} else {
			$('#minicolors_bg_'+index).change(function() {
				$(this).closest('.PIApostit').css('background-color', $(this).val());
				options.backgroundcolor = $(this).val();
				setOptions(options);
			});
			$('#minicolors_text_'+index).change(function() {
				$(this).closest('.PIApostit').css('color', $(this).val());
				options.textcolor = $(this).val();
				setOptions(options);
			});
		}
		
		//chaining
		return obj;
	}
	
	function autoresize(obj) {
		var id = obj.data('PIA-id'),
			options = obj.data('PIA-options'),
			posY = $('#idPostIt_'+id).parent().css('left'),
			posX = $('#idPostIt_'+id).parent().css('top'),
			divWidth = $('#idPostIt_'+id).width(),
			divHeight = $('#idPostIt_'+id).find('.PIAeditable').height(),
			minDivHeight = options.minHeight,
			minDivWidth = options.minWidth;
		
		if(divHeight >= minDivHeight) {
			divHeight += 30;
			options.height = divHeight;
			obj.css('height',divHeight);
			if($.ui) {
				obj.resizable({
					minHeight: divHeight
				});
			}
		} else if(divHeight < minDivHeight) {
			options.height = minDivHeight;
			minDivHeight += 30;
			obj.css('height',minDivHeight);
		}
		options.posY = posY;
		options.posX = posX;
		options.width = divWidth;
		//setOptions(options);
	}
	
	function destroy(obj) {
		obj
			.removeData('PIA-id')
			.removeData('PIA-initialized')
			.removeData('PIA-settings')
			.hide("slow", function () {
				$(this).remove();
			});
	}
	
})( jQuery );


//Drag postits
//used if jQuery UI is not loaded
(function($) {
    $.fn.drags = function(opt) {

        opt = $.extend({handle:"",cursor:"move"}, opt);

        if(opt.handle === "") {
            var $el = this;
        } else {
            var $el = this.find(opt.handle);
        }

        return $el.css('cursor', opt.cursor).on("mousedown", function(e) {
            if(opt.handle === "") {
                var $drag = $(this).parent().parent().parent().addClass('draggable');
            } else {
                var $drag = $(this).parent().parent().parent().addClass('active-handle').parent().addClass('draggable');
            }
            var z_idx = $drag.css('z-index'),
                drg_h = $drag.outerHeight(),
                drg_w = $drag.outerWidth(),
                pos_y = $drag.offset().top + drg_h - e.pageY,
                pos_x = $drag.offset().left + drg_w - e.pageX;
            $drag.css('z-index', 10000).parents().on("mousemove", function(e) {
                $('.draggable').offset({
                    top:e.pageY + pos_y - drg_h,
                    left:e.pageX + pos_x - drg_w
                }).on("mouseup", function() {
                    $(this).removeClass('draggable').css('z-index', z_idx);
                });
            });
            e.preventDefault(); // disable selection
        }).on("mouseup", function() {
            if(opt.handle === "") {
                $(this).removeClass('draggable');
            } else {
                $(this).removeClass('active-handle').parent().removeClass('draggable');
            }
        });

    }
})(jQuery);