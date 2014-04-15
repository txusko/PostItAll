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

// Check if the browser supports localStorage
if(typeof(Storage)!=="undefined") {
	
	//Debugging
	var debugging = true; // or true
	if (typeof(console) === "undefined") { 
		console = { 
			log: function() {} 
		};
	} else if (!debugging || typeof(console.log) === "undefined") {
		console.log = function() {};
	}

	//Global config
	var PIAurl = "https://googledrive.com/host/0B2vKerMpRnudUGJlWC1yN3VUZWs/";
	
	console.log('Init loading PIA library : '+PIAurl);
	
	// Jquery version
	var expectedVersion = "1.9.1";
	
	//Jquery UI version
	var expectedVersionUI = "1.10.1";
	
	//Loading message
	if(typeof(document.getElementById("kk")) !== "undefined") {
		var loadingMessage = document.createElement('span');
		loadingMessage.setAttribute('id','PIAloading');
		loadingMessage.setAttribute('style','z-index:9999;top:0px;left:0px;position:fixed;background-color:#FFFC7F;color:#333;');
		loadingMessage.innerHTML="Loading \"Post It All!\" ...";
		document.getElementsByTagName("body")[0].appendChild(loadingMessage);
	}
	
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
			var ret = "<div id='kk' style='width:175px;display:hidden;'>";
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
			  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
			  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
			  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
			  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

			  ga('create', 'UA-39560817-1', 'googledrive.com');
			  ga('send', 'pageview');
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
	    };
		// Load CSS content    
		loadCss(PIAurl + 'bookmarklet/postitall.css?'+Math.floor((Math.random()*1000000)+1)); //Load the PIA css
		
		
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
	        //if (window.jQuery && $.fn.jquery == expectedVersion) {
	        	
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
					//loadtracking();
	                callback(jQuery);
	        	} else {
	        		//Recheck until all stuff is loaded
	                window.setTimeout(function() { checkReady(callback); }, 100);
	            }
	        
	        //} else {
	        
	        	//Recheck until library is loaded
	        	//window.setTimeout(function() { checkReady(callback); }, 100);
	        
	        //}
	    };
	    // Jquery loaded ok
	    checkJqueryReady(function($) {
	    	
	    	//Load Jquery UI
	    	loadJs('https://ajax.googleapis.com/ajax/libs/jqueryui/'+expectedVersionUI+'/jquery-ui.min.js'); // Load the jquery ui
	    	loadCss('https://ajax.googleapis.com/ajax/libs/jqueryui/'+expectedVersionUI+'/themes/base/minified/jquery-ui.min.css'); // Load the jquery ui
	    	
	    	//Load more stuff
	    	loadJs(PIAurl+'libs/jquery.minicolors.js'); // Load the jquery minicolors plugin
	    	loadCss(PIAurl+'libs/jquery.minicolors.css'); // Load the jquery ui
	    	
	    	loadJs(PIAurl+'plugin/jquery.postitall.js?'+Math.floor((Math.random()*1000000)+1)); // Load the jquery minicolors plugin
	    	loadCss(PIAurl+'plugin/jquery.postitall.css?'+Math.floor((Math.random()*1000000)+1)); // Load the jquery ui
	    	
	    	
	    	//All stuff loaded OK
		    checkReady(function($) {
		    	
		    	// PIA Main
				var PIAMain = ( function () {
					'use strict';
					var p = PIAMain.prototype;
					
					function PIAMain () {
						$('#PIAloading').html('Creating PIA layer ...');
						console.log('create PIA');
						// Check container
						if ($('#PostItAll').length) {
							console.log('PIA exists');
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
							$('#PostItAll').postitall({
								'position': 'absolute',
								'posX': e.pageY - 100,
								'posY': e.pageX + 50,
								'width': 200,
								'height': tempheight,
								'description': text,
								'newPostit': true,
								'savable': true
							}).delay(1000);
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
								
								if(tempheight >= 400) {
									tempheight = tempheight / 2;
								} else {
									tempheight	= "200";
								}
								$('#PostItAll').postitall({
									'position': 'absolute',
									'posX': e.pageY,
									'posY': e.pageX,
									'width': tempheight,
									'height': tempheight,
									'description': text,
									'newPostit': true,
									'savable': true
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
					
					p.load = function (pageFilter) {
						$('#PIAloading').html('Loading Postits ...');
						console.log('Loading Postits');
						$.loadPostItAll(true);
					};
					
					p.save = function (pageFilter) {
						console.log('Saving Postits');
						$.savePostItAll();
					};
					
					return PIAMain;
				} )();
				
				
		        //End execution
		        $('#PIAloading').html('All done. Loading notes ...').hide('slow', function() {
		        	// Main
			    	var PIA = new PIAMain;
			    	
			    	// Set time interval to save postits each 5 seconds
			    	window.setInterval(function() { PIA.save(); }, 5000);
					
			        // Save all the postits when the user leaves the page
			        window.onbeforeunload = function () {
			        	PIA.save();
			        };
			        
		        	// Load local postits
			    	PIA.load();
			    	
			    	//Remove PIAloading
		        	$(this).html('Let\'s go!!').remove();
		        });
		        
		    });
		    //End polling ...
	    });
	    
	})(window.localStorage);
	
} else {
	
	// Sorry! No web storage support..
	alert('Sorry, your browser do not support localStorage. Post It All will not be loaded.');
	
}