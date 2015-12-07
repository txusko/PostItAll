$(document).ready(function() {
    $('#idAddNote').click(function(e) {
        if($(this).hasClass('disabled')) return;
        $.PostItAll.new({
            posX: e.pageX,
            posY: e.pageY + 20
        });
        e.preventDefault();
    });
    $('#idHideAll2').click(function(e) {
        if($(this).hasClass('disabled')) return;
        $.PostItAll.hide();
        e.preventDefault();
    });
    $('#idShowAll2').click(function(e) {
        if($(this).hasClass('disabled')) return;
        $.PostItAll.show();
        e.preventDefault();
    });
    $('#idDeleteAll2').click(function(e) {
        if($(this).hasClass('disabled')) return;
        $.PostItAll.remove();
        e.preventDefault();
    });
});

var idNoteBottom, objNoteBottom;
var doNotPress = function() {
    /*$.PostItAll.new({
        height: 170,
        content: "<h3 style='text-align:center'>Do not press the button!!!</h3>",
        style: {
            backgroundcolor: '#ff0000',
            tresd: false,
            textshadow: false,
        },
        flags: {
            blocked: true,
            expanded: false,
            minimized: false
        },
        features: {
            toolbar: false,
        },
        attachedTo : {
            element: '#idPayPal',
            position: 'left'
        },
        onDelete : function() {
            doNotPress();
        }
    }, function(id, options, obj) {
        //console.log(id, options, obj);
        idNoteBottom = id;
        objNoteBottom = obj;
    });*/
};
