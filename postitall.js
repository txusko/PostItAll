// Check if the browser supports localStorage
if(typeof(Storage)!=="undefined") {

	//Global config
	var PIAversion = "0.3";
	var PIAurl = "http://www.txusko.com/PostItAll/"+PIAversion+"/";
	
	// Jquery version
	var expectedVersion = "1.9.1";
	
	//Jquery UI version
	var expectedVersionUI = "1.10.1";
	
	//Loading message
	var loadingMessage = document.createElement('span');
	loadingMessage.setAttribute('id','PIAloading');
	loadingMessage.setAttribute('style','z-index:9999;top:0px;left:0px;position:fixed;background-color:#FFFC7F;color:#333;');
	loadingMessage.innerHTML="Loading \"Post It All!\" ...";
	document.getElementsByTagName("body")[0].appendChild(loadingMessage);
	
	// Begin execution
	(function($storage) {
		
		//UTILITIES
		function rgb2hex(rgb) {
		    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
		    function hex(x) {
		        return ("0" + parseInt(x).toString(16)).slice(-2);
		    }
		    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
		}
		
		// Get user selection text on page
		function getSelectedText() {
			var ret = "<div id='kk' style='width:175px;display:hidden;'>"
		    if (window.getSelection) {
		        return ret + window.getSelection() + "</div>";
		    }
		    else if (document.selection) {
		        return ret + document.selection.createRange().text + "</div>";
		    }
		    return ret + "&nbsp;<br>&nbsp;<br></div>";
		}
		
		// Get user selection html on page
		function getSelectedHtml() {
			var html = "<div id='kk' style='width:175px;display:hidden;'>";
			if (typeof window.getSelection != "undefined") {
				var sel = window.getSelection();
				if (sel.rangeCount) {
					var container = document.createElement("div");
					for (var i = 0, len = sel.rangeCount; i < len; ++i) {
						container.appendChild(sel.getRangeAt(i).cloneContents());
					}
					html = container.innerHTML;
				}
			} else if (typeof document.selection != "undefined") {
				if (document.selection.type == "Text") {
					html = document.selection.createRange().htmlText;
				}
			}
			return html + "&nbsp;<br></div>";
		}
		
	    /**
	     * Load the JS
	     */
	    var loadJs = function(url) {
	        var script = document.createElement("SCRIPT");
	        script.src = url;
	        script.type = 'text/javascript';
	        document.getElementsByTagName("head")[0].appendChild(script);
	    };
	    // Load JS content
	    loadJs('https://ajax.googleapis.com/ajax/libs/jquery/'+expectedVersion+'/jquery.min.js'); // Load the jquery script
		//loadJs(PIAurl+'jquery.min.js');
	    
	    /**
	     * Load the CSS
	     */
	    var loadCss = function(url) {
	    	// Load the jquery UI css
	        var scriptCss = document.createElement("link");
	        scriptCss.setAttribute("rel", "stylesheet");
	        scriptCss.setAttribute("type", "text/css");
	        scriptCss.setAttribute("href", url);
	        document.getElementsByTagName("head")[0].appendChild(scriptCss);
	    }
		// Load CSS content    
		loadCss(PIAurl + 'postitall.css?'+Math.floor((Math.random()*1000000)+1)); //Load the PIA css
		
		var PIAid = 0;
		
		/**
		 * Manage localStorage
		 */
		var storageManager = {
		        add: function (obj) {
		            $storage.setItem(obj.id, JSON.stringify(obj));
		        },
		
		        get: function (id) {
		            return JSON.parse($storage.getItem(id));
		        },
		        
		        nextId: function() {
		        	PIAid++;
		        	if($storage.getItem(PIAid)) {
		        		return this.nextId();
		        	} else {
		        		return PIAid;
		        	}
		        },
		
		        remove: function (id) {
		        	PIAid = 0;
		        	$storage.removeItem(id);
		        },
		
		        clear: function () {
		        	PIAid = 0;
		            $storage.clear();
		        },
		        
		        getlength: function() {
		        	var len = $storage.length;
		        	return len;
		        },
		        
		        getkey: function(i) {
		        	var key = $storage.key(i);
		        	return key;
		        }
		
		    };
		
	    /**
	     * 1st Check for jquery
	     * Necessary for the load of the ui and the plugins
	     */
	    var checkJqueryReady = function(callback) {
	    	
	    	//Check jquery library
	        if (window.jQuery && $.fn.jquery == expectedVersion) {
	        	//Called when jquery are loaded
	        	$('#PIAloading').html('Jquery done ...');
	            callback(jQuery);        
	        } else {
	        	//Recheck until library is loaded
	        	window.setTimeout(function() { checkJqueryReady(callback); }, 100);
	        }
	    };
	    /**
	     * 2nd Check for all stuff
	     */
	    var checkReady = function(callback) {
	    	
	    	//Check jquery library again (not necessary)
	        if (window.jQuery && $.fn.jquery == expectedVersion) {
	        	
	        	var ok = false;
	        	
	        	//Check jquery UI
	        	if($.ui && $.ui.version == expectedVersionUI) {
	        		$('#PIAloading').html('Jquery UI done ...');
	        		ok = true;
	        	} else {
	        		ok = false;
	        	}
	        	
	        	//Check minicolors plugin
	        	if(ok && jQuery.isFunction(jQuery.fn.minicolors)){
	        		$('#PIAloading').html('Jquery minicolors done ...');
	        		ok = true;
	        	} else {
	        		ok = false;
	        	}
	        	
	        	//Check if all stuff was loaded
	        	if(ok) {
	        		//Called when jquery and UI (the expected version) are loaded
	        		$('#PIAloading').html('All plugins loaded ...');
	                callback(jQuery);
	        	} else {
	        		//Recheck until all stuff is loaded
	                window.setTimeout(function() { checkReady(callback); }, 100);
	            }
	        
	        } else {
	        
	        	//Recheck until library is loaded
	        	window.setTimeout(function() { checkReady(callback); }, 100);
	        
	        }
	    };
	    // Jquery loaded ok
	    checkJqueryReady(function($) {
	    	
	    	//Load Jquery UI
	    	loadJs('https://ajax.googleapis.com/ajax/libs/jqueryui/'+expectedVersionUI+'/jquery-ui.min.js'); // Load the jquery ui
			//loadJs(PIAurl+'jquery-ui.min.js');
	    	loadCss('http://code.jquery.com/ui/'+expectedVersionUI+'/themes/base/jquery-ui.css'); //Load the jquery ui css
	    	
	    	//Load more stuff
	    	loadJs(PIAurl+'jquery.minicolors.js'); // Load the jquery minicolors plugin
	    	loadCss(PIAurl+'jquery.minicolors.css'); // Load the jquery ui
	    	
	    	
	    	//All stuff loaded OK
		    checkReady(function($) {
		    	
		    	//add change event on editableContent
				$('body').on('focus', '[contenteditable]', function() {
				    var $this = $(this);
				    $this.data('before', $this.html());
				    return $this;
				}).on('blur keyup paste', '[contenteditable]', function() {
				    var $this = $(this);
				    if ($this.data('before') !== $this.html()) {
				        $this.data('before', $this.html());
				        $this.trigger('change');
				    }
				    return $this;
				});
		    	
		    	// POSTITS 
		    	var PostIt = ( function () {
		    		'use strict';
		    		var p = PostIt.prototype;
		    		
		    		// Constructor
		    		function PostIt(id,page,color,textcolor,textshadow,posX,posY,width,height,description) {
		    			this.id = id; //Postit id
		    			this.page = page; //Page in the url
		    			this.color = color; //Background color
		    			this.textcolor = textcolor; //Text color
		    			this.textshadow = textshadow; //Shadow in the text
		    			if(parseInt(posX) < 0) {
		    				posX = 0;
		    			}
		    			this.posX = posX; //top position
		    			if(parseInt(posY) < 0) {
		    				posY = 0;
		    			}
		    			this.posY = posY; //left position
		    			this.height = height; //height
		    			this.width = width; //width
		    			this.description = description; //content
		    		}
		    		
		    		// Create a postit at `where` div
		    		p.create = function (where) {
		    			//Check page
		    			if(this.page === window.location.pathname) {
		    				console.log('Create:'+this.id+'-color:'+this.color+'-textcolor:'+this.textcolor+'-shadow:'+this.textshadow+
		    						'-posX:'+this.posX+'-posY:'+this.posY+'-width:'+this.width+'-height:'+this.height+'-description:'+this.description);
		    				//Create PostIt, data-key will be the localStorage id
		    				var htmlString = '<div id="idPostIt_'+this.id+'" class="block panel PIApostit" data-key="' + this.id + '"';
		    				htmlString += ' style="position:absolute; left:'+this.posY+'; top:'+this.posX + ';';
		    				if(this.width) htmlString += ' width:'+this.width+'px;';
		    				if(this.height) htmlString += ' height:'+this.height+'px;';
		    				if(this.color) htmlString += ' background-color:'+this.color+';';
		    				if(this.textcolor) htmlString += ' color:'+this.textcolor+';';
		    				htmlString += '">';
		    				
		    				// FRONT
		    				htmlString += '<div class="front">'
		    					htmlString += '<div class="PIAtoolbar">&nbsp;';
		    						htmlString += '<span id="pia_config_'+this.id+'" class="PIAconfig PIAicon ui-icon ui-icon-gear"></span>';
		    						htmlString += '<span id="pia_delete_'+this.id+'" class="PIAdelete PIAicon ui-icon ui-icon-trash"></span>';
		    					htmlString += '</div>';
		    					htmlString += '<div id="pia_editable_'+this.id+'" contenteditable class="PIAeditable PIAcontent" style="';
		    					if(this.textshadow != "checked") htmlString += 'text-shadow: 0px 0px 0;';
		    					htmlString += '">';
		    						htmlString += this.description;
		    					htmlString += '</div>';
		    				htmlString += '</div>';
		    				
		    				// CONFIG
		    				htmlString += '<div class="back">'
		    					htmlString += '<div class="PIAtoolbar">';
		    						htmlString += '<span id="pia_close_'+this.id+'" class="backClose PIAicon ui-icon ui-icon-close"></span>';
		    						//htmlString += '<span id="pia_save_'+this.id+'" class="backSave PIAicon ui-icon ui-icon-disk"></span>';
		    					htmlString += '</div>';
		    					htmlString += '<div class="PIAcontent"';
		    					if(this.textshadow != "checked") htmlString += ' style="text-shadow: 0px 0px 0;"';
		    					htmlString += '>Color:<br>';
		    					htmlString += 'Background:<input class="minicolors" id="minicolors_bg_'+this.id+'" data-default-value="#FFFC7F" type="text" value="'+this.color+'"><br>';
		    					htmlString += 'Text color:<input class="minicolors" id="minicolors_text_'+this.id+'" data-default-value="#333333" type="text" value="'+this.textcolor+'"><br>';
		    					htmlString += '<input type="checkbox" id="textshadow_'+this.id+'" '+this.textshadow+'> Text Shadow';
		    					htmlString += '</div>';
		    				htmlString += '</div>';
		    				
		    				htmlString += '</div>';
		    				$(where).append(htmlString);
		    				
		    				//ACTIONS
		    				$('#idPostIt_'+this.id).draggable({ 
		    					handle: ".PIAtoolbar",
		    					scroll: false,
		    					start: function() {
		    						//Remove draggable postit option
		    						$(this).draggable('disable');
		    					},
		    					stop: function() {
		    						//TODO: Funcio unica de save
		    						var id = $(this).attr('data-key');
		    						var checked = $('#textshadow_'+id).is(':checked')?'checked':'';
		    						var color = rgb2hex($(this).css('background-color'));
		    						var textcolor = rgb2hex($(this).css('color'));
		    						console.log('Save:'+id+'-color:'+color+'-textcolor:'+textcolor+'-textshadow:'+checked+
		    								'-top:'+$(this).position().top+'-left:'+$(this).position().left+'-width:'+$(this).width()+'-height:'+$(this).height()+'-description:'+$(this).find('.PIAeditable').html());
		    						var postit = new PostIt(id, window.location.pathname, color, textcolor,checked, $(this).position().top, 
		    								$(this).position().left, $(this).width(), $(this).height(), $(this).find('.PIAeditable').html());
		    						postit.save();
		    						//Enable draggable postit option
		    						$(this).draggable('enable');
		    					}
		    				}).resizable({
		    					animate: false,
		    					minHeight: 200,
		    					minWidth: 200,
		    					stop: function(e) {
		    						/*var id = $(this).attr('data-key');
		    						var divheight = $('#pia_editable_'+id).height() + 30;
			    				    $(this).css('height',divheight);
			    				    e.preventDefault();*/
		    					}
		    				}).show("scale",{percent:100},1000);
		    				
		    				$('#pia_editable_'+this.id).change(function() {
		    					var id = $(this).closest('.PIApostit').attr("data-key");
		    					var divheight = $(this).height() + 30;
		    				    $('#idPostIt_'+id).css('height',divheight);
		    				});
		    				
		    				// Remove Postit
		    				$('#pia_delete_'+this.id).click(function () {
		    					var id = $(this).closest('.PIApostit').attr("data-key");
		    					var cont = '<div class="ui-widget float-left">'
		    						+'<div class="ui-state-error ui-corner-all" style="font-size:0.8em;height:16px;text-align:left;">'
		    						+'<span class="ui-icon ui-icon-alert float-left"></span>&nbsp;Sure?&nbsp;'
		    						+'<a id="sure_delete_'+id+'" href="#"><span class="ui-icon ui-icon-circle-check float-right"></span></a>'
		    						+'<a id="cancel_'+id+'" href="#"><span class="ui-icon ui-icon-circle-close float-right"></span></a>'
		    						+'</div>'
		    						+'</div>';
		    					$(this).parent().append(cont);
		    					$('#sure_delete_'+id).click(function(e) {
		    						console.log('Delete:'+id);
		    						$('#idPostIt_'+id).hide("slow", function () {
		    							storageManager.remove(id);
		    							$(this).remove();
		    						});
		    						e.preventDefault();
		    					});
		    					$('#cancel_'+id).click(function(e) {
		    						$(this).parent().parent().remove();
		    						e.preventDefault();
		    					});
		    				});
		    				//Config: Show settings layer
		    				$('#pia_config_'+this.id).click(function() {
		    					var id = $(this).closest('.PIApostit').attr("data-key");
		    					$('#idPostIt_'+id+'.block').addClass('flip');
		    				});
		    				//Config: Hide settings layer
		    				$('#pia_close_'+this.id).click(function(e) {
		    					var id = $(this).closest('.PIApostit').attr("data-key");
		    					$('#idPostIt_'+id+'.block').removeClass('flip');
		    					e.preventDefault();
		    				});
		    				//Config: change color widget
		    				$('#minicolors_bg_'+this.id).minicolors({
		    					change: function(hex, opacity) {
		    						$(this).closest('.PIApostit').css('background-color', hex);
		    					}
		    				});
		    				//Config: text color
		    				$('#minicolors_text_'+this.id).minicolors({
		    					change: function(hex, opacity) {
		    						$(this).closest('.PIApostit').css('color', hex);
		    					}
		    				});
		    				//Config: text shadow
		    				$('#textshadow_'+this.id).click(function() {
		    					if($(this).is(':checked')) {
		    						$(this).closest('.PIApostit').find('.PIAcontent').css('text-shadow', '1px 1px 0 white');
		    					} else {
		    						$(this).closest('.PIApostit').find('.PIAcontent').css('text-shadow', '0px 0px 0');
		    					}
		    				});
		    			}
		    		};
		    		
		    		// Remove the postit
		    		p.remove = function () {
		    			//if (confirm('Are you sure you want to delete this Postit?')) {
		    				$('#idPostIt_'+this.id).fadeOut('slow', function () {
		    					//Remove from storageManager
		    					storageManager.remove(this.id);
		    					//Remove div
		    					$(this).remove();
		    				});
		    			//}
		    		};
		    		
		    		// Save the postit in localStorage
		    		p.save = function () {
		    			//syncManager.add(this);
		    			storageManager.add(this);
		    		};
		    		
		    		// Get the postit from localStorage
		    		p.get = function (id) {
		    			//syncManager.get(id);
		    			return storageManager.get(id);
		    		};
		    		
		    		return PostIt;
		    		
		    	})();
		    	
		    	// PIA Main
				var PIAMain = ( function () {
					'use strict';
					var p = PIAMain.prototype;
					var postit;
					
					function PIAMain () {
						$('#PIAloading').html('Creating PIA layer ...');
						console.log('create PIA');
						// Check container
						if ($('#PostItAll').length) {
							console.log('PIA exists');
							//Save created postits
							this.save();
							//Remove old container
							$('#PostItAll').remove();
							//Remove the "Add postit" button
							$('#idAddPostItButton').remove();
						}
						// Add container
						var container = '<div id="PostItAll"></div>';
						$('body').append(container);
						
						// Create the "Add postit" Button
						var addPostIt = '<div id="idAddPostItButton">';
						addPostIt += '<a href="#" id="id_addPostIt">Add Postit</a>';
						addPostIt += '</div>';
						$('body').append(addPostIt);
						
						// "Add postit" Button Action
						$('#id_addPostIt').click(function(e) {
							var p = $("#id_addPostIt");
							//top
							var top = p.offset().top;
							//height
							var texto = $('#PostItAll').append(getSelectedText());
							//var texto = $('#PostItAll').append(getSelectedHtml());
							document.getElementById("kk").style.height = "auto"; //The id of this div is 'sample'
							var tempheight = document.getElementById("kk").offsetHeight;
							
							document.getElementById("kk").style.height = "0px";
							//description
							var text = $('#kk').text();
							$('#kk').remove();
							
							var o = new Object();
							o.id 			= storageManager.nextId();
							o.page			= window.location.pathname;
							o.color 		= "#FFFC7F";
							o.textcolor 	= "#333";
							o.textshadow 	= "checked";
							o.posX 			= top+"px";
							o.posY 			= "100px";
							o.width 		= "200";
							if(tempheight) {
								o.height	= tempheight;
							} else {
								o.height	= "200";
							}
							o.description 	= text;
							
							postit 		= new PostIt(o.id, o.page, o.color, o.textcolor, o.textshadow, o.posX, o.posY, o.width, o.height, o.description);
							postit.create('#PostItAll');
							postit.save();
							e.preventDefault();
						});
						
						//Hotkeys
						var paso = false;
						$(document).keydown(function(event) {
							if(event.keyCode == "16") { //caps
								paso = true;
							} else {
								paso = false;
							}
						});
						
						$("body").mousedown(function(e){
							if(paso) {
								
								var p = $("#id_addPostIt");
								//top
								var top = p.offset().top;
								//height
								var texto = $('#PostItAll').append(getSelectedText());
								//var texto = $('#PostItAll').append(getSelectedHtml());
								document.getElementById("kk").style.height = "auto"; //The id of this div is 'sample'
								var tempheight = document.getElementById("kk").offsetHeight;
								
								document.getElementById("kk").style.height = "0px";
								//description
								var text = $('#kk').text();
								$('#kk').remove();
								
								var o = new Object();
								o.id 			= storageManager.nextId();
								o.page			= window.location.pathname;
								o.color 		= "#FFFC7F";
								o.textcolor 	= "#333";
								o.textshadow 	= "checked";
								o.posX 			= e.pageY+"px";
								o.posY 			= e.pageX+"px";
								if(tempheight) {
									o.height	= tempheight / 2;
									o.width	= tempheight / 2;
								} else {
									o.height	= "200";
									o.width 		= "200";
								}
								o.description 	= text;
								
								postit 		= new PostIt(o.id, o.page, o.color, o.textcolor, o.textshadow, o.posX, o.posY, o.width, o.height, o.description);
								postit.create('#PostItAll');
								postit.save();
								paso = false;
								e.preventDefault();
							}
						});
						/*.mousedown(function(e){
							//$(this).append('<span style="color:#00F;">Mouse down.</span>'+e.pageX +', '+ e.pageY);
						});*/
						
						
					}
					
					p.load = function () {
						$('#PIAloading').html('Loading Postits ...');
						console.log('Loading Postits');
						// Create all posticks saved in localStorage
						var len = storageManager.getlength(); 
						if (len > 0) {
							var key = 0;
							for (var i = 0; i < len; i++) {
								key = storageManager.getkey(i);
								var o = storageManager.get(key);
								if(typeof o.id !== "undefined") {
									console.log('Loaded '+o.id);
									postit = new PostIt(o.id, o.page, o.color, o.textcolor, o.textshadow, o.posX, o.posY, o.width, o.height, o.description);
									postit.create('#PostItAll');
									//storageManager.nextId();
									PIAid = o.id;
								} else {
									storageManager.remove(key); 
									//syncManager.remove(key); 
								}
							}
						}
					};
					
					p.save = function () {
						console.log('Saving Postits');
						// Clean the localStorage
						//storageManager.clear();
						// Then each postit into the LocalStorage
						//var i=1;
						$('.PIApostit').each(function () {
							var id = $(this).attr('data-key');
							//var id = i;
							var checked = $('#textshadow_'+id).is(':checked')?'checked':'';
							var color = rgb2hex($(this).css('background-color'));
							var textcolor = rgb2hex($(this).css('color'));
							var page = window.location.pathname;
							console.log('Save:'+id+'-color:'+color+'-textcolor:'+textcolor+'-textshadow:'+checked+
									'-top:'+$(this).position().top+'-left:'+$(this).position().left+'-width:'+$(this).width()+'-height:'+$(this).height()+'-description:'+$(this).find('.PIAeditable').html());
							var postit = new PostIt(id, page, color, textcolor,checked, $(this).css("top"), $(this).css("left"),
									$(this).width(), $(this).height(), $(this).find('.PIAeditable').html());
							postit.save();
							//i++;
						});
					};
					
					return PIAMain;
				} )();
				
				
		    	
		    	// Main
		    	var PIA = new PIAMain;
		    	
		    	// Load local postits
		    	PIA.load();
				
		    	// TODO: Set time interval to save postits
		    	//PIA.save();
				
		        // Save all the postits when the user leaves the page
		        window.onbeforeunload = function () {
		        	PIA.save();
		        }
		        
		        //End execution
		        $('#PIAloading').html('All done. Let\'s go!!').delay(1000).hide('slow', function() {
		        	$(this).remove();
		        });
		        
		    });
		    //End polling ...
	    });
	    
	})(window.localStorage);
	
} else {
	
	// Sorry! No web storage support..
	alert('Sorry, your browser do not support localStorage. Post It All will not be loaded.');
	
}