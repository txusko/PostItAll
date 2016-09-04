$(document).ready(function() {

    doNotPress();

    var globalsModified = false;

    function randomIntFromInterval(min,max) {
        return Math.floor(Math.random()*(max-min+1)+min);
    }

    //Fix left menu
    var scrollDoc = function() {
        var scrollPosition = [
            self.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
            self.pageYOffset || document.documentElement.scrollTop  || document.body.scrollTop
        ];
        var magicNumber = 25;
        var newPos = scrollPosition[1] - $('#home').height() + magicNumber;
        var barHeight = $('.fixit').innerHeight();
        var footerHeight = $('#idSource').innerHeight() + $('#idAbout').innerHeight() + $('#idFooter').innerHeight();
        if((scrollPosition[1] + $(window).height()) > $('#idSource').offset().top) {
            //Raised bottom div
            //newPos = newPos - ((scrollPosition[1] + $(window).height()) - $('#idSource').offset().top);
            newPos = $(document).height() - $(window).height() - footerHeight - barHeight + (magicNumber + $('idNavBar').innerHeight());
        }
        //console.log('newPos', newPos);
        if(scrollPosition[1] > ($('#home').height() - magicNumber))
            $('.fixit').css('top', newPos);
        else
            $('.fixit').css('top', '');
    };
    $( window ).scroll(function() {
        scrollDoc();
    });
    scrollDoc();

    //Create a bunch of visible notes
    $('#idCreateBunch').click(function(e) {
        var min = 4, max = 8;
        var noteNumber = randomIntFromInterval(min, max);
        var posX = 10, posY = 10;
        //console.log($(window).height(), $(window).width());
        for(i=min;i<=max;i++) {
            posX = randomIntFromInterval(0, $(window).width() - $.fn.postitall.defaults.width);
            posY = randomIntFromInterval(0, $(window).height() - $.fn.postitall.defaults.height);
            //console.log(posX, posY);
            $.PostItAll.new({
                position: 'relative',
                posX: posX,
                posY: posY
            });
        }
        e.preventDefault();
    })

    //Get coords on mouse click
    $('#idGetCoord').click(function() {
        $('*').css('cursor','crosshair');
        setTimeout(function() {
            var handler = function(e) {
                $('*').css('cursor','');
                if($('#idPosition').val() == "absolute") {
                    $('#idPosX').val(e.clientX + parseInt(window.pageXOffset, 10));
                    $('#idPosY').val(e.clientY + parseInt(window.pageYOffset, 10));
                } else {
                    $('#idPosX').val(e.clientX);
                    $('#idPosY').val(e.clientY);
                }
                document.body.removeEventListener('click', handler, true);
                e.stopImmediatePropagation();
                e.stopPropagation();
                e.preventDefault();
                updateNoteExample();
            };
            document.body.addEventListener('click', handler, true);
        }, 200);
    });

    //Example: Change global features
    var updateGlobalExample = function() {
        var content = "$.PostItAll.changeConfig('global', {\n";
        var ides = ["idRandomColor", "idChangeOptions", "idAllowBlock", "idAllowMinimize", "idAllowExpand", "idAddNew", "idAllowFix",
            "idHideToolbar", "idAskOnDelete", "idShowInfo", "idPasteHtml", "idHtmlEditor", "idAutoPosition", "idResizable",
            "idToolbar", "idRemovable", "idAskOnHide", "idShowMeta", "idExport", "idDraggable", "idEditable"];
        var props = ["randomColor", "changeoptions", "blocked", "minimized", "expand", "addNew", "fixed",
            "autoHideToolBar", "askOnDelete", "showInfo", "pasteHtml", "htmlEditor", "autoPosition", "resizable",
            "toolbar", "removable", "askOnHide", "showMeta", "exportNote", "draggable", "editable"];
        $.each(ides, function(a,b) {
            if(!$('#'+b).prop('checked'))
                content += "    " + props[a] + " : " + $('#'+b).prop('checked').toString() + ",\n";
        });
        content += "    addArrow : '" + $('#idPosArrow').val().toString() + "',\n";
        content += "});\n"
        $('#idGlobalExample').html(content).removeClass('prettyprinted');
        prettyPrint();
    };
    updateGlobalExample();
    $('.feature').click(function() {
        updateGlobalExample();
    });
    $('#idPosArrow').change(function() {
        updateGlobalExample();
    });
    $('#idCheckAll').click(function() {
        $('.feature').prop('checked', this.checked);
        if(this.checked)
            $('#idPosArrow').val('all');
        else
            $('#idPosArrow').val('none');
    });

    //Change global features
    $('#idNewNoteFeatures').click(function(e) {
        $.PostItAll.changeConfig('global', {
            randomColor     : $('#idRandomColor').prop('checked'),
            changeoptions   : $('#idChangeOptions').prop('checked'),
            blocked         : $('#idAllowBlock').prop('checked'),
            minimized       : $('#idAllowMinimize').prop('checked'),
            expand          : $('#idAllowExpand').prop('checked'),
            addNew          : $('#idAddNew').prop('checked'),
            fixed           : $('#idAllowFix').prop('checked'),
            autoHideToolBar : $('#idHideToolbar').prop('checked'),
            askOnDelete     : $('#idAskOnDelete').prop('checked'),
            showInfo        : $('#idShowInfo').prop('checked'),
            pasteHtml       : $('#idPasteHtml').prop('checked'),
            htmlEditor      : $('#idHtmlEditor').prop('checked'),
            autoPosition    : $('#idAutoPosition').prop('checked'),
            resizable       : $('#idResizable').prop('checked'),
            addArrow        : $('#idPosArrow').val(),
            toolbar         : $('#idToolbar').prop('checked'),
            removable       : $('#idRemovable').prop('checked'),
            askOnHide       : $('#idAskOnHide').prop('checked'),
            showMeta        : $('#idShowMeta').prop('checked'),
            exportNote      : $('#idExport').prop('checked'),
            draggable       : $('#idDraggable').prop('checked'),
            editable        : $('#idEditable').prop('checked'),
        });
        if($('#idCreateNewNote').prop('checked')) {
            $.PostItAll.new('Global configuration was updated successfully');
        } else {
            alert('Global configuration was updated successfully');
        }
        globalsModified = true;
        if($('#idAddCodeFeatures').prop('checked'))
            $('#idAddCodeFeatures').click();
    });

    //Restores global features
    $('#idRestoreFeatures').click(function(e) {
        $('#idCheckAll').prop('checked', false).click();
        $.PostItAll.restoreConfig('global');
        globalsModified = false;
        alert('Global configuration restored to factory defaults');
        e.preventDefault();
    });

    //Example Run the code 1
    $('#idRunTheCode').click(function(e) {
        $.PostItAll.new('<p style="text-align:center">Hello <b>world</b></p>');
        e.preventDefault();
    });

    //Example Run the code 2
    $('#idRunTheCode2').click(function(e) {
        $('.notes').postitall('new', {}, function(a,b,c) {
            console.log(a,b,c);
        });
        $(this).hide();
        e.preventDefault();
    });

    //Example : Hide/Show/Remove all
    $('#idHideAll').click(function(e) {
        $.PostItAll.hide();
        e.preventDefault();
    });
    $('#idShowAll').click(function(e) {
        $.PostItAll.show();
        e.preventDefault();
    });
    $('#idDeleteAll').click(function(e) {
        $.PostItAll.remove();
        e.preventDefault();
    });

    //Example : Hide/Show/Remove specific note
    var idNewNote = null;
    $('#newNote1, #newNote2').click(function(e) {
        if(idNewNote != null) {
            $.PostItAll.destroy(idNewNote);
            idNewNote = null;
        }
        $.PostItAll.new({
            content: 'This is a <b>new</b> note!',
            onCreated: function(id, options, obj) {
                idNewNote = id;
                $('#idGetCreated').click();
            },
            onDelete: function() {
                idNewNote = null;
            }
        });
        e.preventDefault();
    });
    //Show note
    $('#idShowCreated').click(function(e) {
        $.PostItAll.show(idNewNote);
        e.preventDefault();
    });
    //Hide note
    $('#idHideCreated').click(function(e) {
        $.PostItAll.hide(idNewNote);
        e.preventDefault();
    });
    //Delete note
    $('#idDeleteCreated').click(function(e) {
        $.PostItAll.remove(idNewNote);
        e.preventDefault();
    });

    //Example : Get and View options
    $('#idGetCreated').click(function(e) {
        if(idNewNote != null) {
            var options = $(idNewNote).postitall('options');
            $('#idDivOptions').text(JSON.stringify(options));
            //$('#idDivOptions').text($.PostItAll.options(idNewNote));
        }
        e.preventDefault();
    });
    //Example : Change options
    $('#idSetCreated').click(function(e) {
        if(idNewNote != null) {
            var options = {
                content: "Modified content by set options",
                style: {
                    textcolor : "#fcf800",
                    backgroundcolor : "#ff0000",
                },
            };
            $('#idDivOptions').text('');
            //$(idNewNote).postitall('options', options);
            $.PostItAll.options(idNewNote, options);
        }
        e.preventDefault();
    });

    //Example : Attach a note to an element
    var idAttachedNote = null;
    var updateAttachedtoExample = function() {
        var content = "$.PostItAll.new(content, {\n";
        content += "    attachedTo : {\n";
        content += "        element: '#divToAttach',\n";
        content += "        position: '" + $('#idSelectPosition').val().toString() + "',\n";
        content += "        arrow: " + $('#idWithArrow').prop('checked').toString()+",\n";
        content += "        fixed: " + $('#idFixedTo').prop('checked').toString()+"\n";
        content += "    }\n";
        content += "});\n";
        //Prettyprint
        $('#idAttachToExample').html(content).removeClass('prettyprinted');
        prettyPrint();
    };
    updateAttachedtoExample();
    $('#idButtonToAttach').click(function() {
        var divId = '#divToAttach'
        var position = $('#idSelectPosition').val();
        var arrow = $('#idWithArrow').prop('checked');
        var fixed = $('#idFixedTo').prop('checked');
        var content = "<p style='text-align:center;font-size:medium;'>";
        content += "This note is attached to the " + position + " of the " + divId + " element.<br>";
        if(arrow)
            content += "With arrow";
        else
            content += "Without arrow";
        content += "</p>";

        if(idAttachedNote == null) {
            $.PostItAll.new(content, {
                attachedTo : { element: divId, position: position, arrow: arrow, fixed: fixed },
                onCreated: function(id) {
                    idAttachedNote = id;
                },
                onDelete: function() {
                    idAttachedNote = null;
                }
            });
        } else {
            $(idAttachedNote).postitall('options', {
                content : content,
                style : { arrow : 'none' },
                attachedTo : { element: divId, position: position, arrow: arrow }
            });
        }
        updateAttachedtoExample();
    });
    $('#idSelectPosition, #idFixedTo, #idWithArrow').change(function() {
        updateAttachedtoExample();
    })

    //Example : work with events
    var i = 1;
    $('#idButtonEvents').click(function(e) {
        var getDescription = function(called, id) {
            var content =  $('#idDivEvents').html() + "<br>" + i.toString() + " - Called <b>" + called + "</b> for note with id <b>" + id + "</b>";
            $('#idDivEvents').html(content);
            $('#idDivEvents').scrollTop(Math.pow(10,9));
            i++;
        };
        $.PostItAll.new({
            content : 'This note have all the <b>events</b> defined',
            onCreated: function(id, options, obj) {
                getDescription("onCreated", id);
            },
            onChange: function(id) {
                getDescription("onChange", id);
            },
            onSelect: function(id) {
                getDescription("onSelect", id);
            },
            onDblClick: function(id) {
                getDescription("onDblClick", id);
            },
            onRelease: function(id) {
                getDescription("onRelease", id);
            },
            onDelete: function(id) {
                getDescription("onDelete", id);
            }
        });
        e.preventDefault();
    });

    //Note with defined options
    //Postit: note size
    var abmpostitwidth = 160;
    var abmpostitheight = 200;
    $('#idNoteSize').change(function() {
        var noteSize = $(this).val();
        //console.log('noteSize', noteSize);
        $('#idNoteWidth').prop('disabled', true);
        $('#idNoteHeight').prop('disabled', true);
        switch(noteSize) {
            case 'small':
                abmpostitwidth = 160;
                abmpostitheight = 200;
            break;
            case 'small_square':
                abmpostitwidth = 200;
                abmpostitheight = 200;
            break;
            case 'medium':
                abmpostitwidth = 208;
                abmpostitheight = 260;
            break;
            case 'medium_square':
                abmpostitwidth = 260;
                abmpostitheight = 260;
            break;
            case 'large':
                abmpostitwidth = 256;
                abmpostitheight = 320;
            break;
            case 'large_square':
                abmpostitwidth = 320;
                abmpostitheight = 320;
            break;
            case 'big':
                abmpostitwidth = 320;
                abmpostitheight = 400;
            break;
            case 'big_square':
                abmpostitwidth = 400;
                abmpostitheight = 400;
            break;
            case 'custom':
                $('#idNoteWidth').prop('disabled', false);
                $('#idNoteHeight').prop('disabled', false);
            break;
            default:
                abmpostitwidth = "";
                abmpostitheight = "";
            break;
        }
        $('#idNoteWidth').val(abmpostitwidth.toString());
        $('#idNoteHeight').val(abmpostitheight.toString());
    });
    $('#idNoteSize').change();
    //Note width
    $('#idNoteWidth').change(function() {
        var newVal = parseInt($(this).val(), 10);
        if(isNaN(newVal) || newVal < $.fn.postitall.defaults.minWidth) {
            newVal = $.fn.postitall.defaults.minWidth;
        } else if(isNaN(newVal) || newVal > 640) {
            newVal = 640;
        }
        $(this).val(newVal);
        $('#idNoteWidth').val(newVal);
    });
    //Note height
    $('#idNoteHeight').change(function() {
        var newVal = parseInt($(this).val(), 10);
        if(isNaN(newVal) || newVal < $.fn.postitall.defaults.minHeight) {
            newVal = $.fn.postitall.defaults.minHeight;
        } else if(isNaN(newVal) || newVal > 640) {
            newVal = 640;
        }
        $(this).val(newVal);
        $('#idNoteHeight').val(newVal);
    });

    //Style
    $('#idRandomColor2').click(function() {
        if(this.checked) {
            $('#idBgTextColor').prop('disabled', true);
            $('#idTextColor').prop('disabled', true);
        } else {
            $('#idBgTextColor').prop('disabled', false);
            $('#idTextColor').prop('disabled', false);
        }
    });
    if ($.minicolors) {
        //Bg color
        $('#idBgTextColor').attr('value', $.fn.postitall.defaults.style.backgroundcolor).minicolors();
        //Text color
        $('#idTextColor').attr('value', $.fn.postitall.defaults.style.textcolor).minicolors();
    }
    //Position
    $('#idPosition').change(function() {
        $('#idGetCoord').prop('disabled', false);
        switch($(this).val()) {
            case "absolute":
                $('#idPosX').val(parseInt(window.pageXOffset, 10) + 10);
                $('#idPosY').val(parseInt(window.pageYOffset, 10) + 10);
            break;
            case "fixed":
                $('#idFixedPosition').prop('checked', true);
            case "relative":
                $('#idPosX').val('');
                $('#idPosY').val('');
            break;
            default:
                $('#idGetCoord').prop('disabled', true);
                $('#idPosX').val('');
                $('#idPosY').val('');
            break;
        }
    });

    var changePropFlag = function(checked, divId) {
        if(!checked)
            $(''+divId).prop('checked', false).prop('disabled', true);
        else
            $(''+divId).prop('disabled', false);
    };
    $('#idAllowBlock2').click(function() {
        changePropFlag(this.checked, '#idBlocked');
    });
    $('#idAllowFix2').click(function() {
        changePropFlag(this.checked, '#idFixedPosition');
    });
    $('#idAllowMinimize2').click(function() {
        changePropFlag(this.checked, '#idMinimized');
    });
    $('#idAllowExpand2').click(function() {
        changePropFlag(this.checked, '#idExpanded');
    });
    $('#idMinimized').click(function() {
        if(this.checked) {
            $('#idExpanded').prop('checked', false);
            $('#idHighlited').prop('checked', false);
        }
    });
    $('#idExpanded').click(function() {
        if(this.checked) {
            $('#idMinimized').prop('checked', false);
            $('#idHighlited').prop('checked', false);
        }
    });
    $('#idHighlited').click(function() {
        if(this.checked) {
            $('#idExpanded').prop('checked', false);
            $('#idMinimized').prop('checked', false);
        }
    });

    //Create new note example code on the fly
    var updateNoteExample = function() {
        var content = "";
        //Properties
        if($('#idContent').val() != "")
            content += " content : '" + $('#idContent').val().toString() + "',\n";
        if($('#idPosition').val() != "")
            content += " position : '" + $('#idPosition').val().toString() + "',\n";
        if($('#idNoteWidth').val() != "")
            content += " width : " + $('#idNoteWidth').val().toString() + ",\n";
        if($('#idNoteHeight').val() != "")
            content += " height : " + $('#idNoteHeight').val().toString() + ",\n";
        if($('#idPosX').val() != "")
            content += " posX : " + $('#idPosX').val().toString() + ",\n";
        if($('#idPosY').val() != "")
            content += " posY : " + $('#idPosY').val().toString() + ",\n";

        //Style
        if($('#idAddCodeStyle').prop('checked')) {
            $('.addCodeStyle').show();
            content += " style : {\n";
                if(!$('#idRandomColor2').prop('checked')) {
                    content += "    backgroundcolor : '" + $('#idBgTextColor').val().toString() + "',\n";
                    content += "    textcolor       : '" + $('#idTextColor').val().toString() + "',\n";
                }
                content += "    tresd           : " + $('#idGeneralStyle').prop('checked').toString() + ",\n";
                content += "    fontfamily      : '" + $('#idFontFamily').val().toString() + "',\n";
                content += "    fontsize        : '" + $('#idFontSize').val().toString() + "',\n";
                content += "    textshadow      : " + $('#idTextShadow').prop('checked').toString() + ",\n";
                content += "    arrow           : '" + $('#idArrow').val().toString() + "',\n";
            content += " },\n";
        } else {
            $('.addCodeStyle').hide();
        }

        //Flags
        if($('#idAddCodeFlags').prop('checked')) {
            $('.addCodeFlags').show();
            if($('#idBlocked').prop('checked') || $('#idMinimized').prop('checked') || $('#idExpanded').prop('checked')
            || $('#idFixedPosition').prop('checked') || $('#idHighlited').prop('checked')) {
                content += " flags : {\n";
                    if($('#idBlocked').prop('checked'))         content += "    blocked         : " + $('#idBlocked').prop('checked').toString() + ",\n";
                    if($('#idMinimized').prop('checked'))       content += "    minimized       : " + $('#idMinimized').prop('checked').toString() + ",\n";
                    if($('#idExpanded').prop('checked'))        content += "    expand          : " + $('#idExpanded').prop('checked').toString() + ",\n";
                    if($('#idFixedPosition').prop('checked'))   content += "    fixed           : " + $('#idFixedPosition').prop('checked').toString() + ",\n";
                    if($('#idHighlited').prop('checked'))       content += "    highlight       : " + $('#idHighlited').prop('checked').toString() + ",\n";
                content += " },\n";
            }
        } else {
            $('.addCodeFlags').hide();
        }

        //Features
        if($('#idAddCodeFeatures').prop('checked')) {
            if(globalsModified) {
                if(confirm('To use the note features, all global features must be enabled. Reset globals to default?')) {
                    $.PostItAll.restoreConfig('global');
                    globalsModified = false;
                } else {
                    $('#idAddCodeFeatures').prop('checked', false);
                }
            }

            if(!globalsModified) {
                $('.addCodeFeatures').show();
                content += " features : {\n";
                    var ides = ["idRandomColor2", "idChangeOptions2", "idAllowBlock2", "idAllowMinimize2", "idAllowExpand2", "idAddNew2", "idAllowFix2",
                        "idHideToolbar2", "idAskOnDelete2", "idShowInfo2", "idPasteHtml2", "idHtmlEditor2", "idAutoPosition2", "idResizable2", "idToolbar2", "idRemovable2"];
                    var props = ["randomColor", "changeoptions", "blocked", "minimized", "expand", "addNew", "fixed",
                        "autoHideToolBar", "askOnDelete", "showInfo", "pasteHtml", "htmlEditor", "autoPosition", "resizable", "toolbar", "removable"];
                    $.each(ides, function(a,b) {
                        //console.log(props[a],b);
                        if(!$('#'+b).prop('checked'))
                            content += "    " + props[a] + " : " + $('#'+b).prop('checked').toString() + ",\n";
                    });
                    content += "    addArrow : '" + $('#idPosArrow2').val().toString() + "',\n";
                content += " },\n";
            }
        } else {
            if(!$('#idRandomColor2').prop('checked')) {
                content += " features : {\n";
                    content += "    randomColor     : " + $('#idRandomColor2').prop('checked').toString() + ",\n";
                content += " },\n";
            }
            $('.addCodeFeatures').hide();
        }

        if(content != "") {
            content = "$.PostItAll.new({\n" + content + "});\n";
        } else {
            content = "$.PostItAll.new();\n";
        }

        //Prettyprint
        $('#idNoteExample').html(content).removeClass('prettyprinted');
        var configContent = content.replace("new({", "changeConfig('note', {");
        $('#idConfigNoteExample').html(configContent).removeClass('prettyprinted');
        prettyPrint();
    };
    $('.feature2').click(function() {
        updateNoteExample();
    });
    $('#idContent, #idPosition, #idPosX, #idPosY, #idNoteSize, #idNoteWidth, #idNoteHeight, #idBgTextColor, #idTextColor, #idFontFamily, #idFontSize, #idPosArrow2').change(function() {
        updateNoteExample();
    });
    updateNoteExample();

    //Change note configuration
    $('#idSaveNoteConfig').click(function() {
        var execContent = $('#idConfigNoteExample').text();
        eval(execContent);
        alert('Note configuration saved!');
    });
    $('#idRestoreNoteConfig').click(function() {
        $.PostItAll.restoreConfig('note');
        alert('Note configuration restored!');
    });

    //Create a new customized note
    $('#idNewNoteFeatures2').click(function(e) {
        //Content
        var vars = {
            content: $('#idContent').val()
        };
        if($('#idPosition').val() != "") {
            vars.position = $('#idPosition').val();
        }
        if($('#idPosX').val() != "") {
            vars.posX = $('#idPosX').val();
        }
        if($('#idPosY').val() != "") {
            vars.posY = $('#idPosY').val();
        }
        if($('#idNoteWidth').val() != "") {
            vars.width = $('#idNoteWidth').val();
        }
        if($('#idNoteHeight').val() != "") {
            vars.height = $('#idNoteHeight').val();
        }
        //Style
        if($('#idAddCodeStyle').prop('checked')) {
            vars.style = {
                randomColor: $('#idRandomColor2').prop('checked'),
                tresd: $('#idGeneralStyle').prop('checked'),
                fontfamily: $('#idFontFamily').val(),
                fontsize: $('#idFontSize').val(),
                textshadow: $('#idTextShadow').prop('checked'),
                arrow: $('#idArrow').val(),
            };
        }
        if(!$('#idRandomColor2').prop('checked')) {
            vars.style.backgroundcolor = $('#idBgTextColor').val();
            vars.style.textcolor = $('#idTextColor').val();
        }
        //Flags
        if($('#idAddCodeFlags').prop('checked')) {
            vars.flags = {
                blocked: $('#idBlocked').prop('checked'),
                minimized: $('#idMinimized').prop('checked'),
                expand: $('#idExpanded').prop('checked'),
                fixed: $('#idFixedPosition').prop('checked'),
                highlight: $('#idHighlited').prop('checked'),
            };
        }
        //Features
        if($('#idAddCodeFeatures').prop('checked')) {
            vars.features = {
                changeoptions   : $('#idChangeOptions2').prop('checked'),
                blocked         : $('#idAllowBlock2').prop('checked'),
                minimized       : $('#idAllowMinimize2').prop('checked'),
                expand          : $('#idAllowExpand2').prop('checked'),
                addNew          : $('#idAddNew2').prop('checked'),
                fixed           : $('#idAllowFix2').prop('checked'),
                autoHideToolBar : $('#idHideToolbar2').prop('checked'),
                askOnDelete     : $('#idAskOnDelete2').prop('checked'),
                showInfo        : $('#idShowInfo2').prop('checked'),
                pasteHtml       : $('#idPasteHtml2').prop('checked'),
                htmlEditor      : $('#idHtmlEditor2').prop('checked'),
                autoPosition    : $('#idAutoPosition2').prop('checked'),
                resizable       : $('#idResizable2').prop('checked'),
                addArrow        : $('#idPosArrow2').val(),
                toolbar         : $('#idToolbar2').prop('checked'),
                removable       : $('#idRemovable2').prop('checked'),
            };
        }
        $.PostItAll.new(vars);
        e.preventDefault();
    });

    //Saved notes events
    var savedEvents = {
        onCreated: function() {
            $('#lenghtNotes').click();
        },
        onDelete: function() {
            $('#lenghtNotes').click();
        }
    }

    //New savable note
    $('#newNote3').click(function(e) {
        $.PostItAll.new($.extend({ features: { savable: true }}, savedEvents, true));
        e.preventDefault();
    });

    //Load all notes
    $('#loadNotes').click(function(e) {
        $.PostItAll.load(null, savedEvents);
        e.preventDefault();
    });

    //Number of saved notes
    $('#lenghtNotes').click(function(e) {
        $.PostItAll.length(function(total) {
            $('#idNumNotes').html(total);
        });
        e.preventDefault();
    });
    $('#lenghtNotes').click();

    //Export all
    $('#idExportAll').click(function(e) {
        $.PostItAll.export();
        e.preventDefault();
    });

    //Import all
    $('#idImportAll').click(function(e) {
        $.PostItAll.import();
        e.preventDefault();
    });

    //Meta data
    $('#idMetaData').click(function(e) {

        $.PostItAll.new({
            meta: {
                'Field of type input': {
                    'type': 'input',
                    'maxlength': '20',
                    'value': '',
                    'placeholder': 'Placeholder for the input field'
                },
                'Field of type combo': {
                    'type': 'combo',
                    'value': '0',
                    'values': {
                        '0': 'Value 0',
                        '1': 'Value 1',
                        '2': 'Value 2'
                    }
                },
                'Field of type textarea': {
                    'type': 'textarea',
                    'value': '',
                    'placeholder': 'Placeholder for the textarea field'
                }
            },
        });

        e.preventDefault();
    });
});
