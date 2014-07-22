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

(function ($, $storage) {
    "use strict";

    // Global Vars
    var options;
    var PIAid = 0;
    //var console;

    // Manage localStorage
    var storageManager = {
        add: function (obj) { $storage.setItem('PostIt_' + parseInt(obj.id, 10), JSON.stringify(obj)); },
        get: function (id) { return JSON.parse($storage.getItem('PostIt_' + id)); },
        nextId: function () { PIAid += 1; if ($storage.getItem('PostIt_' + PIAid)) { return this.nextId(); } return PIAid; },
        remove: function (id) { PIAid = 0; $storage.removeItem('PostIt_' + id); },
        clear: function () { PIAid = 0; $storage.clear(); },
        getlength: function () { var len = $storage.length; return len; },
        getkey: function (i) { var key = $storage.key('PostIt_' + i); return key; },
        clearPage: function () { var i; for (i = 0; i < $storage.length; i += 1) { if ($storage.getItem('PostIt_' + i)) { $storage.removeItem('PostIt_' + i); } } }
    };

    //Save object
    function save(obj) {
        storageManager.add(obj.data('PIA-options'));
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
            .hide("slow", function () {
                $(this).remove();
            });
    }

    //Autoresize postit
    function autoresize(obj) {
        var id = obj.data('PIA-id');
        options = obj.data('PIA-options');
        if (options.autoheight) {
            var posY = $('#idPostIt_' + id).parent().css('left'),
                posX = $('#idPostIt_' + id).parent().css('top'),
                divWidth = $('#idPostIt_' + id).width(),
                divHeight = $('#idPostIt_' + id).find('.PIAeditable').height(),
                minDivHeight = options.minHeight;
            if (divHeight >= minDivHeight) {
                divHeight += 50;
                options.height = divHeight;
                obj.css('height', divHeight);
                if ($.ui) {
                    if (options.resizable) {
                        obj.resizable({
                            minHeight: divHeight
                        });
                    }
                }
            } else if (divHeight < minDivHeight) {
                options.height = minDivHeight;
                minDivHeight += 50;
                obj.css('height', minDivHeight);
            }
            options.posY = posY;
            options.posX = posX;
            options.width = divWidth;
        }
    }

    //Get Next Postit Id
    function getIndex() {
        var index = storageManager.nextId();
        return parseInt(index, 10);
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
    function create(obj, options) {
        //Increase index
        var index = 0;
        if (options.id <= 0) {
            index = getIndex();
            options.id = index;
        } else {
            index = options.id;
        }
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
        //Delete icon
        if (options.removable) {
            toolbar.append($('<div />', { 'id': 'pia_delete_' + index.toString(), 'class': 'PIAdelete PIAicon'})
                .click(function (e) {
                    if ($(this).parent().find('.ui-widget').length <= 0) {
                        var cont = '<div class="ui-widget float-left">' +
                            '<div class="PIAwarning">' +
                            '<span class="PIAdelwar float-left"></span>&nbsp;Sure?&nbsp;' +
                            '<a id="sure_delete_' + index + '" href="#"><span class="PIAdelyes PIAicon float-right"></span></a>' +
                            '<a id="cancel_' + index + '" href="#"><span class="PIAdelno PIAicon float-right"></span></a>' +
                            '</div>' +
                            '</div>';
                        $(this).parent().append(cont);
                        $('#sure_delete_' + index).click(function (e) {
                            //var id = $(this).closest('.PIApostit').children().attr('data-id');
                            var id = obj.data('PIA-id');
                            destroy($('#idPostIt_' + id).parent());
                            e.preventDefault();
                        });
                        $('#cancel_' + index).click(function (e) {
                            $(this).parent().parent().remove();
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
                'class': 'float-right',
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
            options.posX = obj.offset().top + parseInt(options.posX, 10) + (index * 5);
            options.posX += "px";
            options.posY = obj.offset().left + parseInt(options.posY, 10) + (index * 5);
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
                            storageManager.add(options);
                        }
                    }
                });
            }
            if (options.resizable) {
                obj.resizable({
                    animate: false,
                    helper: 'ui-resizable-helper',
                    minHeight: options.minHeight,
                    minWidth: options.minWidth,
                    stop: function () {
                        autoresize($(this));
                    }
                });
            }
        }
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
        });
        //Save in localstorage
        if (options.savable) {
            storageManager.add(options);
        }
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
        //Check if we shold create a new postit
        if (options.newPostit) {
            //New postit
            options.newPostit = false;
            var index = 0;
            if (options.id <= 0) {
                index = getIndex();
                options.id = index;
            } else {
                index = options.id;
            }
            var PIAcontent = $('<div />', { 'id' : 'newPostIt_' + index });
            obj.append(PIAcontent);
            return create(PIAcontent, options);
        }
        // Do nothing if already initialized
        if (obj.data('PIA-initialized')) {
            return;
        }
        //Modify page content
        return create(obj, options);
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
                $(this).each(function () {
                    init($(this), data);
                });
                return $(this);
            }
        }
    });

    // Default Plugin Vars
    $.fn.postitall.defaults = {
        // Basic Settings
        id              : 0, //Id
        created         : Date.now(),
        domain          : window.location.origin, //Domain in the url
        page            : window.location.pathname, //Page in the url
        backgroundcolor : '#FFFC7F', //Background color
        textcolor       : '#333333', //Text color
        textshadow      : true, //Shadow in the text
        position        : 'relative', //Position absolute or relative
        posX            : '5px', //top position
        posY            : '5px', //left position
        height          : 180, //height
        width           : 200, //width
        minHeight       : 152, //resizable min-width
        minWidth        : 131, //resizable min-height
        description     : '', //content
        newPostit       : false, //Create a new postit
        autoheight      : true, //Set autoheight feature on or off
        draggable       : true, //Set draggable feature on or off
        resizable       : true, //Set resizable feature on or off
        removable       : true, //Set removable feature on or off
        changeoptions   : true, //Set options feature on or off
        savable         : false, //Save postit in local storage
        // Callbacks / Event Handlers
        onChange: function () { return undefined; },
        onSelect: function () { return undefined; },
        onDblClick: function () { return undefined; },
        onRelease: function () { return undefined; }
    };

    //Load Local Storage Postits
    $.loadPostItAll = function (scrollToElement) {
        if (scrollToElement === undefined) {
            scrollToElement = false;
        }
        var len = storageManager.getlength();
        console.log("Load Postits from Local Storage");
        if (len > 0) {
            //var key = 0;
            var scrollTo = "", i = 0, o;
            for (i = 0; i < len; i += 1) {
                //key = storageManager.getkey(i);
                o = storageManager.get(i);
                if (o && o.id !== undefined) {
                    //if (o.page === window.location.pathname) {
                        o.id = parseInt(i, 10);
                        if (scrollTo === "") {
                            scrollTo = "idPostIt_" + o.id;
                        }
                        if ($('#idPostIt_' + o.id).length) {
                            $('#idPostIt_' + o.id).postitall('options', options);
                        } else {
                            o.newPostit = true;
                            $('body').postitall(o);
                            PIAid = o.id;
                        }
                    //}
                }
            }
            if (scrollToElement && scrollTo !== "") {
                $('html, body').animate({
                    scrollTop: $('#' + scrollTo).offset().top - 50
                }, 2000);
            }
        }
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