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

/*global window */
/*global jQuery */

//Grab mouse position
(function ($, $localStorage) {
    "use strict";

    // Global Vars
    var options;

    var $storage = null;

    // Storage Manager
    var storageManager = {
        add: function (obj, callback) { 
            loadManager(function() {
                $storage.add(obj, function() {
                    if(callback != null) callback();
                }); 
            });
        },
        get: function (id, callback) { 
            loadManager(function() {
                $storage.get(id, function(varvalue) {
                    if(callback != null) callback(varvalue);
                }); 
            });
        },
        nextId: function (callback) { 
            loadManager(function() {
                storageManager.getlength(function(length) {
                    length++;
                    callback(parseInt(length, 10));
                });
            });
        },
        remove: function (id, callback) { 
            loadManager(function() {
                $storage.remove(id, function(varvalue) {
                    if(callback != null) callback();
                });
            });
        },
        clear: function (callback) { 
            loadManager(function() {
                $storage.clear(function() {
                    if(callback != null) callback();
                });
            });
        },
        getlength: function (callback) { 
            loadManager(function() {
                $storage.getlength(function(length) {
                    if(callback != null) callback(length);
                });
            });
        },
        key: function (i, callback) {
            loadManager(function() {
                $storage.key(i, function(name) {
                    if(callback != null) callback(name);
                });
            });
        }
    };

    function loadManager(callback) {
        if($storage === null) {
            getStorageManager(function($tmpStorage) {
                $storage = $tmpStorage;
                callback($storage)
            });
        } else {
            callback(null);
        }
    }

    // Get storage manager
    function getStorageManager(callback) {
        switch($.fn.postitall.globals.storage.type) {    
            case 'local':
                callback(localManager);
            break;
            case 'chrome':
                callback(chromeManager);
            break;
            case 'external':
                if($.fn.postitall.globals.storage.manager !== "") {
                    $.ajax({
                      url: $.fn.postitall.globals.storage.manager,
                      dataType: "script",
                      success: function() {
                        if(callback != null) callback(getExternalManager());
                      }
                    });    
                } else {
                    callback(null);
                }
            break;
            default:
                callback(null);
            break;
        }
    }

    // local storage manager
    var localManager = {
        add: function (obj, callback) { 
            var varname = 'PostIt_' + parseInt(obj.postit.id, 10);
            var testPrefs = JSON.stringify(obj);
            $localStorage.setItem(varname, testPrefs);
            //console.log('Saved', varname, testPrefs);
            if(callback != null) callback();
        },
        get: function (id, callback) { 
            var varname = 'PostIt_' + parseInt(id, 10);
            var varvalue = $localStorage.getItem(varname);
            if(varvalue != null)
                varvalue = JSON.parse(varvalue);
            else
                varvalue = "";
            //console.log('Loaded', varname, varvalue);
            if(callback != null) callback(varvalue);
        },
        remove: function (id, callback) { 
            $localStorage.removeItem('PostIt_' + id);
            if(callback != null) callback();
        },
        clear: function (callback) { 
            $localStorage.clear();
            if(callback != null) callback(); 
        },
        getlength: function (callback) {
            callback($localStorage.length); 
        },
        key: function (i, callback) {
            var name = $localStorage.key(i);
            callback(name);
        }
    };


    // chrome storage Manager
    var chromeManager = {
        add: function(obj, callback) {
            var varname = 'PostIt_' + parseInt(obj.postit.id, 10);
            var testPrefs = JSON.stringify(obj);
            var jsonfile = {};
            jsonfile[varname] = testPrefs;
            chrome.storage.sync.set(jsonfile, function () {
                if(callback != null) callback();
            });
        },
        get: function(id, callback) {
            var varvalue;
            var varname = 'PostIt_' + parseInt(id, 10);
            chrome.storage.sync.get(null, function(retVal) {
                //Recover vars
                if(retVal[varname] !== undefined)
                    varvalue = JSON.parse(retVal[varname]);
                else
                    varvalue = "";
                if(callback != null) callback(varvalue);
            });
        },
        remove: function(varname, callback) {
            //console.log('Remove',varname);
            chrome.storage.sync.remove(varname, function() {
                //console.log('Removed',varname);
                if(callback != null) callback();
            });
        },
        clear: function(callback) {
            chrome.storage.sync.clear(function() {
                console.log('Clear chrome storage');
                if(callback != null) callback();
            });
        },
        getlength: function(callback) {
            var total = 0;
            chrome.storage.sync.get(null,function(data) {
                total = Object.keys(data).length;
                if(callback != null) callback(total);
            });
        },
        key: function (i, callback) {
            var varname = 'PostIt_' + parseInt(i, 10);
            chrome.storage.sync.get(null,function(retVal) {
                //console.log(retVal);
                if(retVal[varname] !== undefined)
                    callback(varname);
                else
                    callback(""); 
            });
        }
    };

    //Save object
    function save(obj) {
        var options = obj.data('PIA-options');
        if(options.features.savable) {
            storageManager.add(options);
        }
    }

    //Destroy object
    function destroy(obj) {
        var id = obj.data('PIA-id');
        options = obj.data('PIA-options');
        //Remove from localstorage
        if (options.features.savable) {
            storageManager.remove(id);
        } else {
            storageManager.get(id, function(varvalue) {
                if(varvalue != null && varvalue != "")
                    storageManager.remove(id);
            });
        }
        //Destroy object
        hide(obj);
    }

    //Hide object
    function hide(obj) {
        //hide object
        obj
            .removeData('PIA-id')
            .removeData('PIA-initialized')
            .removeData('PIA-settings')
            .hide("slow", function () {
                $(this).remove();
            });
    }

    //Autoresize postit
    function autoresize(obj) {

        var id = obj.data('PIA-id');
        options = obj.data('PIA-options');
        
        if(options.features.minimized)
            return;

        if (options.features.autoheight) {
            var contentHeight = $('#idPostIt_' + id).find('.PIAeditable').height();

            var posY = $('#idPostIt_' + id).parent().css('left'),
                posX = $('#idPostIt_' + id).parent().css('top'),
                divWidth = $('#idPostIt_' + id).width(),
                //divHeight = $('#idPostIt_' + id).find('.PIAeditable').height(),
                divHeight = $('#idPostIt_' + id).parent().css('height'),
                minDivHeight = options.postit.minHeight;

                divHeight = parseInt(divHeight,10);
                contentHeight = parseInt(contentHeight,10);

                if(contentHeight > divHeight - 25) {
                    divHeight = contentHeight + 25;
                }

            //if (divHeight >= minDivHeight) {
                //divHeight += 50;
                options.postit.height = divHeight;
                obj.css('height', divHeight);
                if ($.ui) {
                    if ($.fn.postitall.globals.features.resizable && options.features.resizable) {
                        var newMinHeight = parseInt(options.postit.minHeight,10);
                        if((contentHeight + 25) > newMinHeight)
                            newMinHeight = contentHeight + 25;

                        obj.resizable({
                            minHeight: newMinHeight
                        });
                    }
                }
            /*} else if (divHeight < minDivHeight) {
                options.postit.height = minDivHeight;
                //minDivHeight += 50;
                obj.css('height', minDivHeight);
            }*/
            /*if(options.postit.position != "fixed") {
                options.postit.posY = posY;
                options.postit.posX = posX;
            }*/
            options.postit.width = divWidth;
        }
    }

    //Get Next Postit Id
    function getIndex(callback) {
        /*storageManager.nextId(function(index) {
            callback(index);
        });*/
        //var index = guid();
        //callback(index);
        var len = 0;
        var content = "";
        var paso = false;
        storageManager.getlength(function(len) {
            var loadedItems = $('.PIApostit').length;
            var items = len + loadedItems + 1;
            for(var i  = 1; i <= items; i++) {
                storageManager.get(i, function(content) {
                    if(!paso && content == "" && $( "#idPostIt_" + i ).length <= 0) {
                        paso = true;
                        callback(i);
                        return;
                    }
                });
            }
            if(!paso && i >= items) {
                callback(i);
            }
        });
    }

    // Set options
    function setOptions(opt, save) {
        if (typeof opt !== 'object') {
            opt = {};
        }
        if (save === undefined) {
            save = false;
        }
        options = $.extend(options, opt);
        /*jslint unparam: true*/
        $.each(['onChange', 'onSelect', 'onRelease', 'onDblClick'], function (i, e) {
            if (typeof options[e] !== 'function') {
                options[e] = function () { return undefined; };
            }
        });
        /*jslint unparam: false*/
        if (save && options.features.savable) {
            storageManager.add(options);
        }
    }

    //Create a postit
    function create(obj, index, options) {

        obj.data('PIA-id', index)
            .data('PIA-initialized', true)
            .data('PIA-options', options);
        //Postit editable content
        if (options.postit.content === "") {
            if (obj.html() !== "") {
                options.postit.content = obj.html();
            }
        }
        //Front page: toolbar
        var barCursor = "cursor: inherit;";
        if (options.features.draggable) {
            barCursor = "cursor: move;";
        }
        var toolbar = $('<div />', {
            'id': 'pia_toolbar_' + index.toString(),
            'class': 'PIAtoolbar',
            'style': barCursor
        });
        //Drag support without jQuery UI
        if (!$.ui) {
            if (options.features.draggable) {
                toolbar.drags();
            }
        }

        //Delete icon
        if (options.features.removable) {
            toolbar.append($('<div />', { 'id': 'pia_delete_' + index.toString(), 'class': 'PIAdelete PIAicon'})
                .click(function (e) {
                    if ($(this).parent().find('.ui-widget2').length <= 0) {
                        var cont = '<div class="ui-widget2" id="pia_confirmdel_' + index + '">' +
                            '<div class="PIAwarning">' +
                            '<span class="PIAdelwar float-left"></span>Delete notes :<br>' +
                            '<div class="PIAconfirmOpt"><a id="sure_delete_' + index + '" href="#"><span class="PIAdelyes PIAicon"> Delete this note</span></a></div>' +
                            '<div class="PIAconfirmOpt"><a id="all_' + index + '" href="#"><span class="PIAdelyes PIAicon"> Delete all notes</span></a></div>' +
                            '<div class="PIAconfirmOpt"><a id="cancel_' + index + '" href="#"><span class="PIAdelno PIAicon"> Cancel</span></a></div>' +
                            '<div class="clear" style="line-height:15px;font-weight:bold;"><br>* This action can be undone!</div>'
                            '</div>' +
                            '</div>';
                        $(this).parent().parent().append(cont);
                        $('#pia_confirmdel_' + index).css('height', options.postit.minHeight - 25);
                        $('#pia_editable_' + index).hide();
                        $('#sure_delete_' + index).click(function (e) {
                            //var id = $(this).closest('.PIApostit').children().attr('data-id');
                            var id = obj.data('PIA-id');
                            destroy($('#idPostIt_' + id).parent());
                            e.preventDefault();
                        });
                        $('#all_'+index).click(function(e) {
                            $.removePostItAll();
                            e.preventDefault();
                        });
                        $('#cancel_' + index).click(function (e) {
                            $('#pia_editable_' + index).show();
                            $('#pia_confirmdel_' + index).remove();
                            e.preventDefault();
                        });
                    }
                    e.preventDefault();
                }));
        }

        //Config icon
        if (options.features.changeoptions) {
            toolbar.append(
                $('<div />', {
                    'id': 'pia_config_' + index.toString(),
                    'class': 'PIAconfig PIAicon'
                }).click(function (e) {
                    var id = obj.data('PIA-id');
                    $('#idPostIt_' + id + ' > .back').css('visibility', 'visible');
                    $('#idPostIt_' + id).parent().addClass('flip', function () {
                        $('#idPostIt_' + id + ' > .front').css('visibility', 'hidden');
                    });
                    if($.ui) $('#idPostIt_' + id).parent().resizable("disable");
                    //$(this).parent().parent().parent().parent().addClass('flip');
                    e.preventDefault();
                })
            );
        }
        //Save icon
        /*if (options.features.savable) {
            toolbar.append(
                $('<div />', {
                    'id': 'pia_save_' + index.toString(), 
                    'class': 'PIAsave PIAicon'
                })
                .click(function (e) {
                    var id = obj.data('PIA-id');
                    save($('#idPostIt_' + id).parent());
                    e.preventDefault();
                })
            );
        }*/

        //Fixed
        toolbar.append(
            $('<div />', {
                'id': 'pia_fixed_' + index.toString(), 
                'class': 'PIAfixed' + (options.postit.position == "fixed" ? '2' : '') + ' PIAicon'
            }).click(function (e) {
                var id = obj.data('PIA-id');
                var options = obj.data('PIA-options');
                var posY = $('#idPostIt_' + id).parent().css('left'),
                    posX = $('#idPostIt_' + id).parent().css('top'),
                    divWidth = $('#idPostIt_' + id).width(),
                    divHeight = $('#idPostIt_' + id).find('.PIAeditable').height(),
                    minDivHeight = options.postit.minHeight;
                if(options.postit.position == "fixed") {
                    $('#pia_fixed_'+index.toString()).removeClass('PIAfixed2').addClass('PIAfixed');
                    options.postit.position = "absolute";
                    options.postit.posX = $('#idPostIt_' + id).parent().offset().top;
                    obj.removeClass("fixed");
                } else {
                    $('#pia_fixed_'+index.toString()).removeClass('PIAfixed').addClass('PIAfixed2');
                    options.postit.position = "fixed";
                    options.postit.posX = $('#idPostIt_' + id).parent().offset().top - $(document).scrollTop();
                    obj.addClass("fixed");
                }
                options.postit.posY = $('#idPostIt_' + id).parent().offset().left;
                obj.css('position', options.postit.position);
                obj.css('left', options.postit.posY);
                obj.css('top', options.postit.posX);

                obj.data('PIA-options', options);
                save($('#idPostIt_' + id).parent());
                e.preventDefault();
            })
        );

        //MINIMIZE
        toolbar.append(
                $('<div />', {
                    'id': 'pia_minimize_' + index.toString(), 
                    'class': (options.features.minimized ? 'PIAmaximize' : 'PIAminimize') + ' PIAicon'
                })
                .click(function (e) {
                    var id = obj.data('PIA-id');
                    var options = obj.data('PIA-options');
                    if(!options.features.minimized) {
                        //$('#pia_blocked_'+id).click();
                        $('#pia_editable_'+id).hide();
                        $('#pia_minimize_'+index.toString()).removeClass('PIAminimize').addClass('PIAmaximize');
                        options.features.minimized = true;
                        
                        if ($.fn.postitall.globals.features.resizable && options.features.resizable) {
                            //resizable
                            if ($.ui) obj.resizable("disable");
                            //$(this).resizable("disable");
                        }
                        if (options.features.draggable) {
                            //draggable
                            if ($.ui) obj.draggable({ axis: "x" });
                            //obj.draggable("disable");
                            $('#pia_toolbar_'+index.toString()).css('cursor', 'inherit');
                        }
                        var txtContent = " " + $('#pia_editable_'+id).text();
                        if(txtContent.length > 18)
                            txtContent = txtContent.substring(0,15) + "...";
                        var smallText = $('<div id="pia_minimized_text_'+index.toString()+'" class="PIAminimizedText" />').text(txtContent);
                        $('#pia_toolbar_'+index.toString()).append(smallText);
                        //toolbar
                        $('#pia_config_'+index.toString()).hide();
                        $('#pia_fixed_'+index.toString()).hide();
                        $('#pia_delete_'+index.toString()).hide();
                        $('#pia_blocked_'+index.toString()).hide();

                        //animate resize
                        var leftMinimized = $('#idPostIt_'+id).parent().css('left');
                        if(options.postit.oldPosition !== undefined && options.postit.oldPosition.leftMinimized !== undefined) 
                            leftMinimized = options.postit.oldPosition.leftMinimized;
                        var propCss = {
                            'position': $('#idPostIt_'+id).parent().css('position'),
                            'left': $('#idPostIt_'+id).parent().css('left'),
                            'top': $('#idPostIt_'+id).parent().css('top'),
                            'height': $('#idPostIt_'+id).parent().css('height'),
                            'width': $('#idPostIt_'+id).parent().css('width'),
                            'leftMinimized': leftMinimized,
                        };
                        options.postit.oldPosition = propCss;

                        $('#idPostIt_'+id).parent()
                        .css({top:'auto'})
                        .animate({
                            'width': (options.postit.minWidth + 20),
                            'height': '20px',
                            'position': 'fixed',
                            'bottom': '0',
                            'left': options.postit.oldPosition.leftMinimized,
                        }, 500);

                    } else {
                        //$('#pia_blocked_'+id).click();
                        $('#pia_editable_'+id).show();
                        $('#pia_minimize_'+index.toString()).removeClass('PIAmaximize').addClass('PIAminimize');
                        options.features.minimized = false;

                        if ($.fn.postitall.globals.features.resizable && options.features.resizable) {
                            if ($.ui) obj.resizable("enable");
                        }
                        if (options.features.draggable) {
                            if ($.ui) obj.draggable({ axis: "none" });
                            //obj.draggable("enable");
                            $('#pia_toolbar_'+index.toString()).css('cursor', 'move');
                        }
                        //toolbar
                        $('#pia_config_'+index.toString()).show();
                        $('#pia_fixed_'+index.toString()).show();
                        $('#pia_delete_'+index.toString()).show();
                        $('#pia_blocked_'+index.toString()).show();
                        $('#pia_minimized_text_'+index.toString()).remove();

                        //animate resize
                        //Maximitza
                        $('#idPostIt_'+id).parent()
                        .animate({
                            'left': options.postit.oldPosition.left,
                            'width': options.postit.oldPosition.width,
                            'height': options.postit.oldPosition.height,
                            'position': options.postit.oldPosition.position,
                        }, 500, function() {
                            $('#idPostIt_'+id).parent().css({
                                'top': options.postit.oldPosition.top,
                                bottom:'auto',
                            });
                        });
                    }
                    
                    obj.data('PIA-options', options);
                    save($('#idPostIt_' + id).parent());
                    e.preventDefault();
                })
            );

        /*if (options.features.addNew) {
            toolbar.append(
                $('<div />', {
                    'id': 'pia_new_' + index.toString(), 
                    'class': 'PIAnew PIAicon'
                })
                .click(function (e) {
                    var cpOpt = options;
                    cpOpt.postit.id = -1;
                    cpOpt.postit.position = 'absolute';
                    cpOpt.postit.posY = e.pageX;
                    cpOpt.postit.posX = e.pageY;
                    $.newPostItAll('', cpOpt, undefined, function() {
                        //$('.PIApostit').css('z-index', 9995);
                        //$(this).css('z-index', 9999);
                        e.preventDefault();
                    });
                    e.preventDefault();
                })
            );
        }*/

        //Blocked
        toolbar.append(
            $('<div />', {
                'id': 'pia_blocked_' + index.toString(), 
                'class': 'PIAblocked' + (options.features.blocked == true ? '2' : '') + ' PIAicon',
            }).click(function (e) {
                var id = obj.data('PIA-id');
                var options = obj.data('PIA-options');
                if(!options.features.blocked) {
                    $('#pia_blocked_'+index.toString()).removeClass('PIAblocked').addClass('PIAblocked2');
                    $('#pia_editable_'+index.toString()).attr('contenteditable', false);
                    if ($.fn.postitall.globals.features.resizable && options.features.resizable) {
                        //resizable
                        if ($.ui) obj.resizable("disable");
                    }
                    if (options.features.draggable) {
                        //draggable
                        if ($.ui) obj.draggable("disable");
                        $('#pia_toolbar_'+index.toString()).css('cursor', 'inherit');
                    }
                    //toolbar
                    $('#pia_config_'+index.toString()).hide();
                    $('#pia_fixed_'+index.toString()).hide();
                    $('#pia_delete_'+index.toString()).hide();
                    $('#pia_minimize_'+index.toString()).hide();

                    options.features.blocked = true;
                } else {
                    $('#pia_blocked_'+index.toString()).removeClass('PIAblocked2').addClass('PIAblocked');
                    $('#pia_editable_'+index.toString()).attr('contenteditable', true);
                    if ($.fn.postitall.globals.features.resizable && options.features.resizable) {
                        if ($.ui) obj.resizable("enable");
                    }
                    if (options.features.draggable) {
                        if ($.ui) obj.draggable("enable");
                        $('#pia_toolbar_'+index.toString()).css('cursor', 'move');
                    }
                    //toolbar
                    $('#pia_config_'+index.toString()).show();
                    $('#pia_fixed_'+index.toString()).show();
                    $('#pia_delete_'+index.toString()).show();
                    $('#pia_minimize_'+index.toString()).show();
                    options.features.blocked = false;
                }
                obj.data('PIA-options', options);
                save($('#idPostIt_' + id).parent());
                e.preventDefault();
            })
        );

        
        //Front page: content
        var content = $('<div />', {
            'id': 'pia_editable_' + index.toString(),
            'class': 'PIAeditable PIAcontent'
        }).change(function () {
            options.postit.content = $(this).html();
            obj.data('PIA-options', options);
            autoresize(obj);
            if (options.features.savable) {
                storageManager.add(options);
            }
        }).attr('contenteditable', true).html(options.postit.content);
        //Front page
        var front = $('<div />', {
            'class': 'front'
        }).append(toolbar).append(content);
        var d = new Date(options.postit.created);
        //Back page: toolbar
        toolbar = $('<div />', { 'class': 'PIAtoolbar'})
            //Close config icon
            .append($('<div />', {
                'id': 'pia_close_' + index.toString(),
                'class': 'PIAclose PIAicon',
                'style': barCursor
            })
            .click(function (e) {
                //var id = $(this).closest('.PIApostit').children().attr('data-id');
                var id = obj.data('PIA-id');
                $('#idPostIt_' + id + ' > .front').css('visibility', 'visible');
                $('#idPostIt_' + id).parent().removeClass('flip', function () {
                    $('#idPostIt_' + id + ' > .back').css('visibility', 'hidden');
                });
                if($.ui) $('#idPostIt_' + id).parent().resizable("enable");
                e.preventDefault();
            })
        )
        .append($('<span />', {
                'class': 'float-left',
                'style': 'line-height:10px;padding-left: 10px;'
            }).html(d.toLocaleDateString() + " (" + d.toLocaleTimeString() + ")")
        );
        //Back page: content
        //Background color
        var bgLabel = $('<label />', {
            'for': 'minicolors_bg_' + index,
            'style': 'display:block;'
        }).html('Background-color:');
        var bgString = $('<input />', {
            'class': 'minicolors',
            'id': 'minicolors_bg_' + index,
            'type': 'text',
            'width': '75px',
            'value': options.style.backgroundcolor,
            'data-default-value': options.style.backgroundcolor
        });
        //Text color
        var tcLabel = $('<label />', {
            'for': 'minicolors_text_' + index,
            'style': 'display:block;'
        }).html('Text color:');
        var tcString = $('<input />', {
            'class': 'minicolors',
            'id': 'minicolors_text_' + index,
            'type': 'text',
            'width': '75px',
            'value': options.style.textcolor,
            'data-default-value': options.style.textcolor
        });
        //Text shadow
        var checked = '';
        if (options.style.textshadow) {
            checked = 'checked';
        }
        
        var tsString = $('<input />', {
            'id': 'textshadow_' + index,
            'type': 'checkbox',
            'style': 'margin-top: -2px;',
            'checked': checked
        });
        var tsLabel = $('<label />', {
            'for': 'textshadow_' + index,
            'style': 'display:block;'
        }).append(tsString).append(' Text shadow');
        //General style
        var checked2 = '';
        if (options.style.tresd) {
            checked2 = 'checked';
        }
        var gsString = $('<input />', {
            'id': 'generalstyle_' + index,
            'type': 'checkbox',
            'style': 'margin-top: -2px;',
            'checked': checked2
        });
        var gsLabel = $('<label />', {
            'for': 'generalstyle_' + index,
            'style': 'display:block;'
        }).append(gsString).append(' 3D style');

        content = $('<div />', { 'class': 'PIAcontent'})
            .append(bgLabel).append(bgString) // Bg color
            .append(tcLabel).append(tcString) // Text color
            .append(tsLabel)  // Text shadow
            .append(gsLabel);  // 3d or plain style
        //Back page
        var back = $('<div />', {
            'class': 'back',
            'style': 'visibility: hidden;'
        })
        .append(toolbar)
        .append(content);
        //Create postit
        var postit = $('<div />', { 'id': 'idPostIt_' + index.toString(), 'data-id': index })
            .append(front).append(back);
        //Convert relative position to prevent height and width      in html layout
        if (options.postit.position === "relative") {
            options.postit.position = "absolute";
            //Increase top and left to prevent overlaying postits in the same position
            options.postit.posX = obj.offset().top + parseInt(options.postit.posX, 10);
            options.postit.posX += "px";
            options.postit.posY = obj.offset().left + parseInt(options.postit.posY, 10);
            options.postit.posY += "px";
        }
        //Modify final Postit Object
        obj.removeClass()
            .addClass('block PIApostit ' + (options.style.tresd ? ' panel ' : ' plainpanel ') 
                + (options.postit.position == "fixed" ? ' fixed ' : ''))
            .css('position', options.postit.position)
            .css('left', options.postit.posY)
            .css('top', options.postit.posX)
            .css('width', options.postit.width + 'px')
            .css('height', (options.postit.height) + 'px') //Increase 30 pixels for the toolbar
            .css('background-color', options.style.backgroundcolor)
            .css('color', options.style.textcolor);
        if (options.style.textshadow) {
            obj.css('text-shadow', '1px 1px 0px white');
            obj.css('-moz-text-shadow', '1px 1px 0px white');
        } else {
            obj.css('text-shadow', '0px 0px 0px');
            obj.css('-moz-text-shadow', '0px 0px 0px');
        }
        obj.html(postit)
            .on('focus', '[contenteditable]', function () {
                var objeto = $(this);
                objeto.data('before', objeto.html());
                return objeto;
            }).on('blur keyup paste', '[contenteditable]', function () {
                var objeto = $(this);
                if (objeto.data('before') !== objeto.html()) {
                    objeto.data('before', objeto.html());
                    objeto.trigger('change');
                }
                return objeto;
            }).click(function () {
                $('.PIApostit').css('z-index', 9995);
                $(this).css('z-index', 9999);
            }).load(function () {
                //Autoresize to fit content when content load is done
                autoresize($(this));
            });
        if ($.ui) {
            if (options.features.draggable) {
                obj.draggable({
                    handle: ".PIAtoolbar",
                    scroll: false,
                    start: function () {
                        //Remove draggable postit option
                        $('.PIApostit').css('z-index', 9995);
                        $(this).css('z-index', 9999);
                        $(this).draggable('disable');
                    },
                    stop: function () {
                        //Enable draggable postit option
                        $(this).draggable('enable');
                        autoresize($(this));
                        if (options.features.savable) {
                            if(!options.features.minimized) {
                                options.postit.posX = obj.css('top');
                                options.postit.posY = obj.css('left');
                                options.postit.oldPosition.leftMinimized = undefined;
                            } else {
                                options.postit.oldPosition.leftMinimized = obj.css('left');
                            }
                            storageManager.add(options);
                            //storageManager.add(obj.data('PIA-options'));
                        }
                    }
                });
            }
            if ($.fn.postitall.globals.features.resizable && options.features.resizable) {
                var pos = false;
                obj.resizable({
                    animate: true,
                    helper: 'ui-resizable-helper',
                    minHeight: options.postit.minHeight,
                    minWidth: options.postit.minWidth,
                    stop: function () {
                        setTimeout(function() { 
                            autoresize(obj);
                            if (options.features.savable) {
                                options.postit.posX = obj.css('top');
                                options.postit.posY = obj.css('left');
                                storageManager.add(options);
                            }
                        },1000);
                    }
                });
            }
        }
        if(!options.style.tresd) {
            $('#generalstyle_' + options.postit.id).click();
        }
        if(!options.style.textshadow) {
            $('#textshadow_' + options.postit.id).click();
        }
        //Postit minimized?
        if(options.features.minimized) {
            options.features.minimized = false;
            $('#pia_minimize_' + options.postit.id).click();
        }
        //Postit bloqued?
        if(options.features.blocked) {
            options.features.blocked = false;
            $('#pia_blocked_' + options.postit.id).click();   
        }
        //Show postit
        obj.slideDown('slow', function () {
            //Rest of actions
            //Config: text shadow
            $('#textshadow_' + index).click(function () {
                if ($(this).is(':checked')) {
                    $(this).closest('.PIApostit').find('.PIAcontent').css('text-shadow', '1px 1px 0 white');
                    options.style.textshadow = true;
                } else {
                    $(this).closest('.PIApostit').find('.PIAcontent').css('text-shadow', '0px 0px 0');
                    options.style.textshadow = false;
                }
                setOptions(options, true);
            });
            //3d or plain
            $('#generalstyle_' + index).click(function () {
                if ($(this).is(':checked')) {
                    $('#idPostIt_' + index).parent().removeClass('plainpanel').addClass('panel');
                    options.style.tresd = true;
                } else {
                    $('#idPostIt_' + index).parent().removeClass('panel').addClass('plainpanel');
                    options.style.tresd = false;
                }
                setOptions(options, true);
            });
            //Background and text color
            if ($.minicolors) {
                //Config: change background-color
                $('#minicolors_bg_' + index).minicolors({
                    change: function (hex) {
                        $(this).closest('.PIApostit').css('background-color', hex);
                        options.style.backgroundcolor = hex;
                        setOptions(options, true);
                    }
                });
                //Config: text color
                $('#minicolors_text_' + index).minicolors({
                    change: function (hex) {
                        $(this).closest('.PIApostit').css('color', hex);
                        options.style.textcolor = hex;
                        setOptions(options, true);
                    }
                });
            } else {
                $('#minicolors_bg_' + index).change(function () {
                    $(this).closest('.PIApostit').css('background-color', $(this).val());
                    options.style.backgroundcolor = $(this).val();
                    setOptions(options, true);
                });
                $('#minicolors_text_' + index).change(function () {
                    $(this).closest('.PIApostit').css('color', $(this).val());
                    options.style.textcolor = $(this).val();
                    setOptions(options, true);
                });
            }
            //autoresize($('#idPostIt_' + index).parent());
        });
        //Save in localstorage
        if (options.features.savable) {
            storageManager.add(options);
        }
        //Stop key propagation on contenteditable
        $("#pia_editable_" + index).keydown(function (e) {
            e.stopPropagation();
        });
        //chaining
        return obj;
    }

    // Initialize elements
    function init(obj, opt) {
        //Default options
        options = $.extend({}, $.fn.postitall.defaults);
        //Set options
        if (typeof opt !== 'object') {
            opt = {};
        }
        setOptions(opt);
        // Do nothing if already initialized
        if (obj.data('PIA-initialized')) {
            return;
        }
        //Modify page content
        opt = $.extend(options, opt);
        return create(obj, opt.postit.id, opt);
    }

    function getRandomColor() {
        if($.fn.postitall.defaults.style.randomColor) {
            //Random color
            //var colors = ["red", "blue", "yellow", "black", "green"];
            //return colors[Math.floor(Math.random() * colors.length)];
            return '#'+(Math.random()*0xFFFFFF<<0).toString(16);
        } else {
            //Default postit color
            return $.fn.postitall.defaults.style.backgroundcolor;
        }
    }

    function getTextColor(hexcolor) {
        if($.fn.postitall.defaults.style.randomColor) {
            //Inverse of background (hexcolor)
            var nThreshold = 105;
            var components = getRGBComponents(hexcolor);
            var bgDelta = (components.R * 0.299) + (components.G * 0.587) + (components.B * 0.114);
            return ((255 - bgDelta) < nThreshold) ? "#111111" : "#eeeeee"; 
        } else {
            //Default postit text color
            return $.fn.postitall.defaults.style.textcolor;
        }
    }

    function getRGBComponents(color) {
        var r = color.substring(1, 3);
        var g = color.substring(3, 5);
        var b = color.substring(5, 7);
        return {
           R: parseInt(r, 16),
           G: parseInt(g, 16),
           B: parseInt(b, 16)
        };
    }

    function reorderIndex() {
        storageManager.getlength(function(len) {
            var key = "";
            var testlen = 0;
            for (var i = 0; i < len; i++) {
                storageManager.key(i, function(key) {
                    if (key.slice(0,7) === "PostIt_") {
                        key = key.slice(7,key.length)
                        storageManager.get(key, function(content) {
                            testlen++;
                            content.postit.id = testlen.toString();
                            storageManager.add(content, function() {
                                storageManager.remove(key);
                            });
                        })
                        
                    }
                });
            }
        });
    }

    function guid() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    }

    // PLUGIN Public methods
    $.extend($.fn, {
        postitall: function (method, data) {
            //Debugging
            var debugging = true; // or true
            if (typeof console === "undefined") {
                console = {
                    log: function () { return undefined; }
                };
            } else if (!debugging || console.log === undefined) {
                console.log = function () { return undefined; };
            }
            switch (method) {
                // Destroy the control
                case 'destroy':
                    $(this).each(function () {
                        destroy($(this));
                    });
                    return $(this);
                // Get/set options on the fly
                case 'options':
                    if (data === undefined) {
                        return $(this).data('PIA-options');
                    }
                    // Setter
                    $(this).each(function () {
                        options = $(this).data('PIA-options') || {};
                        destroy($(this));
                        $(this).postitall($.extend(true, options, data));
                    });
                    return $(this);
                // hide
                case 'hide':
                    $(this).each(function () {
                        hide($(this));
                    });
                    return $(this);
                // Save object
                case 'save':
                    $(this).each(function () {
                        save($(this));
                    });
                    return $(this);
                // Initializes the control
                default:
                //case 'create' :
                    if (method !== 'create') {
                        data = method;
                    }
                    var datacp = {};
                    $(this).each(function () {
                        datacp = data;
                        $.newPostItAll(datacp, $(this));
                    });
                    return $(this);
            }
        }
    });

    //Global vars
    $.fn.postitall.globals = {
        storage : {
            type            : 'local',
            manager         : 'plugin/jquery.postitall.localManager.js',
        },        
        style : {
            tresd           : true,         //General style in 3d format
            randomColor     : true,         //Random color in new postits
            backgroundcolor : '#FFFC7F',    //Background color in new postits when randomColor = false
            textcolor       : '#333333',    //Text color
            textshadow      : true,         //Shadow in the text
        },
        features : {
            autoheight      : true,         //Set autoheight feature on or off
            draggable       : true,         //Set draggable feature on or off
            resizable       : true,         //Set resizable feature on or off
            removable       : true,         //Set removable feature on or off
            changeoptions   : true,         //Set options feature on or off
            savable         : false,        //Save postit in storage
            blocked         : false,        //Postit can not be modified
            minimized       : false,        //true = minimized, false = maximixed
            addNew          : false,        //Create a new postit
        },
        postit : {
            id              : 0,                            //Id
            created         : Date.now(),                   //Creation date
            domain          : window.location.origin,       //Domain in the url
            page            : window.location.pathname,     //Page in the url
            content         : '',                           //Content
            position        : 'absolute',                   //Position absolute or relative
            posX            : '10px',                       //top position
            posY            : '10px',                       //left position
            minHeight       : 160,                          //resizable min-width
            minWidth        : 125,                          //resizable min-height
            height          : 160,                          //height
            width           : 125,                          //width
            oldPosition     : {},                           //Position when maximized
        },
        // Callbacks / Event Handlers
        onChange: function () { return undefined; },
        onSelect: function () { return undefined; },
        onDblClick: function () { return undefined; },
        onRelease: function () { return undefined; }
    };

    // Default Plugin Vars
    $.fn.postitall.defaults = $.extend({}, $.fn.postitall.globals);
    $.fn.postitall.defaults.storage = undefined;

    //Create a new postit
    $.newPostItAll = function(content, opt, obj, callback) {
        if(content === undefined) {
            content = "";
        } else if (typeof content === 'object') {
            callback = obj;
            obj = opt;
            opt = content;
            content = "";
        }
        if(obj === undefined) {
            obj = $('<div />', {
                text: (content !== undefined ? content : '')
            });
            $('body').append(obj);
        }
        if(opt === undefined) {
            opt = $.extend(true, {}, $.fn.postitall.defaults);
        } else {
            opt = $.extend(true, {}, $.fn.postitall.defaults, opt);
        }
        
        //Check if we have the id
        var options = opt;
        if(options.postit.id > 0) {
            //Random bg & textcolor
            if($.fn.postitall.defaults.style.randomColor && options.style.randomColor) {
                options.style.backgroundcolor = getRandomColor();
                options.style.textcolor = getTextColor(options.style.backgroundcolor);
                options.style.randomColor = false;
            }
            //Create div
            var PIAcontent = $('<div />', { 'id' : 'newPostIt_' + options.postit.id });
            obj.append(PIAcontent);
            //Initialize
            init(obj, options);
            if(callback !== undefined) callback();
        } else {
            //Get new id
            getIndex(function(index) {
                //Random bg & textcolor
                if($.fn.postitall.defaults.style.randomColor && options.style.randomColor) {
                    options.style.backgroundcolor = getRandomColor();
                    options.style.textcolor = getTextColor(options.style.backgroundcolor);
                    options.style.randomColor = false;
                }
                options.postit.id = index;
                //Create div
                var PIAcontent = $('<div />', { 'id' : 'newPostIt_' + index });
                obj.append(PIAcontent);
                //Initialize
                init(obj, options);
                if(callback !== undefined) callback();
            });
        }
    };

    $.testPIA = function() {
        reorderIndex();
    };

    //Load Local Storage Postits
    $.loadPostItAll = function (scrollToElement) {
        
        if (scrollToElement === undefined) {
            scrollToElement = false;
        }

        storageManager.getlength(function(len) {
            var key = "";
            var testlen = 0;
            for (var i = 0; i < len; i++) {
                storageManager.key(i, function(key) {
                    //console.log('key', key);    
                    if (key.slice(0,7) === "PostIt_") {
                        key = key.slice(7,key.length)
                        storageManager.get(key, function(o) {
                            $.newPostItAll(o);
                        })
                        
                    }
                });
            }
        });
    };
    //Save Local Storage Postits
    $.savePostItAll = function () {
        //console.log("Save Postits to Local Storage");
        $('.PIApostit').each(function () {
            options = $(this).data('PIA-options');
            if(options.features.savable) {
                $(this).postitall('save');
            }
        });
    };
    //Hide
    $.hidePostItAll = function () {
        //console.log("Hide Postits");
        $('.PIApostit').each(function () {
            $(this).postitall('hide');
        });
    }
    //Get number of postits
    $.lengthPostItAll = function(callback) {
        var total = 0;
        var len = -1;
        /*storageManager.getlength(function(len) {
            if (len >= 0) {
                var i, o;
                for (i = 0; i < len; i += 1) {
                    (function(i) {
                        storageManager.get(i, function(o) {
                            console.log('o',i,o);
                            if (o && o.postit.id !== undefined) {
                                if (o.postit.domain === window.location.origin) {
                                    total++;
                                    console.log('trobat',o);
                                }
                            }
                            if(i == (len - 1) && callback != null) callback(total);
                        });
                    })(i);
                }
            }
        });*/
        storageManager.getlength(function(len) {
            var key = "";
            var testlen = 0;
            for (var i = 0; i < len; i++) {
                storageManager.key(i, function(key) {
                    //console.log('key', key);    
                    if (key.slice(0,7) === "PostIt_") {
                        key = key.slice(7,key.length)
                        storageManager.get(key, function(o) {
                            console.log('o',o.postit.domain, window.location.origin);
                            if (o.postit.domain === window.location.origin) {
                                total++;
                            }
                        });
                    }
                    if(i == (len - 1) && callback != null) callback(total);
                });
            }
        });
    }
    //Remove all postits
    $.removePostItAll = function () {
        //Remove all postits
        $('.PIApostit').each(function () {
            $(this).postitall('destroy');
        });
        
        storageManager.clear(function() {
            console.log("Remove loaded Postits");
        });

        //Remove all storage
        /*storageManager.getlength(function(len) {
            var key = "";
            var testlen = 0;
            for (var i = 0; i < len; i++) {
                storageManager.key(i, function(key) {
                    console.log(i,key);
                    if (key.slice(0,7) === "PostIt_") {
                        //key = key.slice(7,key.length);
                        storageManager.remove(key, function(o) {
                            console.log(key + ' removed');
                        });
                    }
                });
            }
        });*/
    };

    //Drag postits
    //used if jQuery UI is not loaded
    $.fn.drags = function (opt) {

        opt = $.extend({handle: "", cursor: "move"}, opt);

        var $el = this;
        if (opt.handle !== "") {
            $el = this.find(opt.handle);
        }

        return $el.css('cursor', opt.cursor).on("mousedown", function (e) {
            var $drag;
            if (opt.handle === "") {
                $drag = $(this).parent().parent().parent().addClass('draggable');
            } else {
                $drag = $(this).parent().parent().parent().addClass('active-handle').parent().addClass('draggable');
            }
            var z_idx = $drag.css('z-index'),
                drg_h = $drag.outerHeight(),
                drg_w = $drag.outerWidth(),
                pos_y = $drag.offset().top + drg_h - e.pageY,
                pos_x = $drag.offset().left + drg_w - e.pageX;
            $drag.css('z-index', 10000).parents().on("mousemove", function (e) {
                $('.draggable').offset({
                    top: e.pageY + pos_y - drg_h,
                    left: e.pageX + pos_x - drg_w
                }).on("mouseup", function () {
                    $(this).removeClass('draggable').css('z-index', z_idx);
                });
            });
            e.preventDefault(); // disable selection
        }).on("mouseup", function () {
            if (opt.handle === "") {
                $(this).removeClass('draggable');
            } else {
                $(this).removeClass('active-handle').parent().removeClass('draggable');
            }
        });

    };

}(jQuery, window.localStorage));