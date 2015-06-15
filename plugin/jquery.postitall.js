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
    //var console;

    $(window).mousemove(function(e){
        //console.log(e);
          window.mouseXPos = e.pageX;
          window.mouseYPos = e.pageY;
       }); 


    // Manage localStorage
    var storageManager = {
        add: function (obj, callback) { 
            $storage.add(obj, function() {
                if(callback != null) callback();
            }); 
        },
        get: function (id, callback) { 
            $storage.get(id, function(varvalue) {
                if(callback != null) callback(varvalue);
            }); 
        },
        nextId: function (callback) { 
            storageManager.getlength(function(length) {
                length++;
                callback(parseInt(length, 10));
            });
        },
        remove: function (id, callback) { 
            $storage.remove(id, function(varvalue) {
                if(callback != null) callback();
            });
        },
        clear: function (callback) { 
            $storage.clear(id, function(varvalue) {
                if(callback != null) callback();
            });
        },
        getlength: function (callback) { 
            $storage.getlength(function(length) {
                if(callback != null) callback(length);
            });
        },
        key: function (i, callback) {
            $storage.key(i, function(name) {
                if(callback != null) callback(name);
            });
        }
    };

    var localManager = {
        add: function (obj, callback) { 
            var varname = 'PostIt_' + parseInt(obj.id, 10);
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

    //Manage chrome storage
    var chromeManager = {
        add: function(obj, callback) {
            var varname = 'PostIt_' + parseInt(obj.id, 10);
            var testPrefs = JSON.stringify(obj);
            var jsonfile = {};
            jsonfile[varname] = testPrefs;
            chrome.storage.sync.set(jsonfile, function () {
                console.log('Saved', varname, testPrefs);
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
                console.log('Loaded', varname, varvalue);
                if(callback != null) callback(varvalue);
            });
        },
        remove: function(varname, callback) {
            chrome.storage.sync.remove(varname, function() {
                console.log('Removed',varname);
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
                console.log('Chrome storage length ' + total);
                if(callback != null) callback(total);
            });
        }
    };


    var $storage = localManager;


    //Save object
    function save(obj) {
        var options = obj.data('PIA-options');
        console.log('idd',obj.data('PIA-id'), options);
        storageManager.add(options);
    }

    //Destroy object
    function destroy(obj) {
        var id = obj.data('PIA-id');
        options = obj.data('PIA-options');
        //Remove from localstorage
        if (options.savable) {
            storageManager.remove(id);
        }
        //Destroy object
        obj
            .removeData('PIA-id')
            .removeData('PIA-initialized')
            .removeData('PIA-settings')
            .slideUp("slow", function () {
                $(this).remove();
            });
    }

    //Autoresize postit
    function autoresize(obj) {

        var id = obj.data('PIA-id');
        options = obj.data('PIA-options');
        
        if(options.minimized)
            return;

        if (options.autoheight) {
            var contentHeight = $('#idPostIt_' + id).find('.PIAeditable').height();

            var posY = $('#idPostIt_' + id).parent().css('left'),
                posX = $('#idPostIt_' + id).parent().css('top'),
                divWidth = $('#idPostIt_' + id).width(),
                //divHeight = $('#idPostIt_' + id).find('.PIAeditable').height(),
                divHeight = $('#idPostIt_' + id).parent().css('height'),
                minDivHeight = options.minHeight;

                divHeight = parseInt(divHeight,10);
                contentHeight = parseInt(contentHeight,10);

                if(contentHeight > divHeight - 25) {
                    divHeight = contentHeight + 25;
                }

            //if (divHeight >= minDivHeight) {
                //divHeight += 50;
                options.height = divHeight;
                obj.css('height', divHeight);
                if ($.ui) {
                    if (options.resizable) {
                        var newMinHeight = parseInt(options.minHeight,10);
                        if((contentHeight + 25) > newMinHeight)
                            newMinHeight = contentHeight + 25;

                        obj.resizable({
                            minHeight: newMinHeight
                        });
                    }
                }
            /*} else if (divHeight < minDivHeight) {
                options.height = minDivHeight;
                //minDivHeight += 50;
                obj.css('height', minDivHeight);
            }*/
            /*if(options.position != "fixed") {
                options.posY = posY;
                options.posX = posX;
            }*/
            options.width = divWidth;
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
            if(!paso && i >= items) callback(i);
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
        if (save && options.savable) {
            storageManager.add(options);
        }
    }

    //Create a postit
    function create(obj, index, options) {

        obj.data('PIA-id', index)
            .data('PIA-initialized', true)
            .data('PIA-options', options);
        //Postit editable content
        if (options.description === "") {
            if (obj.html() !== "") {
                options.description = obj.html();
            }
        }
        //Front page: toolbar
        var barCursor = "cursor: inherit;";
        if (options.draggable) {
            barCursor = "cursor: move;";
        }
        var toolbar = $('<div />', {
            'id': 'pia_toolbar_' + index.toString(),
            'class': 'PIAtoolbar',
            'style': barCursor
        });
        //Drag support without jQuery UI
        if (!$.ui) {
            if (options.draggable) {
                toolbar.drags();
            }
        }
        //Config icon
        if (options.changeoptions) {
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
                    //$(this).parent().parent().parent().parent().addClass('flip');
                    e.preventDefault();
                })
            );
        }
        //Save icon
        /*if (options.savable) {
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
                'class': 'PIAfixed' + (options.position == "fixed" ? '2' : '') + ' PIAicon'
            }).click(function (e) {
                var id = obj.data('PIA-id');
                var options = obj.data('PIA-options');
                var posY = $('#idPostIt_' + id).parent().css('left'),
                    posX = $('#idPostIt_' + id).parent().css('top'),
                    divWidth = $('#idPostIt_' + id).width(),
                    divHeight = $('#idPostIt_' + id).find('.PIAeditable').height(),
                    minDivHeight = options.minHeight;
                if(options.position == "fixed") {
                    $('#pia_fixed_'+index.toString()).removeClass('PIAfixed2').addClass('PIAfixed');
                    options.position = "absolute";
                    options.posX = $('#idPostIt_' + id).parent().offset().top;
                    obj.removeClass("fixed");
                } else {
                    $('#pia_fixed_'+index.toString()).removeClass('PIAfixed').addClass('PIAfixed2');
                    options.position = "fixed";
                    options.posX = $('#idPostIt_' + id).parent().offset().top - $(document).scrollTop();
                    obj.addClass("fixed");
                }
                options.posY = $('#idPostIt_' + id).parent().offset().left;
                obj.css('position', options.position);
                obj.css('left', options.posY);
                obj.css('top', options.posX);

                obj.data('PIA-options', options);
                save($('#idPostIt_' + id).parent());
                e.preventDefault();
            })
        );

        toolbar.append(
                $('<div />', {
                    'id': 'pia_minimize_' + index.toString(), 
                    'class': (options.minimized ? 'PIAmaximize' : 'PIAminimize') + ' PIAicon'
                })
                .click(function (e) {
                    console.log('click');
                    var id = obj.data('PIA-id');
                    var options = obj.data('PIA-options');
                    if(!options.minimized) {
                        //$('#pia_blocked_'+id).click();
                        $('#pia_editable_'+id).hide();
                        $('#pia_minimize_'+index.toString()).removeClass('PIAminimize').addClass('PIAmaximize');
                        options.minimized = true;
                        options.originalHeight = $('#idPostIt_'+id).parent().css('height');
                        //animate resize
                        $('#idPostIt_'+id).parent().animate({
                            height: "20px"
                        }, 500);
                    } else {
                        //$('#pia_blocked_'+id).click();
                        $('#pia_editable_'+id).show();
                        $('#pia_minimize_'+index.toString()).removeClass('PIAmaximize').addClass('PIAminimize');
                        options.minimized = false;
                        //animate resize
                        $('#idPostIt_'+id).parent().animate({
                            height: options.originalHeight
                        }, 500);
                    }
                    
                    obj.data('PIA-options', options);
                    save($('#idPostIt_' + id).parent());
                    e.preventDefault();
                })
            );

        /*if (options.addNew) {
            toolbar.append(
                $('<div />', {
                    'id': 'pia_new_' + index.toString(), 
                    'class': 'PIAnew PIAicon'
                })
                .click(function (e) {
                    var cpOpt = options;
                    cpOpt.id = -1;
                    cpOpt.position = 'absolute';
                    cpOpt.posY = e.pageX;
                    cpOpt.posX = e.pageY;
                    $.newPostItAll('', cpOpt, undefined, function() {
                        console.log('aki');
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
                'class': 'PIAblocked' + (options.blocked == true ? '2' : '') + ' PIAicon',
            }).click(function (e) {
                var id = obj.data('PIA-id');
                var options = obj.data('PIA-options');
                if(!options.blocked) {
                    $('#pia_blocked_'+index.toString()).removeClass('PIAblocked').addClass('PIAblocked2');
                    $('#pia_editable_'+index.toString()).attr('contenteditable', false);
                    //resizable
                    obj.resizable("disable");
                    //draggable
                    obj.draggable("disable");
                    $('#pia_toolbar_'+index.toString()).css('cursor', 'inherit');
                    //toolbar
                    $('#pia_config_'+index.toString()).hide();
                    $('#pia_fixed_'+index.toString()).hide();
                    $('#pia_delete_'+index.toString()).hide();

                    options.blocked = true;
                } else {
                    $('#pia_blocked_'+index.toString()).removeClass('PIAblocked2').addClass('PIAblocked');
                    $('#pia_editable_'+index.toString()).attr('contenteditable', true);
                    obj.resizable("enable");
                    obj.draggable("enable");
                    $('#pia_toolbar_'+index.toString()).css('cursor', 'move');
                    //toolbar
                    $('#pia_config_'+index.toString()).show();
                    $('#pia_fixed_'+index.toString()).show();
                    $('#pia_delete_'+index.toString()).show();
                    options.blocked = false;
                }
                obj.data('PIA-options', options);
                save($('#idPostIt_' + id).parent());
                e.preventDefault();
            })
        );

        //Delete icon
        if (options.removable) {
            toolbar.append($('<div />', { 'id': 'pia_delete_' + index.toString(), 'class': 'PIAdelete PIAicon'})
                .click(function (e) {
                    if ($(this).parent().find('.ui-widget2').length <= 0) {
                        var cont = '<div class="ui-widget2" id="pia_confirmdel_' + index + '">' +
                            '<div class="PIAwarning">' +
                            '<span class="PIAdelwar float-left"></span>Do you want to delete this note?' +
                            '<div class="PIAconfirmOpt"><a id="sure_delete_' + index + '" href="#"><span class="PIAdelyes PIAicon"> Yes</span></a></div>' +
                            '<div class="PIAconfirmOpt"><a id="cancel_' + index + '" href="#"><span class="PIAdelno PIAicon"> Cancel</span></a></div>' +
                            '</div>' +
                            '</div>';
                        $(this).parent().parent().append(cont);
                        $('#pia_confirmdel_' + index).css('height', options.minHeight - 25);
                        $('#pia_editable_' + index).hide();
                        $('#sure_delete_' + index).click(function (e) {
                            //var id = $(this).closest('.PIApostit').children().attr('data-id');
                            var id = obj.data('PIA-id');
                            destroy($('#idPostIt_' + id).parent());
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
        //Front page: content
        var content = $('<div />', {
            'id': 'pia_editable_' + index.toString(),
            'class': 'PIAeditable PIAcontent'
        }).change(function () {
            options.description = $(this).html();
            obj.data('PIA-options', options);
            autoresize(obj);
            if (options.savable) {
                storageManager.add(options);
            }
        }).attr('contenteditable', true).html(options.description);
        //Front page
        var front = $('<div />', {
            'class': 'front'
        }).append(toolbar).append(content);
        var d = new Date(options.created);
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
                e.preventDefault();
            })
        )
        .append($('<span />', {
                'class': 'float-left',
                'style': 'line-height:10px;'
            }).html(d.toLocaleDateString() + "<br>" + d.toLocaleTimeString())
        );
        //Back page: content
        var bgLabel = $('<label />', {
            'for': 'minicolors_bg_' + index,
            'style': 'display:block;'
        }).html('Background-color:');
        var bgString = $('<input />', {
            'class': 'minicolors',
            'id': 'minicolors_bg_' + index,
            'type': 'text',
            'width': '75px',
            'value': options.backgroundcolor,
            'data-default-value': options.backgroundcolor
        });
        var tcLabel = $('<label />', {
            'for': 'minicolors_text_' + index,
            'style': 'display:block;'
        }).html('Text color:');
        var tcString = $('<input />', {
            'class': 'minicolors',
            'id': 'minicolors_text_' + index,
            'type': 'text',
            'width': '75px',
            'value': options.textcolor,
            'data-default-value': options.textcolor
        });
        var checked = '';
        if (options.textshadow) {
            checked = 'checked';
        }
        var tsString = $('<input />', {
            'id': 'textshadow_' + index,
            'type': 'checkbox',
            'checked': checked
        });
        var tsLabel = $('<label />', {
            'for': 'textshadow_' + index,
            'style': 'display:block;'
        }).append(tsString).append(' Text shadow');
        content = $('<div />', { 'class': 'PIAcontent'})
            .append(bgLabel).append(bgString) // Bg color
            .append(tcLabel).append(tcString) // Text color
            .append(tsLabel); // Text shadow
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
        if (options.position === "relative") {
            options.position = "absolute";
            //Increase top and left to prevent overlaying postits in the same position
            options.posX = obj.offset().top + parseInt(options.posX, 10);
            options.posX += "px";
            options.posY = obj.offset().left + parseInt(options.posY, 10);
            options.posY += "px";
        }
        //Modify final Postit Object
        obj.removeClass()
            .addClass('block panel PIApostit ' + (options.position == "fixed" ? 'fixed' : ''))
            .css('position', options.position)
            .css('left', options.posY)
            .css('top', options.posX)
            .css('width', options.width + 'px')
            .css('height', (options.height) + 'px') //Increase 30 pixels for the toolbar
            .css('background-color', options.backgroundcolor)
            .css('color', options.textcolor);
        if (options.textshadow) {
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
            if (options.draggable) {
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
                        if (options.savable) {
                            //console.log('aki', options, obj.data('PIA-options'));
                            options.posX = $(this).css('top');
                            options.posY = $(this).css('left');
                            storageManager.add(options);
                            //storageManager.add(obj.data('PIA-options'));
                        }
                    }
                });
            }
            if (options.resizable) {
                var pos = false;
                obj.resizable({
                    animate: true,
                    helper: 'ui-resizable-helper',
                    minHeight: options.minHeight,
                    minWidth: options.minWidth,
                    stop: function () {
                        setTimeout(function() { 
                            autoresize(obj);
                            if (options.savable) {
                                options.posX = $(this).css('top');
                                options.posY = $(this).css('left');
                                storageManager.add(options);
                            }
                        },1000);
                    }
                });
            }
        }
        //Postit minimized?
        if(options.minimized) {
            options.minimized = false;
            $('#pia_minimize_' + options.id).click();
        }
        //Show postit
        obj.slideDown('slow', function () {
            //Rest of actions
            //Config: text shadow
            $('#textshadow_' + index).click(function () {
                if ($(this).is(':checked')) {
                    $(this).closest('.PIApostit').find('.PIAcontent').css('text-shadow', '1px 1px 0 white');
                    options.textshadow = true;
                } else {
                    $(this).closest('.PIApostit').find('.PIAcontent').css('text-shadow', '0px 0px 0');
                    options.textshadow = false;
                }
                setOptions(options, true);
            });
            //Background and text color
            if ($.minicolors) {
                //Config: change background-color
                $('#minicolors_bg_' + index).minicolors({
                    change: function (hex) {
                        $(this).closest('.PIApostit').css('background-color', hex);
                        options.backgroundcolor = hex;
                        setOptions(options, true);
                    }
                });
                //Config: text color
                $('#minicolors_text_' + index).minicolors({
                    change: function (hex) {
                        $(this).closest('.PIApostit').css('color', hex);
                        options.textcolor = hex;
                        setOptions(options, true);
                    }
                });
            } else {
                $('#minicolors_bg_' + index).change(function () {
                    $(this).closest('.PIApostit').css('background-color', $(this).val());
                    options.backgroundcolor = $(this).val();
                    setOptions(options, true);
                });
                $('#minicolors_text_' + index).change(function () {
                    $(this).closest('.PIApostit').css('color', $(this).val());
                    options.textcolor = $(this).val();
                    setOptions(options, true);
                });
            }
            //autoresize($('#idPostIt_' + index).parent());
        });
        //Save in localstorage
        if (options.savable) {
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
        //opt = $.extend($.fn.postitall.defaults, opt);
        //Set options
        if (typeof opt !== 'object') {
            opt = {};
        }
        setOptions(opt);
        //Check if we shold create a new postit
        //if (options.newPostit) {
        //    return $.newPostItAllOptions(obj, options);
            //$.newPostItAllOptions(obj, opt);
        //}
        // Do nothing if already initialized
        if (obj.data('PIA-initialized')) {
            return;
        }
        //Modify page content
        opt = $.extend(options, opt);
        if(opt.id > 0) {
            return create(obj, opt.id, opt);
        } else {
            //Increase index
            //getIndex(function(index) {
                //opt.id = index;
                //console.log('create2', obj, index, opt);
                //options.id = index;
                //return create(obj, index, options);
                return create(obj, opt.id, opt);
            //});
        }
    }

    function getRandomColor() {
        //var colors = ["red", "blue", "yellow", "black", "green"];
        //return colors[Math.floor(Math.random() * colors.length)];
        return '#'+(Math.random()*0xFFFFFF<<0).toString(16);
    }

    function reorderIndex() {
        storageManager.getlength(function(len) {
            console.log('len',len);
            var key = "";
            var testlen = 0;
            for (var i = 0; i < len; i++) {
                storageManager.key(i, function(key) {
                    if (key.slice(0,7) === "PostIt_") {
                        key = key.slice(7,key.length)
                        storageManager.get(key, function(content) {
                            testlen++;
                            content.id = testlen.toString();
                            console.log('content',content);
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
                    console.log('col1:'+datacp.backgroundcolor);
                    $.newPostItAll('', datacp, $(this));
                });
                return $(this);
            }
        }
    });

    // Default Plugin Vars
    $.fn.postitall.defaults = {
        // Basic Settings
        id              : 0, //Id
        addNew          : false,
        created         : Date.now(),
        domain          : window.location.origin, //Domain in the url
        page            : window.location.pathname, //Page in the url
        backgroundcolor : '#FFFC7F', //Background color
        textcolor       : '#333333', //Text color
        textshadow      : true, //Shadow in the text
        position        : 'fixed', //Position absolute or relative
        posX            : '5px', //top position
        posY            : '5px', //left position
        height          : 160, //height
        width           : 120, //width
        minHeight       : 160, //resizable min-width
        minWidth        : 125, //resizable min-height
        description     : '', //content
        newPostit       : false, //Create a new postit
        autoheight      : true, //Set autoheight feature on or off
        draggable       : true, //Set draggable feature on or off
        resizable       : true, //Set resizable feature on or off
        removable       : true, //Set removable feature on or off
        changeoptions   : true, //Set options feature on or off
        savable         : false, //Save postit in local storage
        blocked         : false, //Postit can not be modified
        minimized       : false,
        // Callbacks / Event Handlers
        onChange: function () { return undefined; },
        onSelect: function () { return undefined; },
        onDblClick: function () { return undefined; },
        onRelease: function () { return undefined; }
    };

    //Create a new postit
    $.newPostItAllOptions = function(obj, options, callback) {
        if(options.id > 0) {
            options.newPostit = false;
            var PIAcontent = $('<div />', { 'id' : 'newPostIt_' + options.id });
            obj.append(PIAcontent);
            init(obj, options);
            console.log('newPostItAll1');
            if(callback !== undefined) callback();
        } else {
            getIndex(function(index) {
                options.id = index;
                options.newPostit = false;
                var PIAcontent = $('<div />', { 'id' : 'newPostIt_' + index });
                obj.append(PIAcontent);
                init(obj, options);
                if(callback !== undefined) callback();
            });
        }
    };

    $.newPostItAll = function(content, opt, obj, callback) {
        if(obj === undefined) {
            obj = $('<div />', {
                text: (content !== undefined ? content : '')
            });
            $('body').append(obj);
        }
        if(opt === undefined) {
            opt = $.extend({}, $.fn.postitall.defaults);
            opt.backgroundcolor = getRandomColor();
        }
        if(opt.backgroundcolor === undefined)
            opt.backgroundcolor = getRandomColor();
        $.newPostItAllOptions(obj, opt, callback);
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
                    if (key.slice(0,7) === "PostIt_") {
                        key = key.slice(7,key.length)
                        storageManager.get(key, function(o) {
                            $.newPostItAll('', o);
                        })
                        
                    }
                });
            }
        });

        /*storageManager.getlength(function(len) {
            if (len > 0) {
                var scrollTo = "", i = 0, o;
                for (i = 1; i <= len; i++) {
                    storageManager.get(i, function(o) {
                        if (o && o.id !== undefined) {
                            //if (o.page === window.location.pathname) {
                                o.id = parseInt(i, 10);
                                if (scrollTo === "" && o.position != "fixed") {
                                    scrollTo = "idPostIt_" + o.id;
                                }
                                if ($('#idPostIt_' + o.id).length) {
                                    $('#idPostIt_' + o.id).postitall('options', options);
                                } else {
                                    $.newPostItAll(o.description, o);
                                }
                            //}
                            if (i == len && scrollToElement && scrollTo !== "") {
                                //console.log('scrollTo',scrollTo, $('#' + scrollTo));
                                $('html, body').animate({
                                    scrollTop: $('#' + scrollTo).offset().top - 50
                                }, 2000);
                            }
                        }
                    });
                }
            }
        });*/
    };
    //Save Local Storage Postits
    $.savePostItAll = function () {
        console.log("Save Postits to Local Storage");
        $('.PIApostit').each(function () {
            options = $(this).data('PIA-options');
            if(options.savable) {
                $(this).postitall('save');
            }
        });
    };
    //Remove all postits
    $.removePostItAll = function () {
        //Remove all postits
        console.log("Remove loaded Postits");
        $('.PIApostit').each(function () {
            $(this).postitall('destroy');
        });
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