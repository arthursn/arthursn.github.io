$(document).ready(function(){
/*	$('#slider').bjqs({
	    height: 250,
	    width: 910,

	    // animation values
		animtype : 'fade', // accepts 'fade' or 'slide'
		animduration : 450, // how fast the animation are
		animspeed : 4000, // the delay between each slide
		automatic : true, // automatic

		// control and marker configuration
		showcontrols : true, // show next and prev controls
		showmarkers : true, // Show individual slide markers
		centermarkers : true, // Center markers horizontally
		centercontrols : true,
		nexttext : '<img src="img/next.png" border="0"/>', // Text for 'next' button (can use HTML)
		prevtext : '<img src="img/prev.png" border="0"/>', // Text for 'previous' button (can use HTML)

		// interaction values
		keyboardnav : false, // enable keyboard navigation
		hoverpause : true, // pause the slider on hover

		// presentational options
		usecaptions : true, // show captions for images using the image title tag
		randomstart : false, // start slider at random slide
		responsive : true // enable responsive capabilities (beta)
	});
*/
	$.getJSON(path + "data/index.js", function(data) {
		var th = $(".informativo th");
		var td = $(".informativo td");

		$(th[0]).html(mudaIdioma(idioma, data.col1.titulo));
		$(th[1]).html(mudaIdioma(idioma, data.col2.titulo));

		var href, a, li, id = data.col1.conteudo[0].id;
		$.each(data.col1.conteudo[0].li, function(i, obj){
			href = obj.href;
			if (href.slice(0,1) != "#") {
				href = href + "?hl=" + idioma;
			}
			a = $("<a/>", {"href": href}).append(mudaIdioma(idioma,obj));
			li = $("<li/>").append(a);
			$("#"+id).append(li);
		});

		$(td[1]).html(mudaIdioma(idioma, data.col2.conteudo));
	});
});