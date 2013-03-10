//Navigation menu scroll
$(function() {
	$('.navegable').click(function() {
		$('#navigation li').removeClass('active');
		$(this).parent('li').addClass('active');
	 		if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
	  			var $target = $(this.hash);
	   			$target = $target.length && $target || $('[name=' + this.hash.slice(1) +']');
	   			if ($target.length) {
	  				var targetOffset = $target.offset().top - 80;
	  				$('html,body').animate({scrollTop: targetOffset}, 1000);
	    			return false;
	  		}
	 	}
	});
});

function GetSitePath() {
    var rootPath = window.location.protocol + "//" + window.location.host;
    var path = window.location.pathname;
    if (path.lastIndexOf("/") == 0) {
    	path = path.substring(1);
    }
    path = path.substr(0,path.lastIndexOf("/"));
    if (path != "") {
    	rootPath = rootPath + path + '/';
    }
    return rootPath;
}

