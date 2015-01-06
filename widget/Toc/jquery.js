
$(document).ready(function(){
	$("a[href^=#]").click( function(e){
		var sAnchorName = $(this).attr('href').slice(1)
		if( sAnchorName ){
			e.preventDefault()
			var eAnchor = $("a[name='"+ sAnchorName +"']")
			$('html,body').animate({ scrollTop:eAnchor.offset().top }, 'slow' )
			}
		})
		
	// hide #back-top first
	$("#back-top").hide()
	
	// fade in #back-top
	$( function(){
		$(window).scroll( function(){
			if( $(this).scrollTop() > 100 ) $('#back-top').fadeIn()
			else $('#back-top').fadeOut()
			})
		// scroll body to 0px on click
		$('#back-top a').click( function(){
			$('body,html').animate({ scrollTop: 0 }, 500 )
			return false
			})
		})
	})