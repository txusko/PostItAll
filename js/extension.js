$(document).ready(function() {

    doNotPress();

    var lastScrollTop = 0;
    $(window).scroll(function(event){
        var st = $(this).scrollTop();
        //console.log('st',st,$(window).height(), $(document).height(), (st + $(window).height() == $(document).height()));
        if (st <= 300) {
            //on top
            $(idNoteTitle).postitall('show');
            //console.log('top', idNoteTitle);
        } else if (st + $(window).height() > $(document).height() - 50) {
            //on bottom
            $(objNoteBottom).postitall('show');
            paso = true;
        } else if (st > lastScrollTop){
            //scroll down
            $(idNoteTitle).postitall('hide');
            $(objNoteBottom).postitall('hide');
            //console.log('scrollDown', idNoteTitle);
        } else {
            //scroll up
            $(idNoteTitle).postitall('hide');
            $(objNoteBottom).postitall('hide');
        }
        lastScrollTop = st;
    });

    var idNoteTitle = "";
    var objNoteTitle;
    var createNote = function() {
        $.PostItAll.new({
            width: 250,
            content: "<p style='text-align:center;font-size:large;'>Hi and welcome to Post It All!<br><br>Take a look at the documentation but don't forget to <a href=''>install the extension</a> into your browser!!</p>",
            style: {
                tresd: false,
                fontfamily: "'Shadows Into Light', sans-serif",
            },
            features: {
                toolbar: false,
                randomColor: false,
            },
            flags: {
                fixed: true,
                blocked: true
            },
            attachedTo : {
                element: '#idTitle',
                position: 'bottom'
            },
            onDelete : function() {
                createNote();
            }
        }, function(id, options, obj) {
            //console.log(id, options, obj);
            idNoteTitle = id;
            objNoteTitle = obj;
        });
    };
    createNote();

    //$('.postitall').postitall();
    $('#idNote1').postitall({
        width: $('#idNote1').width(),// + parseInt($('#idNote1').css('margin'), 10) + parseInt($('#idNote1').css('padding'), 10),
        style: {
            tresd: false,
            textshadow: false,
            backgroundcolor: '#0275d8',
        },
        flags: {
            blocked: true
        },
        /*attachedTo : {
            element: '#notelist .lead',
            position: 'right',
            fixed: true
        }*/
    });
    $.PostItAll.new({
        width: 300,
        height: 170,
        content: "<p>Anyway, there are some limitation in Chrome Storage with the number of items to be saved or the size of each one.</p><p>More info at <a href='https://developer.chrome.com/extensions/storage#property-sync' target=_blank>chrome.storage.sync</a></p>",
        flags: {
            blocked: true
        },
        attachedTo : {
            element: '#chromestorage .lead',
            position: 'bottom'
        }
    });
    $.PostItAll.new({
        content: '<p style="text-align:center">This is a note with all the <b>features enabled</b> and with the <i>default design</i>.</p>'
            + '<p>You can <u>add and edit the html content</u>, just click on this text.</p>',
        attachedTo : {
            element: '#idNote2',
            position: 'left',
            arrow: false
        }
    });
});
