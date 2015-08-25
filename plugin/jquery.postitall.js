/**
* jquery.postitall.js v1.0
* jQuery Post It All Plugin - released under MIT License
* Author: Javi Filella <txusko@gmail.com>
* http://github.com/txusko/PostItAll
* Copyright (c) 2015 Javi Filella
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

(function ($, $localStorage) {
    "use strict";

    // Debug
    var debugging = true; // or true
    if (typeof console === "undefined") {
        console = {
            log: function () { return undefined; }
        };
    } else if (!debugging || console.log === undefined) {
        console.log = function () { return undefined; };
    }

    // PLUGIN Public methods
    $.extend($.fn, {
        postitall: function (method, data) {
            var t = new PostItAll();
            var elem = $('.PIAeditable').find(this);
            //.filter(function(){ return !$(this).parents('#the_notes').length })
            if(elem.length <= 0)
                elem = $(this);
            elem = elem.filter(function(){ return !$(this).parents('#the_lights').length })
            switch (method) {

                // Destroy the control
                case 'destroy':
                    elem.each(function (i, e) {
                        if($(e).hasClass('PIApostit')) {
                            t.destroy($(e));
                        } else if($(e).attr('PIA-original') !== undefined) {
                            t.destroy($(e).parent().parent().parent().parent());
                        }
                    });
                return $(this);

                // Get/set options on the fly
                case 'options':
                    // Setter
                    //console.log('options', elem.length, data);
                    var obj = undefined;
                    elem.each(function (i, e) {
                        if($(e).hasClass('PIApostit')) {
                            if (data === undefined) {
                                obj = $(e).data('PIA-options');
                                return false;
                            } else {
                                t.options = $(e).data('PIA-options') || {};
                                t.destroy($(e));
                                $(e).postitall($.extend(true, t.options, data));
                            }
                        } else if($(e).attr('PIA-original') !== undefined) {
                            var oldObj = $(e).parent().parent().parent().parent();
                            if (data === undefined) {
                                obj = oldObj.data('PIA-options');
                                return false;
                            } else {
                                t.options = oldObj.data('PIA-options') || {};
                                t.destroy();
                                //t.create($.extend(true, t.options, data));
                                $.PostItAll.new($.extend(true, t.options, data));
                            }
                        }
                    });
                if(obj !== undefined)
                    return $(obj);
                return $(this);

                // hide note/s
                case 'hide':
                    elem.each(function (i, e) {
                        if($(e).hasClass('PIApostit')) {
                            t.hide($(e).data('PIA-id'));
                        } else if($(e).attr('PIA-original') !== undefined) {
                            t.hide($(e).parent().parent().parent().parent().data('PIA-id'));
                        }
                    });
                return $(this);

                //show note/s
                case 'show':
                    elem.each(function (i, e) {
                        if($(e).hasClass('PIApostit')) {
                            t.show($(e).data('PIA-id'));
                        } else if($(e).attr('PIA-original') !== undefined) {
                            t.show($(e).parent().parent().parent().parent().data('PIA-id'));
                        }
                    });
                return $(this);

                // Save object
                case 'save':
                    elem.each(function (i, e) {
                        if($(e).hasClass('PIApostit')) {
                            t.save($(e));
                        } else if($(e).attr('PIA-original') !== undefined) {
                            t.save($(e).parent().parent().parent().parent());
                        }
                    });
                return $(this);

                // Initializes the control
                case 'create':
                default:
                    var posX = 0, posY = 0, paso = false;
                    if (method !== 'create') {
                        data = method;
                        method = "create";
                    }
                    if(data === undefined || typeof data !== 'object') data = { };
                    if(data.postit === undefined || typeof data.postit !== 'object') data.postit = {};
                    if(data.postit.posX !== undefined) {
                        posX = data.postit.posX;
                        paso = true;
                    }
                    if(data.postit.posY !== undefined) {
                        posY = data.postit.posY;
                        paso = true;
                    }
                    //Check if initialized
                    var initialized = false;
                    $.each($(this).filter(function(){ return !$(this).parents('#the_notes').length }), function (i,e) {
                        if($(e).attr('PIA-original') !== undefined) {
                            initialized = true;
                            return false;
                        }
                    });
                    if(!initialized) {
                        $.each($(this).filter(function(){ return !$(this).parents('#the_notes').length }), function (i,e) {
                            if(!paso) {
                                posX = $(this).offset().left;
                                posY = $(this).offset().top;
                            }
                            $.extend(data.postit, { posX: posX, posY: posY }, true);
                            //console.log('create', i, e);
                            $.PostItAll.new(data, $(e));
                        });
                    } else {
                        $.PostItAll.show();
                    }
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
        enabledFeatures : {
            filter          : 'domain',      // domain, page, all
            draggable       : true,         //Set draggable feature on or off
            resizable       : true,         //Set resizable feature on or off
            removable       : true,         //Set removable feature on or off
            changeoptions   : true,         //Set options feature on or off
            savable         : true,        //Save postit in storage
            blocked         : true,        //Postit can not be modified
            minimized       : true,        //true = minimized, false = maximixed
            expand          : true,         //Expand note
            addNew          : true,        //Create a new postit
            fixed           : true,
            randomColor     : true,         //Random color in new postits
            autoHideToolBar : true,         //Animation efect on hover over postit shoing/hiding toolbar options
            askOnDelete     : true,         //Confirmation before note remove
            addArrow        : 'all',        //Add arrow to notes : none, front, back, all
            showInfo        : true,         //Show info icon
            pasteHtml       : true,         //Allow paste html in contenteditor
            htmlEditor      : true,         //Html editor (trumbowyg)
            autoPosition    : true,         //Automatic reposition of the notes when user resize screen
        }
    };

    //Note global vars
    $.fn.postitall.defaults = {
        postit : {
            id              : "",                            //Id
            created         : Date.now(),                   //Creation date
            selector        : '',
            domain          : window.location.origin,       //Domain in the url
            page            : window.location.pathname,     //Page in the url
            osname          : navigator.appVersion,         //getOSName(),
            content         : '',                           //Content
            position        : 'absolute',                   //Position absolute or relative
            posX            : '10px',                       //x coordinate (from left)
            posY            : '10px',                       //y coordinate (from top)
            right           : '',                           //right position
            minHeight       : 210,                          //resizable min-width
            minWidth        : 170,                          //resizable min-height
            height          : 200,                          //height
            width           : 160,                          //width
            oldPosition     : {},                           //Position when maximized
        },
        style : {
            tresd           : true,         //General style in 3d format
            backgroundcolor : '#FFFC7F',    //Background color in new postits when randomColor = false
            textcolor       : '#333333',    //Text color
            textshadow      : true,         //Shadow in the text
            fontfamily      : 'verdana',    //Default font
            fontsize        : 'small',      //Default font size
            arrow           : 'none',       //Default arrow : none, top, right, bottom, left
        },
        features : {
            draggable       : true,         //Set draggable feature on or off
            resizable       : true,         //Set resizable feature on or off
            removable       : true,         //Set removable feature on or off
            changeoptions   : true,         //Set options feature on or off
            savable         : false,        //Save postit in storage
            blocked         : false,        //Postit can not be modified
            minimized       : false,        //true = Collapsed note / false = maximixed
            expand          : false,        //true = Expanded note / false = normal
            randomColor     : true,         //Random color in new postits
            addNew          : true,         //Create a new postit
            fixed           : false,        //Position fixed
            highlight       : false,        //higlight note
            htmlEditor      : true,         //enable htmleditor
        },
        // Callbacks / Event Handlers
        onChange: function () { return undefined; },
        onSelect: function () { return undefined; },
        onDblClick: function () { return undefined; },
        onRelease: function () { return undefined; },
        onDelete: function () { return undefined; }
    };

    //Global functions
    jQuery.PostItAll = {

        //New note
        new : function(content, opt, obj, callback) {
            var note = new PostItAll();
            if($('#the_notes').length <= 0) {
                $('<div id="the_notes"></div>').appendTo($('body'));
            }
            if($('#the_lights').length <= 0) {
                $('<div id="the_lights"><div id="the_lights_close"></div></div>').appendTo($('body'));
                $('#the_lights').click(function() {
                    note.switchOnLights();
                });
            }   
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
            } else {
                var oldObj = obj;
                $(oldObj).attr('PIA-original', '1');
                var newObj = $('<div />').append(oldObj);
                $(newObj).attr('PIA-original', '1');
                obj = newObj;
            }
            $('#the_notes').append(obj);

            //console.log('init opt', $.fn.postitall.defaults);
            if(opt === undefined) {
                opt = $.extend(true, {}, $.fn.postitall.defaults);
            } else {
                opt = $.extend(true, {}, $.fn.postitall.defaults, opt);
            }
            //console.log('init 2opt', opt);
            //Check if we have the id
            var options = opt;
            console.log(options.style.backgroundcolor);
            if(options.postit.id !== "") {
                //Random bg & textcolor
                if($.fn.postitall.globals.enabledFeatures.randomColor && options.features.randomColor) {
                    options.style.backgroundcolor = this.getRandomColor();
                    options.style.textcolor = this.getTextColor(options.style.backgroundcolor);
                    options.features.randomColor = false;
                }
                //Initialize
                //this.init(obj, options);
                note.init(obj, options);

                if(callback !== undefined) callback(obj);
            } else {
                //Get new id
                //console.log('paso');
                note.getIndex(($.fn.postitall.globals.enabledFeatures.savable && options.features.savable), function(index) {
                    //console.log('getIndex.final', index);
                    //Random bg & textcolor
                    if($.fn.postitall.globals.enabledFeatures.randomColor && options.features.randomColor) {
                        options.style.backgroundcolor = note.getRandomColor();
                        options.style.textcolor = note.getTextColor(options.style.backgroundcolor);
                        options.features.randomColor = false;
                    }
                    options.postit.id = index;
                    //Initialize
                    note.init(obj, options);
                    //Set focus
                    //$( "#pia_editable_" + index ).focus();
                    //Callback
                    if(callback !== undefined) callback(obj);
                });
            }
        },

        //Hide all
        hide : function(id) {
            this.toggle(id, 'hide');
        },

        //Show all
        show : function(id) {
            this.toggle(id, 'show');
        },

        //hide/show all
        toggle : function(id, action) {
            var paso = false;
            if(id !== undefined) {
                if($('#PIApostit_' + id).length > 0) {
                    $('#PIApostit_' + id).postitall(action);
                    paso = true;
                } else if($(id.toString()).length) {
                    $(id.toString()).postitall(action);
                    paso = true;
                }
            }
            if(!paso) {
                $('.PIApostit').each(function () {
                    $(this).postitall(action);
                });
            }
        },

        //Load all (from storage)
        load : function(callback, onChange, onDelete, highlight) {
            var len = -1;
            var iteration = 0;
            var finded = false;
            storageManager.getlength(function(len) {
                if(!len) {
                    if(callback !== undefined) callback();
                    return;
                }
                for (var i = 1; i <= len; i++) {
                  storageManager.key(i, function(key) {
                    storageManager.getByKey(key, function(o) {
                      if (o != null && $('#id' + key).length <= 0) {
                        //console.log('o', key, o);
                        if($.fn.postitall.globals.enabledFeatures.filter == "domain")
                          finded = (o.postit.domain === window.location.origin);
                        else if($.fn.postitall.globals.enabledFeatures.filter == "page")
                          finded = (o.postit.domain === window.location.origin && o.postit.page === window.location.pathname);
                        else
                          finded = true;
                        if(finded) {
                            o.onChange = onChange;
                            o.onDelete = onDelete;
                            o.features.highlight = false;
                            if(highlight !== undefined && o.postit.id == highlight) {
                                //console.log('highlight note', highlight);
                                o.features.highlight = true;
                            }
                            $.PostItAll.new(o);
                        }
                      }
                      if(iteration == (len - 1) && callback != null) {
                          if(callback !== undefined) callback();
                          callback = null;
                      }
                      iteration++;
                    });
                  });
                }
            });
        },

        //Save all (to storage)
        save : function() {
            if(!$.fn.postitall.globals.enabledFeatures.savable)
                return;
            var options;
            var id;
            $('.PIApostit').each(function(i,e) { 
                id = $(e).data('PIA-id');
                options = $(e).data('PIA-options');
                if(id !== undefined && options !== undefined && options.features.savable) {
                    $(this).postitall('save');
                }
            });
        },

        //Get number of notes (only in storage)
        length : function(callback) {
            var total = 0;
            var len = -1;
            var iteration = 0;
            var finded = false;
            storageManager.getlength(function(len) {
                if(!len) {
                    callback(total);
                    return;
                }
                for (var i = 1; i <= len; i++) {
                  storageManager.key(i, function(key) {
                    storageManager.getByKey(key, function(o) {
                      if(o != null) {
                        if($.fn.postitall.globals.enabledFeatures.filter == "domain")
                          finded = (o.postit.domain === window.location.origin);
                        else if($.fn.postitall.globals.enabledFeatures.filter == "page")
                          finded = (o.postit.domain === window.location.origin && o.postit.page === window.location.pathname);
                        else
                          finded = true;
                        if (finded) {
                            total++;
                        }
                      }
                      if(iteration == (len - 1) && callback != null) {
                          callback(total);
                          callback = null;
                      }
                      iteration++;
                    });
                  });
                }
            });
        },

        //Remove all notes
        destroy : function(delInline, delStorage, delDomain) {
            if(delInline == undefined)
                delInline = true;
            if(delStorage == undefined)
                delStorage = true;
            if(delInline) {
                //Remove visible notes
                $('.PIApostit').each(function () {
                    if(delStorage) {
                        //console.log('destroy', $(this));
                        $(this).postitall('destroy');
                    } else {
                        //console.log('hide', $(this));
                        $(this).postitall('hide');
                    }
                });
            }
            if(delStorage) {
                if(delDomain !== undefined) {
                    //Delete notes of an specific domain
                    storageManager.removeDom({ domain : delDomain }, function() {
                        console.log("Storage cleared for domain", delDomain);
                    });
                } else {
                    //Delete all notes
                    storageManager.clear(function() {
                        console.log("Storage cleared");
                    });
                }
            }
        },
    };

    //Note class
    var PostItAll = function(obj, opt) {
        this.options = {};
        this.hoverState = false;
    };
    //Definition
    PostItAll.prototype = {

        // Initialize elements
        init : function(obj, opt) {
            //Default options
            this.options = $.extend({}, $.fn.postitall.defaults);
            //Set options
            if (typeof opt !== 'object') {
                opt = {};
            }
            this.setOptions(opt);
            // Do nothing if already initialized
            if (obj.data('PIA-initialized')) {
                return;
            }
            //Modify page content
            opt = $.extend(this.options, opt);
            this.setOptions(opt);
            //obj id
            obj.attr('id', 'PIApostit_' + opt.postit.id);
            //create stuff
            var newObj = this.create(obj);
            //Set on resize action
            if($.fn.postitall.globals.enabledFeatures.autoPosition)
                $(window).on('resize', $.proxy(this.relativePosition, this));
            //return obj
            return newObj;
        },

        //Save object
        save : function(obj, callback) {
            if(!$.fn.postitall.globals.enabledFeatures.savable)
                return;
            var options = obj.data('PIA-options');
            //console.log('save', options);
            options.features.savable = true;
            this.saveOptions(options, callback);
        },

        //Save options
        saveOptions : function(options, callback) {
            if(options === undefined)
                options = this.options;
            //console.log('saveOptions', options);
            if ($.fn.postitall.globals.enabledFeatures.savable && options.features.savable) {
                //console.log(options);
                storageManager.add(options, function(error) {
                    if(error != "") {
                        if(callback != null) callback(error);
                        else alert('Error saving options: ' + error);
                    } else {
                        if(callback != null) callback();
                    }
                });
                options.onChange();
            }
        },

        //Destroy and remove
        destroy : function(obj) {
            if(obj === undefined)
                obj = $('#PIApostit_' + this.options.postit.id);
            var options = obj.data('PIA-options');
            var id = options.postit.id;
            //console.log('destroy', id);
            //Remove from localstorage
            if ($.fn.postitall.globals.enabledFeatures.savable) {
                if(options.features.savable) {
                    storageManager.remove(id);
                    options.onChange();
                } else {
                    storageManager.get(id, function(varvalue) {
                        if(varvalue != null && varvalue != "")
                            storageManager.remove(id);
                            options.onChange();
                    });
                }
            }
            //Destroy object
            this.remove(options);

            //Event handler on delete
            options.onDelete();
        },

        //Hide note
        remove : function(options) {
            //hide object
            var id = options.postit.id;
            //console.log('remove', id);
            $('#PIApostit_' + id).removeData('PIA-id')
                .removeData('PIA-initialized')
                .removeData('PIA-settings')
                .animate({
                          opacity: 0,
                          height: 0
                        }, 'slow', function() {
                            console.log('ueee');
                            $(this).remove();                
                        });
                /*.hide("slow", function () {
                    $(this).remove();
                });*/
            $(window).off('resize');
        },

        hide : function(id) {
            //hide object
            if($('#PIApostit_' + id).length) {
                $('#PIApostit_' + id).slideUp();
            }
        },

        show : function(id) {
            //show object
            if($('#PIApostit_' + id).length) {
                $('#PIApostit_' + id).slideDown();
            }
        },

        //When user change arrow
        arrowChangeOption : function(value) {
            if($.fn.postitall.globals.enabledFeatures.addArrow == "none")
                return;

            var index = this.options.postit.id;
            var options = this.options;

            //console.log('arrowChangeOption', options.style.arrow, value);
            //Get new position
            if(options.style.arrow == value || value == 'none') {
                //If this position is the same as before, remove arrow and show selectors
                options.style.arrow = 'none';
                $('.selectedArrow_'+index).show();
            } else {
                //Set arrow and hide selectors
                options.style.arrow = value;
                $('.selectedArrow_'+index).hide();
            }
            //Show current arrow selector, another click will remove arrow
            $('*[data-value="'+options.style.arrow+'"]').show();
            //Change options arrow select
            $('#idAddArrow_'+index).val(options.style.arrow);
            
            this.hideArrow();
            this.showArrow();
            this.saveOptions(options);
            return options;
        },

        //Hide arrow & icons
        hideArrow : function() {
            var index = this.options.postit.id;
            //Remove previous arrow
            $('#PIApostit_' + index).removeClass('arrow_box_top arrow_box_right arrow_box_bottom arrow_box_left', 1000, "easeInElastic");
            $('#PIApostit_' + index).find('.icon_box').hide();
        },

        //Show arrow and icons
        showArrow : function(index, options) {
            var index = this.options.postit.id;
            var options = this.options;
            //Add arrow
            switch(options.style.arrow) {
                case 'top':
                    $('#PIApostit_' + index).addClass('arrow_box_top', 1000, "easeInElastic");
                break;
                case 'right':
                    $('#PIApostit_' + index).addClass('arrow_box_right', 1000, "easeInElastic");
                break;
                case 'bottom':
                    $('#PIApostit_' + index).addClass('arrow_box_bottom', 1000, "easeInElastic");
                break;
                case 'left':
                    $('#PIApostit_' + index).addClass('arrow_box_left', 1000, "easeInElastic");
                break;
            }
            //console.log('options.style.arrow',options.style.arrow);
            if(options.style.arrow == 'none')
                $('#PIApostit_' + index).find('.icon_box').show();
            $('*[data-value="'+options.style.arrow+'"]').show();
        },

        //Autoresize note
        autoresize : function() {
            var id = this.options.postit.id;
            var options = this.options;
            var obj = $('#PIApostit_' + id);
            //console.log('autoresize', id);
            if(options.features.minimized || options.features.expand)
                return;
            var contentHeight = parseInt(obj.find('.PIAeditable').height(), 10),
                posX = obj.css('left'),
                posY = obj.css('top'),
                divWidth = parseInt(obj.width(), 10),
                divHeight = parseInt(obj.css('height'), 10),
                minDivHeight = options.postit.minHeight;
            var htmlEditorBarHeight = parseInt(obj.find('.trumbowyg-button-pane').height(), 10);
            if(isNaN(htmlEditorBarHeight) || htmlEditorBarHeight <= 40) {
                htmlEditorBarHeight = 60;
            }
            //console.log('divHeight',divHeight,'contentHeight',contentHeight);
            if(contentHeight > divHeight - 40) {
                divHeight = contentHeight + htmlEditorBarHeight;
            } else if(contentHeight > options.postit.minHeight) {
                //Comment this line if we want to preserve user heigth
                divHeight = contentHeight + htmlEditorBarHeight;
            }
            //console.log('newHeight',divHeight);
            options.postit.height = divHeight;
            //obj.animate({ 'height': divHeight }, 250);
            obj.css('height', divHeight);
            options.postit.width = divWidth;
        },

        //Get next note Id
        getIndex : function(savable, callback) {
            if(!savable) {
                callback(this.guid());
                return;
            }

            var len = 0;
            var content = "";
            var paso = false;
            storageManager.getlength(function(len) {
                //console.log('getIndex.len', len);
                var loadedItems = $('.PIApostit').length;
                var items = len + loadedItems + 1;
                //console.log('getIndex.items', items);
                for(var i = 1; i <= items; i++) {
                    (function(i) {
                        storageManager.get(i, function(content) {
                            //console.log('getIndex.get', paso, i, content);
                            if(!paso && content == "" && $( "#idPostIt_" + i ).length <= 0) {
                                //console.log('nou index', i);
                                paso = true;
                            }
                            if(callback != null && (paso || i >= items)) {
                                callback(i);
                                callback = null;
                            }
                        });
                    })(i);
                }
            });
        }, 

        // Set options
        setOptions : function(opt, save) {
            var t = this;
            if (typeof opt !== 'object') {
                opt = {};
            }
            if (save === undefined) {
                save = false;
            }
            t.options = $.extend(t.options, opt);
            /*jslint unparam: true*/
            $.each(['onChange', 'onSelect', 'onRelease', 'onDblClick'], function (i, e) {
                if (typeof t.options[e] !== 'function') {
                    t.options[e] = function () { return undefined; };
                }
            });
            /*jslint unparam: false*/
            if (save) {
                console.log('setOptions save', t.options);
                this.saveOptions(t.options);
            }
        },

        // Get user selection text on page
        getSelectedText : function() {
            var text = "";
            if (window.getSelection) {
                text = window.getSelection();
            } else if (document.selection) {
                text = document.selection.createRange().text;
            }
            return text;
        },
        
        // Get user selection html on page
        getSelectedHtml : function() {
            var html = "";
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
            return html;
        },

        //Recover client OS name
        getOSName : function() {
            var OSName="Unknown OS";
            var browserNav = this.options.postit.osname;
            if (browserNav.indexOf("Win")!=-1) OSName="Windows";
            if (browserNav.indexOf("Mac")!=-1) OSName="MacOS";
            if (browserNav.indexOf("X11")!=-1) OSName="UNIX";
            if (browserNav.indexOf("Linux")!=-1) OSName="Linux";
            return OSName;
        },

        //flip cover to back
        switchBackNoteOn : function(flipClass) {
            var id = this.options.postit.id;
            $('#the_lights').data('highlightedId', id);
            this.enableKeyboardNav();
            $('#idPostIt_' + id + ' > .PIAback').css('visibility', 'visible');
            $('#PIApostit_' + id).addClass('PIAflip ' + flipClass, function () {
                $('#idPostIt_' + id + ' > .PIAfront').css('visibility', 'hidden');
                $('#PIApostit_' + id + ' > .ui-resizable-handle').css('visibility', 'hidden');
            });
            if($.fn.postitall.globals.enabledFeatures.resizable && $.ui) $('#PIApostit_' + id).resizable("disable");
            //if($.fn.postitall.globals.enabledFeatures.draggable && $.ui) $('#PIApostit_' + id).draggable("disable");
            //$(this).parent().parent().parent().parent().addClass('PIAflip');
        },

        //flip back to cover
        switchBackNoteOff : function(flipClass) {
            var id = this.options.postit.id;
            this.disableKeyboardNav();
            $('#idPostIt_' + id + ' > .PIAfront').css('visibility', 'visible');
            $('#PIApostit_' + id).removeClass('PIAflip ' + flipClass, function () {
                $('#idPostIt_' + id + ' > .PIAback').css('visibility', 'hidden');
                $('#PIApostit_' + id + ' > .ui-resizable-handle').css('visibility', '');
            });
            if($.fn.postitall.globals.enabledFeatures.resizable && $.ui) $('#PIApostit_' + id).resizable("enable");
            //if($.fn.postitall.globals.enabledFeatures.draggable && $.ui) $('#PIApostit_' + id).draggable("enable");
        },

        //add transparency to note
        switchTrasparentNoteOn : function() {
            var id = this.options.postit.id;
            var options = this.options;
            var components = this.getRGBComponents(options.style.backgroundcolor);
            //$('#PIApostit_' + id).css('background', 'rgb('+components.R+', '+components.G+', '+components.B+')');
            $('#PIApostit_' + id).css('background-color', 'rgba('+components.R+', '+components.G+', '+components.B+', 0.8)');
        },

        //remove transparency to note
        switchTrasparentNoteOff : function() {
            var id = this.options.postit.id;
            var options = this.options;
            var components = this.getRGBComponents(options.style.backgroundcolor);
            //$('#PIApostit_' + id).css('background', 'rgb('+components.R+', '+components.G+', '+components.B+')');
            $('#PIApostit_' + id).css('background-color', 'rgba('+components.R+', '+components.G+', '+components.B+', 1)');
        },

        //Switch off lights and highlight note
        switchOffLights : function() {
            var t = this;
            var id = t.options.postit.id;
            if(id !== undefined) {
                $('#PIApostit_'+id).css({
                    'z-index': 999999,
                    'border': '1px solid rgb(236, 236, 0)',
                    'box-shadow': 'rgb(192, 195, 155) 1px 1px 10px 3px',
                });
                t.hideArrow();
            }
            $("#the_lights").css({'height':($(document).height())+'px'});
            $("#the_lights").data('highlightedId', id);
            $("#the_lights").fadeTo("slow",0.6, function() {
                $("#the_lights").css('display','block');
                // lock scroll position, but retain settings for later
                var scrollPosition = [
                    self.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
                    self.pageYOffset || document.documentElement.scrollTop  || document.body.scrollTop
                ];
                $('html').data('scroll-position', scrollPosition);
                $('html').data('previous-overflow', $('html').css('overflow'));
                $('html').css('overflow', 'hidden');
                window.scrollTo(scrollPosition[0], scrollPosition[1]);
                $(window).on('resize', $.proxy(t.resizeAction, t));
            });
        },

        //Switch lights on & remove highlighted note
        switchOnLights : function() {
            var id = $("#the_lights").data('highlightedId');
            var options = $('#PIApostit_' + id).data('PIA-options');
            var t = this;
            if(id !== "" && options !== null && options !== undefined) {
                $("#the_lights").data('highlightedId', '');
                $('#PIApostit_'+id).css({'z-index': 999995,
                    'border': '1px solid ' + $('#PIApostit_'+id).css('background-color'),
                    'box-shadow': (!options.style.tresd ? 'none' : '#666 4px 4px 4px'),
                });
                if(options.features.expand) {
                    $('#pia_expand_'+id).click();
                } else {
                    $('#pia_close_'+id).click();
                }
            }
            if($("#the_lights").css('display') != "none") {
                $("#the_lights").css('display','block');
                $("#the_lights").fadeTo("slow",0, function() {
                    $("#the_lights").css('display','none');
                    // un-lock scroll position
                    var scrollPosition = $('html').data('scroll-position');
                    if(scrollPosition != undefined) {
                        $('html').css('overflow', $('html').data('previous-overflow'));
                        window.scrollTo(scrollPosition[0], scrollPosition[1]);
                    }
                    $(window).off('resize');
                    //Set on resize action
                    if($.fn.postitall.globals.enabledFeatures.autoPosition)
                        $(window).on('resize', $.proxy(t.relativePosition, t));
                });
            }
        },

        //On resize when lights are off
        switchOffLightsResize : function() {
            $("#the_lights").css({'height':($(document).height())+'px'});
        },

        //Enable keyboard actions
        enableKeyboardNav : function(callback) {
            console.log('enableKeyboardNav');
            this.callback = callback;
            $(document).on('keyup.keyboard', $.proxy(this.keyboardAction, this));
        },

        //Disable keybord actions
        disableKeyboardNav : function() {
            console.log('disableKeyboardNav');
            $(document).off('keyup.keyboard');
        },

        //Keyboard actions
        keyboardAction : function(event) {
            //console.log('keyboardAction', event);
            var KEYCODE_ESC        = 27;
            var keycode = event.keyCode;
            var key     = String.fromCharCode(keycode).toLowerCase();
            //On keypress ESC
            if (keycode === KEYCODE_ESC) { // || key.match(/x|o|c/)) {
                console.log('key press ESC');
                if(this.callback != undefined) this.callback();
                this.switchOnLights();
                this.disableKeyboardNav();
            }
        },

        //Resize expanded note when screen size changes
        resizeAction : function(event) {
            var t = this;
            delay(function(){
                //console.log('resizeAction', t.options.postit.id);
                //Lights switched off
                var highlightedId = $("#the_lights").data('highlightedId');
                if(highlightedId !== undefined && highlightedId !== ""){
                    t.switchOffLightsResize();
                    var options = $('#PIApostit_'+highlightedId).data('PIA-options');
                    if(options.features.expand) {
                        $('#PIApostit_' + highlightedId).css({
                            top:'10px'
                        }).animate({
                            'height': $(window).height() - 30,
                            'width': $(window).width() - 30
                        });
                    }
                }
            }, 500);
        },

        //On screen resize, notes will preserve relative position to new width screen
        relativePosition : function(event) {
            if(!$.fn.postitall.globals.enabledFeatures.autoPosition) {
                $(window).off('resize');
                return;
            }
            var t = this;
            delay(function(){
                $('.PIApostit').each(function(i,e) {
                    var obj = $("#PIApostit_" + $(e).data('PIA-id'));
                    //console.log('new pos for note ', i, e);
                    var noteLoc = obj.offset();
                    var screenLoc = { 'height': $(window).height(), 'width': $(window).width() };
                    var top = noteLoc.top;
                    var left = noteLoc.left;
                    var width = parseInt($(e).css('width'), 10) + parseInt($(e).css('padding-left'), 10) + parseInt($(e).css('padding-right'), 10);
                    var height = parseInt($(e).css('height'), 10) + parseInt($(e).css('padding-top'), 10) + parseInt($(e).css('padding-bottom'), 10);

                    var x1 = left, x2 = (left + width), y1 = top, y2 = (top + height);
                    var relTop = (y1 / screenLoc.height) * 100;
                    var relLeft = (x1 / screenLoc.width) * 100;
                    var relWidth = ((x2 - x1) / screenLoc.width) * 100;
                    var relHeight = ((y2 - y1) / screenLoc.height) * 100;

                    $(e).css({
                        //'top': relTop + "%",
                        'left': relLeft + "%",
                        //'width': relWidth + "%",
                        //'height': relHeight + "%"
                    });
                    var options = $(e).data('PIA-options');
                    options.postit.posX = obj.offset().left;
                    obj.data('PIA-options', options);
                });
                $.PostItAll.save();
            }, 100);
        },

        //Save current note position in options.postit.oldPosition
        saveOldPosition : function() {
            var obj = $('#PIApostit_' + this.options.postit.id);
            var leftMinimized = obj.css('left');
            if(this.options.postit.oldPosition !== undefined && this.options.postit.oldPosition.leftMinimized !== undefined)
                leftMinimized = this.options.postit.oldPosition.leftMinimized;
            var propCss = {
                'position': obj.css('position'),
                'left': obj.css('left'),
                'top': obj.css('top'),
                'height': obj.css('height'),
                'width': obj.css('width'),
                'leftMinimized': leftMinimized,
            };
            this.options.postit.oldPosition = propCss;
        },

        //Restore note with options.postit.oldPosition
        restoreOldPosition : function() {
            //console.log('restoreOldPosition');
            var t = this;
            var options = t.options;
            var id = options.postit.id;
            $('#PIApostit_' + id).animate({
                'left': options.postit.oldPosition.left,
                'width': options.postit.oldPosition.width,
                'height': options.postit.oldPosition.height,
                'position': options.postit.oldPosition.position,
            }, 500, function() {
                t.showArrow();
                $(this).css({
                    'top': options.postit.oldPosition.top,
                    bottom:'auto',
                });
                $(this).find( ".PIAeditable" ).css('height', 'auto');
                t.autoresize($(this));
                //animate resize
                t.hoverOptions(id, true);
                t.switchTrasparentNoteOff();
                t.switchOnLights();
            });
        },

        //hide/show divList objects
        toogleToolbar : function(action, divlist) {
            var t = this;
            var options = t.options;
            var index = options.postit.id;
            var type = "";
            var fadeOuTime = 200;
            for(var i = 0; i < divlist.length; i++) {
                type = divlist[i].substring(0,1);
                if(type != "#" && type != ".") {
                    type = "#";
                } else {
                    divlist[i] = divlist[i].substring(1);
                }
                if(action == "hide") {
                    $(type + divlist[i] + index).fadeTo(0, 0, function() {
                        $(this).hide();
                    });
                } else {
                    $(type + divlist[i] + index).fadeTo(0, 1, function() {
                        $(this).show();
                    });
                }
            }
            if(action == "hide") {
                if ($.fn.postitall.globals.enabledFeatures.resizable && options.features.resizable) {
                    if ($.ui) $('#PIApostit_' + index).resizable("disable");
                }
                if ($.fn.postitall.globals.enabledFeatures.draggable && options.features.draggable) {
                    //draggable
                    if ($.ui) $('#PIApostit_' + index).draggable("disable");
                    $('#pia_toolbar_'+index).css('cursor', 'inherit');
                }
            } else {
                if ($.fn.postitall.globals.enabledFeatures.resizable && options.features.resizable) {
                    if ($.ui) $('#PIApostit_' + index).resizable("enable");
                }
                if ($.fn.postitall.globals.enabledFeatures.draggable && options.features.draggable) {
                    if ($.ui) $('#PIApostit_' + index).draggable("enable");
                    $('#pia_toolbar_'+index).css('cursor', 'move');
                }
                t.hoverState = true;
                //t.hoverOptions(index, true);
            }
        },

        //Expand note
        expandNote : function() {
            var t = this;
            var index = t.options.postit.id;
            var options = t.options;
            $('#the_lights_close').hide();
            $('#pia_expand_' + index).removeClass('PIAexpand').addClass('PIAmaximize');
            t.hoverOptions(index, false);
            t.saveOldPosition();
            t.toogleToolbar('hide', ['idPIAIconBottom_', 'idInfo_', 'pia_config_', 'pia_fixed_', 'pia_delete_', 'pia_blocked_', 'pia_minimize_', 'pia_new_']);
            t.hideArrow();
            t.switchTrasparentNoteOn();
            t.switchOffLights();
            // Expand note
            $('#PIApostit_' + index).css({
                'top':'10px',
                'position': 'fixed',
            }).animate({
                'height': $(window).height() - 30,
                'width': $(window).width() - 30,
                'top': '10px',
                'left': '10px',
            }, 500, function() {
                $('.PIApostit').css('z-index', 999995);
                $(this).css('z-index', '999999');
                $( "#pia_editable_" + index ).css('height',($(window).height() - 120));
                $( "#pia_editable_" + index ).focus();
            });
            options.features.expand = true;
            t.enableKeyboardNav();
            t.saveOptions(options);
        },

        //Collapse note (restoreOldPosition)
        collapseNote : function() {
            var t = this;
            var index = t.options.postit.id;
            var options = t.options;

            $('#the_lights_close').show();
            $('#pia_expand_' + index).removeClass('PIAmaximize').addClass('PIAexpand');
            $('#PIApostit_' + index).css('position', options.postit.position);
            // show toolbar
            t.toogleToolbar('show', ['idPIAIconBottom_', 'idInfo_', 'pia_config_', 'pia_fixed_', 'pia_delete_', 'pia_blocked_', 'pia_minimize_', 'pia_new_']);
            //restore oldposition
            t.restoreOldPosition();
            //newstate
            options.features.expand = false;
            t.saveOptions(options);
        },

        //Minimize/Maximize note
        minimizeNote : function() {
            var t = this;
            var index = t.options.postit.id;
            var options = t.options;
            var obj = $('#PIApostit_' + index);
            //minimize action
            var minimize = function() {
                t.hoverOptions(index, false);
                $('#pia_editable_'+index).hide();
                $('#pia_minimize_'+index).removeClass('PIAminimize').addClass('PIAmaximize');
                options.features.minimized = true;
                //Add some start text to minimized note
                var txtContent = " " + $('#pia_editable_'+index).text();
                if(txtContent.length > 18)
                    txtContent = txtContent.substring(0,15) + "...";
                var smallText = $('<div id="pia_minimized_text_'+index+'" class="PIAminimizedText" />').text(txtContent);
                $('#pia_toolbar_'+index).append(smallText);
                //hide toolbar
                t.toogleToolbar('hide', ['idPIAIconBottom_', 'idInfo_', 'pia_config_', 'pia_fixed_', 'pia_delete_', 'pia_blocked_', 'pia_expand_', 'pia_new_']);

                //Enable draggable x axis
                if ($.fn.postitall.globals.enabledFeatures.draggable && options.features.draggable) {
                    //draggable
                    if ($.ui) {
                        obj.draggable("enable");
                        obj.draggable({ axis: "x" });
                    }
                }
                t.saveOldPosition();
                //Minimize
                $('#PIApostit_' + index).css({top:'auto'}).animate({
                    'width': (options.postit.minWidth + 20),
                    'height': '20px',
                    'position': 'fixed',
                    'bottom': '0',
                    'left': options.postit.oldPosition.leftMinimized,
                }, 500, function() {
                    t.hideArrow();
                    t.switchTrasparentNoteOn();
                    $('#PIApostit_' + index).css({position:'fixed'})
                });
            };
            //maximize action (restoreOldPosition)
            var maximize = function() {
                $('#pia_editable_'+index).show();
                $('#pia_minimize_'+index).removeClass('PIAmaximize').addClass('PIAminimize');
                options.features.minimized = false;
                // show toolbar
                t.toogleToolbar('show', ['idPIAIconBottom_', 'idInfo_', 'pia_config_', 'pia_fixed_', 'pia_delete_', 'pia_blocked_', 'pia_expand_', 'pia_new_']);
                $('#pia_minimized_text_'+index).remove();
                //Remove draggable axis
                if ($.fn.postitall.globals.enabledFeatures.draggable && options.features.draggable) {
                    if ($.ui) obj.draggable({ axis: "none" });
                }
                t.restoreOldPosition();
                t.switchTrasparentNoteOff();
            };
            //Action
            if(!options.features.minimized) {
                minimize();
            } else {
                maximize();
            }
            //Save feature
            t.save(obj);
        },

        //Block note
        blockNote : function() {
            var t = this;
            var index = t.options.postit.id;
            var options = t.options;
            var obj = $('#PIApostit_' + index);
            if(!options.features.blocked) {
                $('#pia_blocked_'+index.toString()).removeClass('PIAblocked').addClass('PIAblocked2');
                $('#pia_editable_'+index.toString()).attr('contenteditable', false).css("cursor", "auto");
                //disabel onhover actios
                t.hoverOptions(index, false);
                //toolbar
                t.toogleToolbar('hide', ['pia_config_', 'pia_fixed_', 'pia_delete_', 'pia_minimize_', 'pia_expand_', 'idPIAIconBottom_', '.selectedArrow_']);
                //new state
                options.features.blocked = true;
            } else {
                $('#pia_blocked_'+index.toString()).removeClass('PIAblocked2').addClass('PIAblocked');
                $('#pia_editable_'+index.toString()).attr('contenteditable', true).css("cursor", "");
                //toolbar
                t.toogleToolbar('show', ['pia_config_', 'pia_fixed_', 'pia_delete_', 'pia_minimize_', 'pia_expand_', 'idPIAIconBottom_', '.selectedArrow_']);
                //onhover actions
                t.hoverOptions(index, true);
                //new state
                options.features.blocked = false;
            }
            //Save feature
            t.save(obj);
        },

        //Fix note position
        fixNote : function() {
            var t = this;
            var index = t.options.postit.id;
            var options = t.options;
            var obj = $('#PIApostit_' + index);
            var posX = obj.css('left'),
                posY = obj.css('top'),
                divWidth = obj.width(),
                divHeight = obj.find('.PIAeditable').height(),
                minDivHeight = options.postit.minHeight;
            if(options.postit.position == "fixed") {
                $('#pia_fixed_'+index).removeClass('PIAfixed2 PIAiconFixed').addClass('PIAfixed PIAicon');
                options.postit.position = "absolute";
                options.postit.posY = obj.offset().top;
                obj.removeClass("fixed");
            } else {
                $('#pia_fixed_'+index).removeClass('PIAfixed PIAicon').addClass('PIAfixed2 PIAiconFixed');
                options.postit.position = "fixed";
                options.postit.posY = obj.offset().top - $(document).scrollTop();
                obj.addClass("fixed");
                obj.css('z-index', 999996);
            }
            options.postit.posX = obj.offset().left;
            obj.css('position', options.postit.position);
            obj.css('left', options.postit.posX);
            obj.css('top', options.postit.posY);
            //Save features
            t.save(obj);
        },

        //Enable/Disable auto-hide toolbar icons when hover over the note
        hoverOptions : function(index, enabled) {

            if(!$.fn.postitall.globals.enabledFeatures.autoHideToolBar)
                enabled = false;

            var fadeInTime = 200;
            var fadeOuTime = 600;
            var t = this;

            if(enabled) {
                setTimeout(function(){
                    //Options
                    $( "#PIApostit_" + index ).hover(function() {
                        $('#PIApostit_' + index).find('.PIAfront').find(".PIAicon, .PIAiconFixed").fadeTo(fadeInTime, 1);
                        if(t.options.style.arrow === undefined || t.options.style.arrow == "none")
                            $( "#PIApostit_" + index).find(".icon_box").fadeTo(fadeOuTime, 1);
                        $('#PIApostit_' + index + ' > .ui-resizable-handle').fadeTo(fadeInTime, 1);
                        t.hoverState = true;
                    }, function() {
                        setTimeout(function() {
                            if(!t.hoverState) {
                                $('#PIApostit_' + index).find('.PIAfront').find(".PIAicon, .PIAiconFixed").fadeTo(fadeOuTime, 0);
                                $( "#PIApostit_" + index).find(".icon_box").fadeTo(fadeOuTime, 0);
                                $('#PIApostit_' + index + ' > .ui-resizable-handle').fadeTo(fadeOuTime, 0);
                            }
                        },(fadeOuTime - fadeInTime));
                        t.hoverState = false;
                    });
                    if(!t.hoverState) {
                        $('#PIApostit_' + index).find('.PIAfront').find(".PIAicon, .PIAiconFixed").fadeTo(fadeOuTime, 0);
                        $( "#PIApostit_" + index).find(".icon_box").fadeTo(fadeOuTime, 0);
                        $('#PIApostit_' + index + ' > .ui-resizable-handle').fadeTo(fadeOuTime, 0);
                    }
                },100);
                return;
            }
            t.hoverState = false;
            //Options
            $( "#PIApostit_" + index ).unbind('mouseenter mouseleave');
            console.log('t.options.style.arrow',t.options.style.arrow);
            if(t.options.style.arrow === undefined || t.options.style.arrow == "none")
                $( "#PIApostit_" + index).find(".icon_box").fadeTo(fadeOuTime, 1);
            $( "#PIApostit_" + index).find('.PIAfront').find(".PIAicon, .PIAiconFixed").fadeTo(fadeInTime, 1);
        },

        //Get a random color (if the feature is enabled, otherwhise will return default background color)
        getRandomColor : function() {
            var randomColor = "";
            if($.fn.postitall.globals.enabledFeatures.randomColor && $.fn.postitall.defaults.features.randomColor) {
                //Random color
                //var colors = ["red", "blue", "yellow", "black", "green"];
                //return colors[Math.floor(Math.random() * colors.length)];
                randomColor = "#"+(Math.random()*0xFFFFFF<<0).toString(16);
            } else {
                //Default postit color
                randomColor = $.fn.postitall.defaults.style.backgroundcolor;
            }
            if(randomColor.length < 7) {
                var num = 7 - randomColor.length;
                var ret = new Array( num + 1 ).join("0");
                randomColor = randomColor + ret.toString();
            }
            return randomColor;
        },

        //Get text color relative tot hexcolor (if the featured is enabled, otherwise will return default text color)
        getTextColor : function(hexcolor) {
            if($.fn.postitall.globals.enabledFeatures.randomColor && $.fn.postitall.defaults.features.randomColor) {
                //Inverse of background (hexcolor)
                var nThreshold = 105;
                var components = this.getRGBComponents(hexcolor);
                var bgDelta = (components.R * 0.299) + (components.G * 0.587) + (components.B * 0.114);
                return ((255 - bgDelta) < nThreshold) ? "#111111" : "#eeeeee";
            } else {
                //Default postit text color
                return $.fn.postitall.defaults.style.textcolor;
            }
        },

        //Get css text-shadow style
        getTextShadowStyle : function(hexcolor) {
            //console.log(hexcolor);
            var nThreshold = 105;
            var components = this.getRGBComponents(hexcolor);
            var bgDelta = (components.R * 0.299) + (components.G * 0.587) + (components.B * 0.114);
            return ((255 - bgDelta) < nThreshold) ? "tresdblack" : "tresd";
        },

        //Get rgb from an hex color
        getRGBComponents : function(color) {
            var r = color.substring(1, 3);
            var g = color.substring(3, 5);
            var b = color.substring(5, 7);
            return {
               R: parseInt(r, 16),
               G: parseInt(g, 16),
               B: parseInt(b, 16)
            };
        },

        //Retrive unique random id (non savable notes)
        guid : function() {
          function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
              .toString(16)
              .substring(1);
          }
          return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
        },

        //Create note from an object
        create : function(obj) {

            var t = this;
            var options = t.options;
            var index = options.postit.id.toString();

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
            if ($.fn.postitall.globals.enabledFeatures.draggable && options.features.draggable) {
                barCursor = "cursor: move;";
            }
            var toolbar = $('<div />', {
                'id': 'pia_toolbar_' + index,
                'class': 'PIAtoolbar',
                'style': barCursor
            });

            //Drag support without jQuery UI - don't work so much well...
            if (!$.ui) {
                if ($.fn.postitall.globals.enabledFeatures.draggable && options.features.draggable) {
                    toolbar.drags();
                }
            }

            //Delete icon
            if($.fn.postitall.globals.enabledFeatures.removable) {
                if (options.features.removable) {
                    toolbar.append($('<div />', { 
                        'id': 'pia_delete_' + index, 
                        'class': 'PIAdelete PIAicon'
                    }).click(function (e) {
                        //console.log('aki1');
                        if (obj.hasClass('PIAdragged')) {
                            //console.log('aki2');
                            obj.removeClass('PIAdragged');
                        } else {
                            //console.log('aki3');
                            if($.fn.postitall.globals.enabledFeatures.askOnDelete) {
                                if ($(this).parent().find('.ui-widget2').length <= 0) {
                                    $('.backContent_' + index).hide();
                                    $('#idBackDelete_' + index + ' > .PIABox').css({
                                        'width': options.postit.width - 10,
                                        'height': options.postit.height - 54
                                    });
                                    $('#idBackDelete_' + index).show();
                                    t.switchBackNoteOn('PIAflip2');
                                    t.switchOffLights();
                                }
                            } else {
                                t.destroy();
                            }
                        }
                        e.preventDefault();
                    }));
                }
            }

            //Config icon
            if($.fn.postitall.globals.enabledFeatures.changeoptions) {
                if (options.features.changeoptions) {
                    toolbar.append(
                        $('<div />', {
                            'id': 'pia_config_' + index,
                            'class': 'PIAconfig PIAicon'
                        }).click(function (e) {
                            if (obj.hasClass('PIAdragged')) {
                                obj.removeClass('PIAdragged');
                            } else {
                                $('.backContent_'+index).hide();
                                $('#idBackConfig_'+index+' > .PIABox').css({
                                    'width': options.postit.width - 10,
                                    'height': options.postit.height - 54
                                });
                                $('#idBackConfig_'+index).show();
                                t.switchBackNoteOn('PIAflip2');
                            }
                            e.preventDefault();
                        })
                    );
                }
            }

            //Fixed
            if($.fn.postitall.globals.enabledFeatures.fixed) {
                if(options.features.fixed && options.postit.position != "fixed") {
                    options.postit.position = "fixed";
                    //options.features.fixed = false;
                }
                toolbar.append(
                    $('<div />', {
                        'id': 'pia_fixed_' + index,
                        'class': 'PIAfixed' + (options.postit.position == "fixed" ? '2 PIAiconFixed' : ' PIAicon') + ' '
                    }).click(function (e) {
                        if (obj.hasClass('PIAdragged')) {
                            obj.removeClass('PIAdragged');
                        } else {
                            t.fixNote();
                        }
                        e.preventDefault();
                    })
                );
            }

            //MINIMIZE
            if($.fn.postitall.globals.enabledFeatures.minimized) {
                toolbar.append(
                    $('<div />', {
                        'id': 'pia_minimize_' + index,
                        'class': (options.features.minimized ? 'PIAmaximize' : 'PIAminimize') + ' PIAicon'
                    }).click(function (e) {
                        if (obj.hasClass('PIAdragged')) {
                            obj.removeClass('PIAdragged');
                        } else {
                            t.minimizeNote();
                        }
                        e.preventDefault();
                    })
                );
            } else {
                options.features.minimized = false;
            }

            //Expand note / Maximize
            if($.fn.postitall.globals.enabledFeatures.expand) {
                toolbar.append(
                    $('<div />', {
                        'id': 'pia_expand_' + index,
                        'class': (options.features.expand ? 'PIAmaximize' : 'PIAexpand') + ' PIAicon'
                    }).click(function (e) {
                        if (obj.hasClass('PIAdragged')) {
                            obj.removeClass('PIAdragged');
                        } else {
                            if(!options.features.expand) {
                                t.expandNote();
                            } else {
                                t.collapseNote();
                            }
                        }
                        e.preventDefault();
                    })
                );
            } else {
                options.features.expand = false;
            }

            //Blocked
            if($.fn.postitall.globals.enabledFeatures.blocked) {
                toolbar.append(
                    $('<div />', {
                        'id': 'pia_blocked_' + index,
                        'class': 'PIAblocked' + (options.features.blocked == true ? '2' : '') + ' PIAicon',
                    }).click(function (e) {
                        if (obj.hasClass('PIAdragged')) {
                            obj.removeClass('PIAdragged');
                        } else {
                            t.blockNote();
                        }
                        e.preventDefault();
                    })
                );
            }

            //Front page: content
            var content = $('<div />', {
                'id': 'pia_editable_' + index,
                'class': 'PIAeditable PIAcontent',
                //Reset herisated contenteditable styles
                'style': 'width: auto;height: auto;padding: auto;border-color: transparent;box-shadow:none;color:'+options.style.textcolor+';min-width:99%;min-height:' + (options.postit.minHeight - 100) + 'px;'
            }).change(function () {
                var oldContent = options.postit.content;

                //Html format
                var text = $(this).text();
                if ($.fn.postitall.globals.enabledFeatures.pasteHtml) {
                    text = $(this).html();
                    //Default sanitize
                    text = text.replace(/<script[^>]*?>.*?<\/script>/gi, '').
                                 //replace(/<[\/\!]*?[^<>]*?>/gi, '').
                                 replace(/<style[^>]*?>.*?<\/style>/gi, '').
                                 replace(/<![\s\S]*?--[ \t\n\r]*>/gi, '');
                    //htmlClean sanitize plugin
                    if($.htmlClean !== undefined) { 
                        //htmlClean plugin
                        text = $.htmlClean(text, { format: true });
                    }
                }
                //console.log('text', text);
                
                //$(this).html(text);
                //$(this).trumbowyg('html', text);
                t.options.postit.content = text;

                //options.postit.content = $(this).html();
                t.autoresize($('#PIApostit_'+index));
                t.save(obj, function(error) {
                    if(error !== undefined && error !== "") {
                        alert('Error saving content! \n\n'+error+'\n\nReverting to last known content.');
                        t.options.postit.content = oldContent;
                        $('#pia_editable_' + t.options.postit.id).html(oldContent);
                        $('#pia_editable_' + t.options.postit.id).trigger('change');
                        t.autoresize();
                    }
                });
            }).attr('contenteditable', true).html(t.options.postit.content);

            //Info icon
            if($.fn.postitall.globals.enabledFeatures.showInfo || $.fn.postitall.globals.enabledFeatures.addNew) {
                var bottomToolbar = $('<div />', {
                    'id': 'idPIAIconBottom_'+ index,
                    'class': 'PIAIconBottom'
                });
                if($.fn.postitall.globals.enabledFeatures.showInfo) {
                    var info = $('<a />', {
                        'href': '#', 
                        'id': 'idInfo_'+index,
                        'class': ' PIAicon PIAinfoIcon',
                    }).click(function(e) {
                        if (obj.hasClass('PIAdragged')) {
                            obj.removeClass('PIAdragged');
                        } else {
                            $('.backContent_'+index).hide();
                            $('#idBackInfo_'+index+' > .PIABox').css({
                                'width': options.postit.width - 10,
                                'height': options.postit.height - 54
                            });
                            $('#idBackInfo_'+index).show();
                            t.switchBackNoteOn('PIAflip2');
                        }
                        e.preventDefault();
                    });
                    bottomToolbar.append(info);
                }
                //New note
                if($.fn.postitall.globals.enabledFeatures.addNew) {
                    if (options.features.addNew) {
                        var newNote = $('<a />', {
                            'href': '#', 
                            'id': 'pia_new_' + index,
                            'class': 'PIAnew PIAicon'
                        }).click(function (e) {
                            if (obj.hasClass('PIAdragged')) {
                                obj.removeClass('PIAdragged');
                            } else {
                                $.PostItAll.new('', {
                                    postit : {
                                        content: options.postit.content,
                                        position: 'absolute',
                                        posX: e.pageX,
                                        posY: e.pageY,
                                        width: options.postit.width,
                                        height: options.postit.height,
                                    },
                                    features: options.features,
                                    style: options.style,
                                }, undefined, function(obj) {
                                    delay(function() {
                                        $('.PIApostit').css('z-index', 999995);
                                        obj.css('z-index', 999999);
                                    }, 100);
                                })
                            }
                            e.preventDefault();
                        });
                        bottomToolbar.append(newNote);
                    }
                }
                toolbar.prepend(bottomToolbar);
            }

            //Front page
            var front = $('<div />', {
                'class': 'PIAfront',
                'dir': 'ltr',
            }).append(toolbar).append(content);

            //Creation date
            var d = new Date(options.postit.created);
            //Back page: toolbar
            toolbar = $('<div />', { 'class': 'PIAtoolbar', 'style': barCursor })
                //Close config icon
                .append($('<div />', {
                    'id': 'pia_close_' + index,
                    'class': 'PIAclose PIAicon',
                    'style': 'display:block;'
                })
                .click(function (e) {
                    //var id = $(this).closest('.PIApostit').children().attr('data-id');
                    t.switchBackNoteOff('PIAflip2');
                    t.switchOnLights();
                    t.showArrow();
                    e.preventDefault();
                })
            )
            .append($('<span />', {
                    'class': 'float-left minicolors_label',
                    'style': 'padding: 5px;font-size: 6.5px;font-family:verdana;'
                }).html(d.toLocaleDateString() + " (" + d.toLocaleTimeString() + ")")
            );
            //Back page: content
            //Background color
            var bgLabel = $('<label />', {
                'class': 'minicolors_label',
                'for': 'minicolors_bg_' + index,
            }).html('Background-color:');
            var bgString = $('<input />', {
                'class': 'minicolors',
                'id': 'minicolors_bg_' + index,
                'type': 'text',
                'height': '14px',
                'style': 'font-size:smaller;',
                'value': options.style.backgroundcolor,
                'data-default-value': options.style.backgroundcolor
            });
            //Text color
            var tcLabel = $('<label />', {
                'class': 'minicolors_label',
                'for': 'minicolors_text_' + index,
                'style': 'margin-top: 5px;'
            }).html('Text color:');
            var tcString = $('<input />', {
                'class': 'minicolors',
                'id': 'minicolors_text_' + index,
                'type': 'text',
                'height': '14px',
                'style': 'font-size:smaller;',
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
                'checked': checked
            });
            var tsLabel = $('<label />', {
                'class': 'minicolors_label',
                'for': 'textshadow_' + index
            }).append(tsString).append(' Text shadow');
            //3d style
            var checked2 = '';
            if (options.style.tresd) {
                checked2 = 'checked';
            }
            var gsString = $('<input />', {
                'id': 'generalstyle_' + index,
                'type': 'checkbox',
                'checked': checked2
            });
            var gsLabel = $('<label />', {
                'class': 'minicolors_label',
                'for': 'generalstyle_' + index,
            }).append(gsString).append(' 3D style');

            //Add arrow selection in options
            var aaString = "";
            if($.fn.postitall.globals.enabledFeatures.addArrow == "back" || $.fn.postitall.globals.enabledFeatures.addArrow == "all") {
                aaString = $('<select />', {
                    'id': 'idAddArrow_' + index,
                    'style': 'margin-top: 5px;',
                });
                aaString.append('<option value="none" '+(options.style.arrow == "none" ? 'selected' : '')+'>Arrow in:</option>');
                aaString.append('<option value="top" '+(options.style.arrow == "top" ? 'selected' : '')+'>Top</option>');
                aaString.append('<option value="right" '+(options.style.arrow == "right" ? 'selected' : '')+'>Right</option>');
                aaString.append('<option value="bottom" '+(options.style.arrow == "bottom" ? 'selected' : '')+'>Bottom</option>');
                aaString.append('<option value="left" '+(options.style.arrow == "left" ? 'selected' : '')+'>Left</option>');
                aaString.change(function(e) {
                    options = t.arrowChangeOption($(this).val());
                    e.preventDefault();
                });
            }

            //Back 1: config
            content = "";
            if($.fn.postitall.globals.enabledFeatures.changeoptions) {
                content = $('<div />', { 
                    'id': 'idBackConfig_'+index,
                    'class': 'PIAcontent backContent_'+index,
                }).append($('<div />', { 
                    'class': 'PIABox PIAconfigBox',
                    //'style': 'margin-left: -5px;',
                    'width': options.postit.width,
                    //'width': 'auto',
                    'height': options.postit.height - 54
                }).append("<div class='PIAtitle'>Note config</div>")
                    .append(bgLabel).append(bgString) // Bg color
                    .append(gsLabel)  // 3d or plain style
                    .append(tcLabel).append(tcString) // Text color
                    .append(tsLabel) // Text shadow
                    .append(aaString) //Arrow selection  
                );
            }

            //Back 2: info
            var backInfo = "";
            if($.fn.postitall.globals.enabledFeatures.showInfo) {
                var d = new Date(options.postit.created);
                var textDate = d.toLocaleDateString() + " (" + d.toLocaleTimeString() + ")";
                var textInfo = "<div class='PIAtitle'>Note info</div>";
                textInfo += "<strong>Created on:</strong> "+textDate+"<br>";
                if(options.postit.domain.indexOf("http") >= 0)
                    textInfo += "<strong>Domain:</strong> "+options.postit.domain+"<br>";
                textInfo += "<strong>Page:</strong> "+options.postit.page+"<br>";
                textInfo += "<strong>Op.System:</strong> " + t.getOSName() + " - "+options.postit.osname+"<br>";
                backInfo = $('<div />', { 
                    'id': 'idBackInfo_'+index,
                    'class': 'PIAcontent backContent_'+index
                }).append(
                    $('<div />', { 
                        'class': 'PIAinfoBox PIABox',
                        //'style': 'margin-left: -5px;',
                        'width': options.postit.width,
                        //'width': 'auto'
                        'height': options.postit.height - 54
                    }).append(textInfo)
                );
            }

            //Back 3: delete
            var deleteInfo = "";
            if($.fn.postitall.globals.enabledFeatures.askOnDelete) {
                deleteInfo = $('<div />', { 
                    'id': 'idBackDelete_' + index,
                    'class': 'PIAcontent backContent_'+index
                }).append($('<div />', { 
                        'id': 'pia_confirmdel_' + index,
                        'class': 'PIABox PIAwarningBox',
                        //'style': 'margin-left: -5px;',
                        'width': options.postit.width,
                        //'width': 'auto',
                        'height': options.postit.height - 54
                    }).append("<div class='PIAtitle'>Delete note!</div>")
                        .append($('<span />', { 
                                'style': 'line-height:10px;font-size:10px;',
                                'class': 'PIAdelwar float-left'
                            }))
                            .append($('<div />', { 'class': 'PIAconfirmOpt' }).append(
                                    $('<a />', { 'id': 'sure_delete_' + index, 'href': '#' })
                                    .click(function(e) { 
                                        t.switchOnLights();
                                        var id = obj.data('PIA-id');
                                        t.destroy();
                                        e.preventDefault(); 
                                    }).append($('<span />', { 'class': 'PIAdelyes' }).append("Delete this"))))
                            .append($('<div />', { 'class': 'PIAconfirmOpt' }).append(
                                    $('<a />', { 'id': 'all_' + index, 'href': '#' })
                                    .click(function(e) {
                                        t.switchOnLights();
                                        $.PostItAll.destroy();
                                        e.preventDefault();
                                    }).append($('<span />', { 'class': 'PIAdelyes' }).append("Delete all"))))
                            .append($('<div />', { 'class': 'PIAconfirmOpt' }).append(
                                    $('<a />', { 'id': 'cancel_' + index, 'href': '#' })
                                    .click(function(e) {
                                        t.switchOnLights();
                                        $('#pia_editable_' + index).show();
                                        t.switchBackNoteOff('PIAflip2');
                                        e.preventDefault();
                                    }).append($('<span />', { 'class': 'PIAdelno' }).append("Cancel"))))
                            .append($('<div />', { 'class': 'clear', 'style': 'line-height:10px;font-size:10px;font-weight: bold;' }).append("*This action cannot be undone"))
                );
            }

            //Back page
            var back = $('<div />', {
                'class': 'PIAback PIAback1 PIAback2',
                'style': 'visibility: hidden;'
            })
            .append(toolbar)
            .append(content)
            .append(backInfo)
            .append(deleteInfo);

            //Create postit
            var postit = $('<div />', { 
                'id': 'idPostIt_' + index, 
                'data-id': index 
            });
            //Add front
            postit.append(front);

            //Add back
            if($.fn.postitall.globals.enabledFeatures.changeoptions && options.features.changeoptions)
                postit.append(back);

            //Convert relative position to prevent height and width      in html layout
            if (options.postit.position === "relative") {
                options.postit.position = "absolute";
                //Increase top and left to prevent overlaying postits in the same position
                options.postit.posY = obj.offset().top + parseInt(options.postit.posY, 10);
                options.postit.posY += "px";
                options.postit.posX = obj.offset().left + parseInt(options.postit.posX, 10);
                options.postit.posX += "px";
            }

            //Arrow
            var arrowClases = " ";
            if($.fn.postitall.globals.enabledFeatures.addArrow != "none") {
                arrowClases += "arrow_box";
                switch(options.style.arrow) {
                    case 'top':
                        arrowClases += ' arrow_box_top';
                    break;
                    case 'right':
                        arrowClases += ' arrow_box_right';
                    break;
                    case 'bottom':
                        arrowClases += ' arrow_box_bottom';
                    break;
                    case 'left':
                        arrowClases += ' arrow_box_left';
                    break;
                }
            }

            //Modify final Postit Object
            obj.removeClass()
                .addClass('PIApostit ' + (options.style.tresd ? ' PIApanel ' : ' PIAplainpanel ')
                    + (options.postit.position == "fixed" ? ' fixed ' : '') + arrowClases)
                .css('position', options.postit.position)
                .css('top', options.postit.posY)
                .css('width', options.postit.width + 'px')
                .css('height', (options.postit.height) + 'px')
                .css('background-color', options.style.backgroundcolor)
                .css('color', options.style.textcolor)
                .css('font-family', options.style.fontfamily)
                .css('font-size', options.style.fontsize)
                .css('border-bottom-color', options.style.backgroundcolor)
                .css('border-left-color', options.style.backgroundcolor)
                .css('border-top-color', options.style.backgroundcolor)
                .css('border-right-color', options.style.backgroundcolor);
            if (options.postit.right !== "") {
                obj.css('right', options.postit.right);
                //options.postit.right = "";
            } else {
                obj.css('left', options.postit.posX)
            }
            if (options.style.textshadow) {
                obj.addClass(t.getTextShadowStyle(options.style.textcolor));
            } else {
                obj.addClass('dosd');
            }
            obj.html(postit)
            .on('focus', '#pia_editable_' + index, function () {
                if(options.features.blocked)
                    return;

                if($.fn.postitall.globals.enabledFeatures.htmlEditor && options.features.htmlEditor && $.trumbowyg) {
                    //t.hoverOptions(index, false);
                    t.toogleToolbar('hide', ['idPIAIconBottom_', 'pia_toolbar_', '.selectedArrow_']);
                    $('#PIApostit_' + index + ' > .ui-resizable-handle').css('visibility', 'hidden');
                    $('#pia_editable_' + index).trumbowyg({
                        //prefix: 'trumbowyg-black trumbowyg-',
                        //btns: ['bold', 'italic', 'underline', 'strikethrough', '|', 'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull', '|', 'link'],
                        btns: ['formatting',
                          '|', 'btnGrp-design',
                          '|', 'link',
                          '|', 'insertImage',
                          '|', 'btnGrp-justify',
                          '|', 'btnGrp-lists',
                          '|', 'horizontalRule',
                          '|', 'viewHTML'],
                        closable: true,
                        fullscreenable: false,
                        autogrow: true,
                        semantic: true,
                    })
                    .on('tbwblur', function(){ 
                        //console.log('tbwblur!'); 
                        /*delay(function() {
                            $('#pia_editable_' + index).trumbowyg('destroy');
                        },1000);*/
                        //$('.trumbowyg-close-button').click();
                    })
                    .on('tbwresize', function(){ 
                        /*delay(function() {
                            console.log('tbwresize!', index);
                            this.autoresize($('#PIApostit_' + index));
                        },1000);*/
                    })
                    .on('tbwclose', function(){ 
                        //console.log('tbwclose!'); 
                        $('#pia_editable_' + index).attr('contenteditable', true);
                        $('#pia_editable_' + index).css('height', 'auto');
                        t.toogleToolbar('show', ['idPIAIconBottom_', 'pia_toolbar_', '.selectedArrow_']);
                        $('#PIApostit_' + index + ' > .ui-resizable-handle').css('visibility', '');
                        t.autoresize();
                        var highlightedId = $("#the_lights").data('highlightedId');
                        if(highlightedId) {
                            t.collapseNote();
                        }
                    });
                    t.enableKeyboardNav(function() {
                        $('.trumbowyg-close-button').click();
                        t.autoresize();
                    });
                    t.autoresize();
                }
                var objeto = $(this);
                objeto.data('before', objeto.html());
                return objeto;
            })
            /*.on('focusout', '[contenteditable]', function () {
                $('#pia_editable_' + index).trumbowyg('destroy');
                $('#pia_editable_' + index).attr('contenteditable', true);
                console.log('focusout!!', '#pia_editable_' + index);
                var objeto = $(this);
                return objeto;
            })*/
            .on('blur keyup paste input', '[contenteditable]', function () {
                var objeto = $(this);
                if (objeto.data('before') !== objeto.html()) {
                    //console.log('change!');
                    var content = objeto.text();
                    if ($.fn.postitall.globals.enabledFeatures.pasteHtml)
                        content = objeto.html();
                    objeto.data('before', content);
                    objeto.trigger('change');
                }
                return objeto;
            }).click(function () {
                $('.PIApostit').css('z-index', 999995);
                $(this).css('z-index', 999999);
            });

            if ($.ui) {
                if ($.fn.postitall.globals.enabledFeatures.draggable && options.features.draggable) {
                    obj.draggable({
                        handle: ".PIApostit",
                        scroll: false,
                        start: function (e) {
                            //Remove draggable postit option
                            $('.PIApostit').css('z-index', 999995);
                            $(this).css('z-index', 999999);
                            $(this).draggable('disable');
                            if(!options.features.minimized) {
                                t.switchTrasparentNoteOn();
                            }
                            obj.addClass('PIAdragged');
                        },
                        stop: function () {
                            //Enable draggable postit option
                            $(this).draggable('enable');
                            t.autoresize($(this));
                            options.postit.right = '';
                            if ($.fn.postitall.globals.enabledFeatures.savable && options.features.savable) {
                                if(!options.features.minimized) {
                                    options.postit.posY = obj.css('top');
                                    options.postit.posX = obj.css('left');
                                    options.postit.oldPosition.leftMinimized = undefined;
                                } else {
                                    options.postit.oldPosition.leftMinimized = obj.css('left');
                                }
                                t.saveOptions(options);
                            }
                            if(!options.features.minimized) {
                                t.switchTrasparentNoteOff();
                            }
                            delay(function() {
                                if (obj.hasClass('PIAdragged')) {
                                    obj.removeClass('PIAdragged');
                                }
                            }, 200);
                        }
                    });
                }
                if ($.fn.postitall.globals.enabledFeatures.resizable &&  options.features.resizable) {
                    var pos = false;
                    //console.log('options.postit.minHeight',options.postit.minHeight);
                    obj.resizable({
                        animate: true,
                        helper: 'ui-resizable-helper',
                        minHeight: options.postit.minHeight,
                        minWidth: options.postit.minWidth,
                        start: function() {
                            t.switchTrasparentNoteOn();
                            //Change minheight on resizable
                            var tmpHeigth = $('#pia_editable_'+index).height();
                            if(tmpHeigth <= options.postit.minHeight) 
                                tmpHeigth = options.postit.minHeight;
                            //$(this).resizable({minHeight: tmpHeigth });
                        },
                        stop: function () {
                            delay(function(){
                                //console.log('stop autoresize');
                                t.autoresize(obj);
                                options.postit.right = '';
                                if ($.fn.postitall.globals.enabledFeatures.savable && options.features.savable) {
                                    options.postit.posY = obj.css('top');
                                    options.postit.posX = obj.css('left');
                                    t.saveOptions(options);
                                }
                            }, 1000);
                            t.switchTrasparentNoteOff();
                        }
                    });
                }
            }
            //hide back
            $('.backContent_' + options.postit.id).hide();

            if(!options.style.tresd) {
                $('#generalstyle_' + options.postit.id).click();
            }
            if(!options.style.textshadow) {
                $('#textshadow_' + options.postit.id).click();
            }
            //Postit minimized?
            if($.fn.postitall.globals.enabledFeatures.minimized && options.features.minimized) {
                options.features.minimized = false;
                $('#pia_minimize_' + options.postit.id).click();
            }
            //Postit expanded?
            if($.fn.postitall.globals.enabledFeatures.expand && options.features.expand) {
                options.features.expand = false;
                $('#pia_expand_' + options.postit.id).click();
                delay(function() {
                    $('#pia_editable_' + options.postit.id).focus();
                },500);
            }
            //Postit bloqued?
            if($.fn.postitall.globals.enabledFeatures.blocked && options.features.blocked) {
                options.features.blocked = false;
                $('#pia_blocked_' + options.postit.id).click();
            }

            //Select arrow in front
            if($.fn.postitall.globals.enabledFeatures.addArrow == "front" || $.fn.postitall.globals.enabledFeatures.addArrow == "all") { 
                var checks = "<div class='PIAicon icon_box icon_box_top'><a href='#' class='selectedArrow_"+index+"' data-index='"+index+"' data-value='top'><span class='ui-icon ui-icon-triangle-1-n'></span></a></div>";
                checks += "<div class='PIAicon icon_box icon_box_right'><a href='#' class='selectedArrow_"+index+"' data-index='"+index+"' data-value='right'><span class='ui-icon ui-icon-triangle-1-e'></span></a></div>";
                checks += "<div class='PIAicon icon_box icon_box_bottom'><a href='#' class='selectedArrow_"+index+"' data-index='"+index+"' data-value='bottom'><span class='ui-icon ui-icon-triangle-1-s'></span></a></div>";
                checks += "<div class='PIAicon icon_box icon_box_left'><a href='#' class='selectedArrow_"+index+"' data-index='"+index+"' data-value='left'><span class='ui-icon ui-icon-triangle-1-w'></span></a></div>";
                obj.append(checks);

                $('.selectedArrow_'+index).click(function(e) {
                    //console.log('click al link', $(this).attr('data-index'), $(this).attr('data-value'));
                    options = t.arrowChangeOption($(this).attr('data-value'));
                    e.preventDefault();
                });
            }

            //Show postit
            obj.slideDown('slow', function () {
                //Rest of actions
                //Config: text shadow
                $('#textshadow_' + index).click(function () {

                    if ($(this).is(':checked')) {
                        $(this).closest('.PIApostit').find('.PIAcontent').addClass(t.getTextShadowStyle($('#minicolors_text_' + index).val())).removeClass('dosd');
                        options.style.textshadow = true;
                    } else {
                        $(this).closest('.PIApostit').find('.PIAcontent').addClass('dosd').removeClass('tresd').removeClass('tresdblack');
                        options.style.textshadow = false;
                    }
                    t.setOptions(options, true);
                });
                //3d or plain
                $('#generalstyle_' + index).click(function () {
                    if ($(this).is(':checked')) {
                        $('#PIApostit_' + index).removeClass('PIAplainpanel').addClass('PIApanel');
                        options.style.tresd = true;
                    } else {
                        $('#PIApostit_' + index).removeClass('PIApanel').addClass('PIAplainpanel');
                        options.style.tresd = false;
                    }
                    t.setOptions(options, true);
                });
                //Background and text color
                if ($.minicolors) {
                    //Config: change background-color
                    $('#minicolors_bg_' + index).minicolors({
                        change: function (hex) {
                            $('#PIApostit_' + index).css('background-color', hex);
                            options.style.backgroundcolor = hex;
                            t.setOptions(options, true);
                        }
                    });
                    //Config: text color
                    $('#minicolors_text_' + index).minicolors({
                        change: function (hex) {
                            $('#PIApostit_' + index).css('color', hex);
                            options.style.textcolor = hex;
                            t.setOptions(options, true);
                        }
                    });
                } else {
                    $('#minicolors_bg_' + index).change(function () {
                        $(this).closest('.PIApostit').css('background-color', $(this).val());
                        options.style.backgroundcolor = $(this).val();
                        t.setOptions(options, true);
                    });
                    $('#minicolors_text_' + index).change(function () {
                        $(this).closest('.PIApostit').css('color', $(this).val());
                        options.style.textcolor = $(this).val();
                        t.setOptions(options, true);
                    });
                }

                //Autoresize to fit content when content load is done
                //console.log('autoresize');
                t.autoresize(obj);
            });

            //Hover options
            if(!options.features.minimized && !options.features.expand && !options.features.blocked) {
                t.hoverOptions(index, true);
            }

            //disable draggable on mouseenter in contenteditable div
            if ($.fn.postitall.globals.enabledFeatures.draggable && options.features.draggable) {
                $("#pia_editable_" + index).mouseenter(function (e) {
                    if($.ui) obj.draggable({disabled: true});
                }).mouseleave(function(e) {
                    if($.ui && !options.features.blocked && !options.features.expand) {
                        obj.draggable({disabled: false});
                    }
                });
            }

            //Bind paste event
            $("#pia_editable_" + index).bind('paste', function (e){
                var element = this;
                $("#pia_editable_" + index).css("opacity", "0");
                delay(function(){
                    var text = "";
                    if (!$.fn.postitall.globals.enabledFeatures.pasteHtml) {
                        //Text format
                        text = $(element).text();
                    } else {
                        //Html format
                        text = $(element).html();
                        //Default sanitize
                        text = text.replace(/<script[^>]*?>.*?<\/script>/gi, '').
                                     //replace(/<[\/\!]*?[^<>]*?>/gi, '').
                                     replace(/<style[^>]*?>.*?<\/style>/gi, '').
                                     replace(/<![\s\S]*?--[ \t\n\r]*>/gi, '');
                        //htmlClean sanitize plugin
                        if($.htmlClean !== undefined) { 
                            //htmlClean plugin
                            text = $.htmlClean(text, { format: true });
                        }
                    }
                    $("#pia_editable_" + index).html(text);
                    t.autoresize($("#PIApostit_" + index));
                    $("#pia_editable_" + index).css("opacity", "1");
                }, 100);
            });

            //Stop key propagation on contenteditable
            $("#pia_editable_" + index).keydown(function (e) {
                e.stopPropagation();
            });

            //Highlight note
            if(options.features.highlight) {
                this.switchOffLights();
                this.enableKeyboardNav();
            }

            //Save in storage
            this.saveOptions(options);

            //chaining
            return obj;
        }
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

    //Delay repetitive actions
    var delay = (function(){
      var timer = 0;
      return function(callback, ms){
        clearTimeout (timer);
        timer = setTimeout(callback, ms);
      };
    })();
    
    /********* STORAGE ************/

    // Global storage var
    var $storage = null;

    // Storage Manager
    var storageManager = {
        add: function (obj, callback) {
            this.loadManager(function() {
                $storage.add(obj, function(error) {
                    if(callback != null) callback(error);
                });
            });
        },
        get: function (id, callback) {
            this.loadManager(function() {
                $storage.get(id, function(varvalue) {
                    if(callback != null) callback(varvalue);
                });
            });
        },
        getAll: function (callback) {
            this.loadManager(function() {
                $storage.getAll(function(varvalue) {
                    if(callback != null) callback(varvalue);
                });
            });
        },
        getByKey: function (key, callback) {
            this.loadManager(function() {
                if (key != null && key.slice(0,7) === "PostIt_") {
                    key = key.slice(7,key.length);
                    storageManager.get(key, callback);
                } else {
                    if(callback != null) callback(null);
                }
            });
        },
        remove: function (id, callback) {
            this.loadManager(function() {
                $storage.remove(id, function(varvalue) {
                    if(callback != null) callback();
                });
            });
        },
        removeDom: function (options, callback) {
            this.loadManager(function() {
                $storage.removeDom(options, function() {
                    if(callback != null) callback();
                });
            });
        },
        clear: function (options, callback) {
            this.loadManager(function() {
                $storage.clear(function() {
                    if(callback != null) callback();
                });
            });
        },
        getlength: function (callback) {
            this.loadManager(function() {
                $storage.getlength(function(length) {
                    if(callback != null) callback(length);
                });
            });
        },
        key: function (i, callback) {
            this.loadManager(function() {
                $storage.key(i, function(name) {
                    if(callback != null) callback(name);
                });
            });
        },
        view: function (callback) {
            this.loadManager(function() {
                $storage.view();
            });
        },
        //Load storage manager
        loadManager: function(callback) {
            if($storage === null) {
                this.getStorageManager(function($tmpStorage) {
                    $storage = $tmpStorage;
                    callback($storage)
                });
            } else {
                callback(null);
            }
        },
        // Get storage manager
        getStorageManager: function(callback) {
            switch($.fn.postitall.globals.storage.type) {
                case 'local':
                    callback(localManager);
                break;
                case 'chrome':
                    if (typeof chromeManager !== 'undefined') callback(chromeManager);
                    else console.log('Error: chromeManager undefined');
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
    };

    // local storage manager
    var localManager = {
        add: function (obj, callback) {
            var varname = 'PostIt_' + obj.postit.id.toString();
            var testPrefs = JSON.stringify(obj);
            $localStorage.setItem(varname, testPrefs);
            //console.log('Saved', varname, testPrefs);
            if(callback != null) callback("");
        },
        get: function (id, callback) {
            var varname = 'PostIt_' + id.toString();
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
        removeDom: function (options, callback) {
            this.clear(callback);
        },
        clear: function (callback) {
            $localStorage.clear();
            if(callback != null) callback();
        },
        getlength: function (callback) {
            callback($localStorage.length);
        },
        key: function (i, callback) {
            i--;
            var name = $localStorage.key(i);
            callback(name);
        },
        view: function () {
            console.log('view local');
            console.log($localStorage);
        },
        getAll: function (callback) {
            console.log('TODO getAll on localStorage');
        }
    };


}(jQuery, window.localStorage));
