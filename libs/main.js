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

