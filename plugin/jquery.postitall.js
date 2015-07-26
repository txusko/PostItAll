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
        getAll: function (callback) {
            loadManager(function() {
                $storage.getAll(function(varvalue) {
                    if(callback != null) callback(varvalue);
                });
            });
        },
        getByKey: function (key, callback) {
            loadManager(function() {
                if (key != null && key.slice(0,7) === "PostIt_") {
                    key = key.slice(7,key.length);
                    storageManager.get(key, callback);
                } else {
                    if(callback != null) callback(null);
                }
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
        },
        view: function (callback) {
            loadManager(function() {
                $storage.view();
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


    // chrome storage Manager
    var chromeManager = {
        add: function(obj, callback) {
            var varname = 'PostIt_' + parseInt(obj.postit.id, 10);
            var testPrefs = JSON.stringify(obj);
            var jsonfile = {};
            jsonfile[varname] = testPrefs;
            //console.log('chromeManager.add', jsonfile);
            chrome.storage.sync.set(jsonfile, function () {
                if(callback != null) callback();
            });
        },
        get: function(id, callback) {
            var varvalue;
            var varname = 'PostIt_' + parseInt(id, 10);
            //console.log('chromeManager.get', varname);
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
            console.log('Remove',varname);
            varname = 'PostIt_' + parseInt(varname, 10);
            chrome.storage.sync.remove(varname, function() {
                //console.log('Removed',varname);
                if(callback != null) callback();
            });
        },
        clear: function(callback) {
          var len = -1;
          var iteration = 0;
          var finded = false;
          storageManager.getlength(function(len) {
              if(!len) {
                  callback();
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
                          storageManager.remove(o.postit.id);
                      }
                    }
                    if(iteration == (len - 1) && callback != null) {
                        callback();
                        callback = null;
                    }
                    iteration++;
                  });
                });
              }
          });

          /*chrome.storage.sync.clear(function() {
              console.log('Clear chrome storage');
              if(callback != null) callback();
          });*/
        },
        getlength: function(callback) {
            var total = 0;
            //console.log('chromeManager.getlength');
            chrome.storage.sync.get(null,function(data) {
                total = Object.keys(data).length;
                //console.log('chromeManager.getlength', total);
                callback(total);
            });
        },
        key: function (i, callback) {
            var varname = 'PostIt_' + parseInt(i, 10);
            chrome.storage.sync.get(null,function(retVal) {
                //console.log('chromeManager.key ' + varname, retVal);
                if(retVal[varname] !== undefined)
                    callback(varname);
                else
                    callback("");
            });
        },
        view: function () {
            console.log('view chrome');
            chrome.storage.sync.get(null,function(retVal) {
                console.log(retVal);
            });
        },
        getAll: function (callback) {
          var len = -1;
          var iteration = 0;
          var results = [];
          storageManager.getlength(function(len) {
              if(!len) {
                  callback(results);
                  return;
              }
              for (var i = 1; i <= len; i++) {
                storageManager.key(i, function(key) {
                  storageManager.getByKey(key, function(o) {
                      results[o.postit.id] = o;
                      if(iteration == (len - 1) && callback != null) {
                          callback(results);
                          callback = null;
                      }
                      iteration++;
                  });
                });
              }
          });
        }
    };

    //Save object
    function save(obj) {
        var options = obj.data('PIA-options');
        if($.fn.postitall.globals.enabledFeatures.savable && options.features.savable) {
            storageManager.add(options);
            options.onChange();
        }
    }

    function saveOptions(options) {
        if ($.fn.postitall.globals.enabledFeatures.savable && save && options.features.savable) {
            console.log(options);
            storageManager.add(options);
            options.onChange();
        }
    }

    //Destroy object
    function destroy(obj) {
        var id = obj.data('PIA-id');
        options = obj.data('PIA-options');
        //Remove from localstorage
        if ($.fn.postitall.globals.enabledFeatures.savable) {
            if(options.features.savable) {
                storageManager.remove(id);
                console.log('aki1', options);
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
        hide(obj);

        //Event handler on delete
        options.onDelete();
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

        var contentHeight = $('#idPostIt_' + id).find('.PIAeditable').height();

        var posY = $('#idPostIt_' + id).parent().css('left'),
            posX = $('#idPostIt_' + id).parent().css('top'),
            divWidth = $('#idPostIt_' + id).width(),
            //divHeight = $('#idPostIt_' + id).find('.PIAeditable').height(),
            divHeight = $('#idPostIt_' + id).parent().css('height'),
            minDivHeight = options.postit.minHeight;

            divHeight = parseInt(divHeight,10);
            contentHeight = parseInt(contentHeight,10);

            if(contentHeight > divHeight - 35) {
                divHeight = contentHeight + 35;
            }

        //if (divHeight >= minDivHeight) {
            //divHeight += 50;
            options.postit.height = divHeight;
            obj.css('height', divHeight);
            /*if ($.ui) {
                if ($.fn.postitall.globals.features.resizable && options.features.resizable) {
                    var newMinHeight = parseInt(options.postit.minHeight,10);
                    if((contentHeight + 25) > newMinHeight)
                        newMinHeight = contentHeight + 25;

                    obj.resizable({
                        minHeight: newMinHeight
                    });
                }
            }*/
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

    //Get Next Postit Id
    function getIndex(savable, callback) {
        if(!savable) {
            callback(guid());
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
        if (save) {
            saveOptions(options);
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
        if ($.fn.postitall.globals.enabledFeatures.draggable && options.features.draggable) {
            barCursor = "cursor: move;";
        }
        var toolbar = $('<div />', {
            'id': 'pia_toolbar_' + index.toString(),
            'class': 'PIAtoolbar',
            'style': barCursor
        });
        //Drag support without jQuery UI
        if (!$.ui) {
            if ($.fn.postitall.globals.enabledFeatures.draggable && options.features.draggable) {
                toolbar.drags();
            }
        }

        //Delete icon
        if($.fn.postitall.globals.enabledFeatures.removable) {
            if (options.features.removable) {
                toolbar.append($('<div />', { 'id': 'pia_delete_' + index.toString(), 'class': 'PIAdelete PIAicon'})
                    .click(function (e) {
                        if($.fn.postitall.globals.enabledFeatures.askOnDelete) {
                            if ($(this).parent().find('.ui-widget2').length <= 0) {
                                var cont = '<div class="ui-widget2" id="pia_confirmdel_' + index + '">' +
                                    '<div class="PIAwarning">' +
                                    '<span class="PIAdelwar float-left" style="line-height:10px;font-size:10px;"></span>Delete notes:<br>' +
                                    '<div class="PIAconfirmOpt"><a id="sure_delete_' + index + '" href="#"><span class="PIAdelyes PIAicon"> Delete this</span></a></div>' +
                                    '<div class="PIAconfirmOpt"><a id="all_' + index + '" href="#"><span class="PIAdelyes PIAicon"> Delete all</span></a></div>' +
                                    '<div class="PIAconfirmOpt"><a id="cancel_' + index + '" href="#"><span class="PIAdelno PIAicon"> Cancel</span></a></div>' +
                                    '<div class="clear" style="line-height:10px;font-size:10px;font-weight: bold;"><br>* This action can be undone!</div>'
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
                        } else {
                            destroy($('#idPostIt_' + index).parent());
                            e.preventDefault();
                        }
                    }));
            }
        }

        //Config icon
        if($.fn.postitall.globals.enabledFeatures.changeoptions) {
            if (options.features.changeoptions) {
                toolbar.append(
                    $('<div />', {
                        'id': 'pia_config_' + index.toString(),
                        'class': 'PIAconfig PIAicon'
                    }).click(function (e) {
                        var id = obj.data('PIA-id');
                        $('#idPostIt_' + id + ' > .PIAback').css('visibility', 'visible');
                        $('#idPostIt_' + id).parent().addClass('PIAflip', function () {
                            $('#idPostIt_' + id + ' > .PIAfront').css('visibility', 'hidden');
                        });
                        if($.fn.postitall.globals.enabledFeatures.resizable && $.ui) $('#idPostIt_' + id).parent().resizable("disable");
                        if($.fn.postitall.globals.enabledFeatures.draggable && $.ui) $('#idPostIt_' + id).parent().draggable("disable");
                        //$(this).parent().parent().parent().parent().addClass('PIAflip');
                        hoverOptions(id, false);
                        e.preventDefault();
                    })
                );
            }
        }
        //Save icon
        /*if ($.fn.postitall.globals.enabledFeatures.savable && options.features.savable) {
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
        if($.fn.postitall.globals.enabledFeatures.fixed) {
            if(options.features.fixed && options.postit.position != "fixed") {
                options.postit.position = "fixed";
                options.features.fixed = false;
            }
            toolbar.append(
                $('<div />', {
                    'id': 'pia_fixed_' + index.toString(),
                    'class': 'PIAfixed' + (options.postit.position == "fixed" ? '2 PIAiconFixed' : ' PIAicon') + ' '
                }).click(function (e) {
                    var id = obj.data('PIA-id');
                    var options = obj.data('PIA-options');
                    var posY = $('#idPostIt_' + id).parent().css('left'),
                        posX = $('#idPostIt_' + id).parent().css('top'),
                        divWidth = $('#idPostIt_' + id).width(),
                        divHeight = $('#idPostIt_' + id).find('.PIAeditable').height(),
                        minDivHeight = options.postit.minHeight;
                    if(options.postit.position == "fixed") {
                        $('#pia_fixed_'+index.toString()).removeClass('PIAfixed2 PIAiconFixed').addClass('PIAfixed PIAicon');
                        options.postit.position = "absolute";
                        options.postit.posX = $('#idPostIt_' + id).parent().offset().top;
                        obj.removeClass("fixed");

                    } else {
                        $('#pia_fixed_'+index.toString()).removeClass('PIAfixed PIAicon').addClass('PIAfixed2 PIAiconFixed');
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
        }

        //MINIMIZE
        if($.fn.postitall.globals.enabledFeatures.minimized) {
            toolbar.append(
                $('<div />', {
                    'id': 'pia_minimize_' + index.toString(),
                    'class': (options.features.minimized ? 'PIAmaximize' : 'PIAminimize') + ' PIAicon'
                })
                .click(function (e) {
                    var id = obj.data('PIA-id');
                    var options = obj.data('PIA-options');
                    if(!options.features.minimized) {
                        hoverOptions(index, false);

                        //$('#pia_blocked_'+id).click();
                        $('#pia_editable_'+id).hide();
                        $('#pia_minimize_'+index.toString()).removeClass('PIAminimize').addClass('PIAmaximize');
                        options.features.minimized = true;

                        if ($.fn.postitall.globals.enabledFeatures.resizable && options.features.resizable) {
                            //resizable
                            if ($.ui) obj.resizable("disable");
                            //$(this).resizable("disable");
                        }
                        if ($.fn.postitall.globals.enabledFeatures.draggable && options.features.draggable) {
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
                        //Minimize
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
                        }, 500, function() {
                            $('#idPostIt_'+id).parent().css({position:'fixed'})
                        });

                    } else {
                        //$('#pia_blocked_'+id).click();
                        $('#pia_editable_'+id).show();
                        $('#pia_minimize_'+index.toString()).removeClass('PIAmaximize').addClass('PIAminimize');
                        options.features.minimized = false;

                        if ($.fn.postitall.globals.enabledFeatures.resizable && options.features.resizable) {
                            if ($.ui) obj.resizable("enable");
                        }
                        if ($.fn.postitall.globals.enabledFeatures.draggable && options.features.draggable) {
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
                        hoverOptions(index, true);
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
        } else {
            options.features.minimized = false;
        }

        /*
        if($.fn.postitall.globals.enabledFeatures.addNew) {
            if (options.features.addNew) {
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
            }
        }*/

        //Blocked
        if($.fn.postitall.globals.enabledFeatures.blocked) {
            toolbar.append(
                $('<div />', {
                    'id': 'pia_blocked_' + index.toString(),
                    'class': 'PIAblocked' + (options.features.blocked == true ? '2' : '') + ' PIAicon',
                }).click(function (e) {
                    var id = obj.data('PIA-id');
                    var options = obj.data('PIA-options');
                    if(!options.features.blocked) {
                        hoverOptions(index, false);
                        $('#pia_blocked_'+index.toString()).removeClass('PIAblocked').addClass('PIAblocked2');
                        $('#pia_editable_'+index.toString()).attr('contenteditable', false);
                        if ($.fn.postitall.globals.enabledFeatures.resizable && options.features.resizable) {
                            //resizable
                            if ($.ui) $('#idPostIt_' + id).parent().resizable("disable");
                        }

                        if ($.fn.postitall.globals.enabledFeatures.draggable && options.features.draggable) {
                            //draggable
                            if ($.ui) {
                                $('#idPostIt_' + id).parent().draggable("disable");
                            }
                            $('#pia_toolbar_'+index.toString()).css('cursor', 'inherit');
                        }
                        //toolbar
                        $('#pia_config_'+index.toString()).hide();
                        //if(options.postit.position != "fixed")
                            //$('#pia_fixed_'+index.toString()).hide();
                        $('#pia_delete_'+index.toString()).hide();
                        $('#pia_minimize_'+index.toString()).hide();
                        $('#PIApostit_' + index + ' > .ui-resizable-handle').hide();

                        options.features.blocked = true;
                    } else {
                        $('#pia_blocked_'+index.toString()).removeClass('PIAblocked2').addClass('PIAblocked');
                        $('#pia_editable_'+index.toString()).attr('contenteditable', true);
                        if ($.fn.postitall.globals.enabledFeatures.resizable && options.features.resizable) {
                            if ($.ui) $('#idPostIt_' + id).parent().resizable("enable");
                        }
                        if ($.fn.postitall.globals.enabledFeatures.draggable && options.features.draggable) {
                            if ($.ui) $('#idPostIt_' + id).parent().draggable("enable");
                            $('#pia_toolbar_'+index.toString()).css('cursor', 'move');
                        }
                        //toolbar
                        $('#pia_config_'+index.toString()).show();
                        $('#pia_fixed_'+index.toString()).show();
                        $('#pia_delete_'+index.toString()).show();
                        $('#pia_minimize_'+index.toString()).show();
                        $('#PIApostit_' + index + ' > .ui-resizable-handle').show();
                        hoverOptions(index, true);

                        options.features.blocked = false;
                    }
                    obj.data('PIA-options', options);
                    save($('#idPostIt_' + id).parent());
                    e.preventDefault();
                })
            );
        }


        //Front page: content
        var content = $('<div />', {
            'id': 'pia_editable_' + index.toString(),
            'class': 'PIAeditable PIAcontent'
        }).change(function () {
            options.postit.content = $(this).html();
            obj.data('PIA-options', options);
            autoresize(obj);
            save(obj);
        }).attr('contenteditable', true).html(options.postit.content);
        //Front page
        var front = $('<div />', {
            'class': 'PIAfront'
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
                $('#idPostIt_' + id + ' > .PIAfront').css('visibility', 'visible');
                $('#idPostIt_' + id).parent().removeClass('PIAflip', function () {
                    $('#idPostIt_' + id + ' > .PIAback').css('visibility', 'hidden');
                });
                if($.fn.postitall.globals.enabledFeatures.resizable && $.ui) $('#idPostIt_' + id).parent().resizable("enable");
                if($.fn.postitall.globals.enabledFeatures.draggable && $.ui) $('#idPostIt_' + id).parent().draggable("enable");
                hoverOptions(id, true);
                e.preventDefault();
            })
        )
        .append($('<span />', {
                'class': 'float-left minicolors_label',
                'style': 'line-height:10px;padding-left: 5px;font-size: smaller;'
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
            'width': '75px',
            'value': options.style.backgroundcolor,
            'data-default-value': options.style.backgroundcolor
        });
        //Text color
        var tcLabel = $('<label />', {
            'class': 'minicolors_label',
            'for': 'minicolors_text_' + index
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
            'checked': checked
        });
        var tsLabel = $('<label />', {
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
            'for': 'generalstyle_' + index,
        }).append(gsString).append(' 3D style');

        content = $('<div />', { 'class': 'PIAcontent'})
            .append(bgLabel).append(bgString) // Bg color
            .append(gsLabel)  // 3d or plain style
            .append(tcLabel).append(tcString) // Text color
            .append(tsLabel);  // Text shadow

        //Back page
        var back = $('<div />', {
            'class': 'PIAback',
            'style': 'visibility: hidden;'
        })
        .append(toolbar)
        .append(content);

        //Create postit
        var postit = $('<div />', { 'id': 'idPostIt_' + index.toString(), 'data-id': index });
        //Add front
        postit.append(front);

        //Add back
        if($.fn.postitall.globals.enabledFeatures.changeoptions && options.features.changeoptions)
            postit.append(back);

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
            .addClass('PIApostit ' + (options.style.tresd ? ' PIApanel ' : ' PIAplainpanel ')
                + (options.postit.position == "fixed" ? ' fixed ' : ''))
            .css('position', options.postit.position)
            .css('top', options.postit.posX)
            .css('width', options.postit.width + 'px')
            .css('height', (options.postit.height) + 'px') //Increase 30 pixels for the toolbar
            .css('background-color', options.style.backgroundcolor)
            .css('color', options.style.textcolor)
            .css('font-family', options.style.fontfamily)
            .css('font-size', options.style.fontsize);
        if (options.postit.right !== "") {
            obj.css('right', options.postit.right);
            //options.postit.right = "";
        } else {
            obj.css('left', options.postit.posY)
        }
        if (options.style.textshadow) {
            obj.addClass(getTextShadowStyle(options.style.textcolor));
        } else {
            obj.addClass('dosd');
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
                $('.PIApostit').css('z-index', 999995);
                $(this).css('z-index', 999999);
            });
        if ($.ui) {
            if ($.fn.postitall.globals.enabledFeatures.draggable && options.features.draggable) {
                obj.draggable({
                    handle: ".PIApostit",
                    scroll: false,
                    start: function () {
                        //Remove draggable postit option
                        $('.PIApostit').css('z-index', 999995);
                        $(this).css('z-index', 999999);
                        $(this).draggable('disable');
                    },
                    stop: function () {
                        //Enable draggable postit option
                        $(this).draggable('enable');
                        autoresize($(this));
                        options.postit.right = '';
                        if ($.fn.postitall.globals.enabledFeatures.savable && options.features.savable) {
                            if(!options.features.minimized) {
                                options.postit.posX = obj.css('top');
                                options.postit.posY = obj.css('left');
                                options.postit.oldPosition.leftMinimized = undefined;
                            } else {
                                options.postit.oldPosition.leftMinimized = obj.css('left');
                            }
                            saveOptions(options);
                        }
                    }
                });
            }
            if ($.fn.postitall.globals.enabledFeatures.resizable &&  options.features.resizable) {
                var pos = false;
                obj.resizable({
                    animate: true,
                    helper: 'ui-resizable-helper',
                    minHeight: options.postit.minHeight,
                    minWidth: options.postit.minWidth,
                    stop: function () {
                        setTimeout(function() {
                            autoresize(obj);
                            options.postit.right = '';
                            if ($.fn.postitall.globals.enabledFeatures.savable && options.features.savable) {
                                options.postit.posX = obj.css('top');
                                options.postit.posY = obj.css('left');
                                saveOptions(options);
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
        if($.fn.postitall.globals.enabledFeatures.minimized && options.features.minimized) {
            options.features.minimized = false;
            $('#pia_minimize_' + options.postit.id).click();
        }
        //Postit bloqued?
        if($.fn.postitall.globals.enabledFeatures.blocked && options.features.blocked) {
            options.features.blocked = false;
            $('#pia_blocked_' + options.postit.id).click();
        }
        //Show postit
        obj.slideDown('slow', function () {
            //Rest of actions
            //Config: text shadow
            $('#textshadow_' + index).click(function () {

                if ($(this).is(':checked')) {
                    $(this).closest('.PIApostit').find('.PIAcontent').addClass(getTextShadowStyle($('#minicolors_text_' + index).val())).removeClass('dosd');
                    options.style.textshadow = true;
                } else {
                    $(this).closest('.PIApostit').find('.PIAcontent').addClass('dosd').removeClass('tresd').removeClass('tresdblack');
                    options.style.textshadow = false;
                }
                setOptions(options, true);
            });
            //3d or plain
            $('#generalstyle_' + index).click(function () {
                if ($(this).is(':checked')) {
                    $('#idPostIt_' + index).parent().removeClass('PIAplainpanel').addClass('PIApanel');
                    options.style.tresd = true;
                } else {
                    $('#idPostIt_' + index).parent().removeClass('PIApanel').addClass('PIAplainpanel');
                    options.style.tresd = false;
                }
                setOptions(options, true);
            });
            //Background and text color
            if ($.minicolors) {
                //Config: change background-color
                $('#minicolors_bg_' + index).minicolors({
                    change: function (hex) {
                        $('#PIApostit_' + index).css('background-color', hex);
                        options.style.backgroundcolor = hex;
                        setOptions(options, true);
                    }
                });
                //Config: text color
                $('#minicolors_text_' + index).minicolors({
                    change: function (hex) {
                        $('#PIApostit_' + index).css('color', hex);
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

            //Autoresize to fit content when content load is done
            //console.log('autoresize');
            autoresize(obj);
        });

        //Hover options
        if(!options.features.minimized && !options.features.blocked)
            hoverOptions(index, true);

        //disable draggable on mouseenter in contenteditable div
        $("#pia_editable_" + index).mouseenter(function (e) {
            if($.fn.postitall.globals.enabledFeatures.draggable && $.ui)
                obj.draggable({disabled: true});
        }).mouseleave(function(e) {
            if($.fn.postitall.globals.enabledFeatures.draggable && $.ui && !options.features.blocked)
                obj.draggable({disabled: false});
        });

        //Stop key propagation on contenteditable
        $("#pia_editable_" + index).keydown(function (e) {
            e.stopPropagation();
        });

        //Save in storage
        saveOptions(options);

        //chaining
        return obj;
    }

    function hoverOptions(index, enabled) {

        if(!$.fn.postitall.globals.enabledFeatures.autoHideToolBar)
            return;

        var fadeInTime = 300;
        var fadeOuTime = 700;

        if(enabled) {
            //Options
            $( "#PIApostit_" + index ).hover(function() {
                    $(this).find('#pia_toolbar_' + index + ' > .PIAicon').fadeTo(fadeInTime, 1);
                    $('#PIApostit_' + index + ' > .ui-resizable-handle').fadeTo(fadeInTime, 1);
            }, function() {
                    $(this).find('#pia_toolbar_' + index + ' > .PIAicon').fadeTo(fadeOuTime, 0);
                    $('#PIApostit_' + index + ' > .ui-resizable-handle').fadeTo(fadeOuTime, 0);
            });
            $( "#pia_toolbar_" + index + ' > .PIAicon').fadeTo(fadeOuTime, 0);
            $('#PIApostit_' + index + ' > .ui-resizable-handle').fadeTo(fadeOuTime, 0);
        } else {
            //Options
            $( "#PIApostit_" + index ).unbind('mouseenter mouseleave');
            $( "#pia_toolbar_" + index + ' > .PIAicon').fadeTo(fadeInTime, 1);
        }
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
        //obj id
        obj.attr('id', 'PIApostit_' + opt.postit.id);
        //create stuff
        return create(obj, opt.postit.id, opt);
    }

    function getRandomColor() {
        if($.fn.postitall.globals.enabledFeatures.randomColor && $.fn.postitall.defaults.features.randomColor) {
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
        if($.fn.postitall.globals.enabledFeatures.randomColor && $.fn.postitall.defaults.features.randomColor) {
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

    function getTextShadowStyle(hexcolor) {
        //console.log(hexcolor);
        var nThreshold = 105;
        var components = getRGBComponents(hexcolor);
        var bgDelta = (components.R * 0.299) + (components.G * 0.587) + (components.B * 0.114);
        return ((255 - bgDelta) < nThreshold) ? "tresdblack" : "tresd";
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
        enabledFeatures : {
            filter          : 'domain',      // domain, page, all
            draggable       : true,         //Set draggable feature on or off
            resizable       : true,         //Set resizable feature on or off
            removable       : true,         //Set removable feature on or off
            changeoptions   : true,         //Set options feature on or off
            savable         : true,        //Save postit in storage
            blocked         : true,        //Postit can not be modified
            minimized       : true,        //true = minimized, false = maximixed
            addNew          : true,        //Create a new postit
            fixed           : true,
            randomColor     : true,         //Random color in new postits
            autoHideToolBar : true,         //Animation efect on hover over postit shoing/hiding toolbar options
            askOnDelete     : true,         //Confirmation before note remove
        }
    };
    $.fn.postitall.defaults = {
        style : {
            tresd           : true,         //General style in 3d format
            backgroundcolor : '#FFFC7F',    //Background color in new postits when randomColor = false
            textcolor       : '#333333',    //Text color
            textshadow      : true,         //Shadow in the text
            fontfamily      : 'verdana',    //Default font
            fontsize        : 'small',
        },
        features : {
            draggable       : true,         //Set draggable feature on or off
            resizable       : true,         //Set resizable feature on or off
            removable       : true,         //Set removable feature on or off
            changeoptions   : true,         //Set options feature on or off
            savable         : false,        //Save postit in storage
            blocked         : false,        //Postit can not be modified
            minimized       : false,        //true = minimized, false = maximixed
            randomColor     : true,         //Random color in new postits
            addNew          : false,        //Create a new postit
            fixed           : false,        //Position fixed
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
            right           : '',                           //right position
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
        onRelease: function () { return undefined; },
        onDelete: function () { return undefined; }
    };

    // Default Plugin Vars
    //$.fn.postitall.defaults = $.extend({}, $.fn.postitall.globals);
    //$.fn.postitall.defaults.storage = undefined;
    //$.fn.postitall.defaults.enabledFeatures = undefined;

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
            if($.fn.postitall.globals.enabledFeatures.randomColor && options.features.randomColor) {
                options.style.backgroundcolor = getRandomColor();
                options.style.textcolor = getTextColor(options.style.backgroundcolor);
                options.features.randomColor = false;
            }
            //Create div
            //var PIAcontent = $('<div />', { 'id' : 'newPostIt_' + options.postit.id });
            //obj.append(PIAcontent);
            //Initialize
            init(obj, options);
            if(callback !== undefined) callback();
        } else {
            //Get new id
            //console.log('paso');
            getIndex(($.fn.postitall.globals.enabledFeatures.savable && options.features.savable), function(index) {
                //console.log('getIndex.final', index);
                //Random bg & textcolor
                if($.fn.postitall.globals.enabledFeatures.randomColor && options.features.randomColor) {
                    options.style.backgroundcolor = getRandomColor();
                    options.style.textcolor = getTextColor(options.style.backgroundcolor);
                    options.features.randomColor = false;
                }
                options.postit.id = index;
                //Create div
                //var PIAcontent = $('<div />', { 'id' : 'newPostIt_' + index });
                //obj.append(PIAcontent);
                //Initialize
                init(obj, options);
                //Set focus
                $( "#pia_editable_" + index ).focus();
                //Callback
                if(callback !== undefined) callback();
            });
        }
    };

    $.testPIA = function() {
        reorderIndex();
    };

    $.getAllStorage = function (callback) {
        storageManager.getAll(function(results) {
            console.log('storage results', reuslts);
        });
    }

    //Load Local Storage Postits
    $.loadPostItAll = function (callback, onChange, onDelete) {
        //console.log('$.loadPostItAll');
        var len = -1;
        var iteration = 0;
        var finded = false;
        storageManager.getlength(function(len) {
            if(!len) {
                callback();
                return;
            }
            for (var i = 1; i <= len; i++) {
              storageManager.key(i, function(key) {
                storageManager.getByKey(key, function(o) {
                  if (o != null && $('#id' + key).length <= 0) {
                    if($.fn.postitall.globals.enabledFeatures.filter == "domain")
                      finded = (o.postit.domain === window.location.origin);
                    else if($.fn.postitall.globals.enabledFeatures.filter == "page")
                      finded = (o.postit.domain === window.location.origin && o.postit.page === window.location.pathname);
                    else
                      finded = true;
                    if(finded) {
                        o.onChange = onChange;
                        o.onDelete = onDelete;
                        $.newPostItAll(o);
                    }
                  }
                  if(iteration == (len - 1) && callback != null) {
                      callback();
                      callback = null;
                  }
                  iteration++;
                });
              });
            }
        });
    };

    //Save Local Storage Postits
    $.savePostItAll = function () {
        //console.log('$.savePostItAll');
        $('.PIApostit').each(function () {
            options = $(this).data('PIA-options');
            if($.fn.postitall.globals.enabledFeatures.savable && options.features.savable) {
                $(this).postitall('save');
            }
        });
    };

    //Hide
    $.hidePostItAll = function () {
        //console.log('$.hidePostItAll');
        $('.PIApostit').each(function () {
            $(this).postitall('hide');
        });
    }

    //Get number of postits
    $.lengthPostItAll = function(callback) {
        //console.log('$.lengthPostItAll');
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
    }

    //Remove all postits
    $.removePostItAll = function () {
        console.log('$.removePostItAll');
        $('.PIApostit').each(function () {
            $(this).postitall('destroy');
        });
        storageManager.clear(function() {
            console.log("Storage cleared");
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
