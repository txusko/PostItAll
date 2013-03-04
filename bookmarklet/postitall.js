// Check if the browser supports localStorage
if(typeof(Storage)!=="undefined") {

	//Global config
	var PIAversion = "0.4";
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
		
		function loadtracking() {
			/*var _gaq = _gaq || [];
				_gaq.push(['_setAccount', 'UA-35945028-2']);
				_gaq.push(['_trackPageview']);

				(function() {
					var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
					ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
					var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
				})();*/
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
	        	
	        	
	        	//Check postit plugin
	        	if(ok && jQuery.isFunction(jQuery.fn.postitall)){
	        		$('#PIAloading').html('Jquery postitall done ...');
	        		ok = true;
	        	} else {
	        		ok = false;
	        	}
	        	
	        	//Check if all stuff was loaded
	        	if(ok) {
	        		//Called when jquery and UI (the expected version) are loaded
	        		$('#PIAloading').html('All plugins loaded ...');
					//Google analytics
					loadtracking();
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
	    	
	    	loadJs(PIAurl+'jquery.postitall.js?'+Math.floor((Math.random()*1000000)+1)); // Load the jquery minicolors plugin
	    	loadCss(PIAurl+'jquery.postitall.css?'+Math.floor((Math.random()*1000000)+1)); // Load the jquery ui
	    	
	    	
	    	//All stuff loaded OK
		    checkReady(function($) {
		    	
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
							
							if(tempheight) {
								tempheight = tempheight / 2;
							} else {
								tempheight	= 200;
							}
							var id = storageManager.nextId();
							$('#PostItAll').postitall({
								'id': id,
								'position': 'absolute',
								'posX': e.pageY - 100,
								'posY': e.pageX + 50,
								'width': 200,
								'height': tempheight,
								'description': text,
								'newPostit': true
							}).delay(1000);
							storageManager.add($('#newPostIt_'+id).postitall('options'));
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
								
								if(tempheight) {
									tempheight = tempheight / 2;
								} else {
									tempheight	= "200";
								}
								$('#PostItAll').postitall({
									'id': storageManager.nextId(),
									'position': 'absolute',
									'posX': e.pageY,
									'posY': e.pageX,
									'width': tempheight,
									'height': tempheight,
									'description': text,
									'newPostit': true
								});
								//postit.save();
								paso = false;
								//$("body").unbind('mousedown');
								e.preventDefault();
							}
						}).mouseup(function(e){
							//$(this).append('<span style="color:#00F;">Mouse down.</span>'+e.pageX +', '+ e.pageY);
							paso = false;
						});
						
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
								if(o && typeof o.id !== "undefined") {
									console.log('Loaded '+o.id);
									o.newPostit = true;
									$('#PostItAll').postitall(o);
									PIAid = o.id;
								} else {
									storageManager.remove(key);
								}
							}
						}
					};
					
					p.save = function () {
						console.log('Saving Postits');
						// Clean the localStorage
						storageManager.clear();
						// Then each postit into the LocalStorage
						$('.PIApostit').each(function () {
							storageManager.add($(this).postitall('options'));
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