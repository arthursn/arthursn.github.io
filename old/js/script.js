var path = "./"
var filename = $.url().attr("file");
var idioma = $.url().param("hl");
var anchor = $.url().attr("anchor");

if (!filename) {
	filename = "index.html";
}
if (!idioma) {
	idioma = "pt";
}

function mudaIdioma(idioma, objIn) {
	var obj;
	switch(idioma) {
		case "pt":
			obj = objIn.pt;
			break;
		case "en":
			obj = objIn.en;
			break;
	}
	return obj;
}

$(document).ready(function(){
	//Muda de cabeçalho e o título quando é a versão em inglês que está ativa. Não está compatível com outros idiomas.
	if (idioma == "en") {
		document.title = "University of São Paulo Phase Transformations Group";
		$(".cabecalho img").attr("src", "./img/header_en.png");
	}
	
	//Carrega o menu e o sitemap
	$.getJSON(path + "data/menuFooter.js", function(data) {
		var item, main, menu = $("<ul/>", {"class": "menu"});
		var subItem, subMain, subMenu;
		var mapItem, sitemap = menu.clone();

		var titulo, conteudo;
		$.each(data.footer, function(key, obj){
			titulo = mudaIdioma(idioma,obj).titulo;
			conteudo = mudaIdioma(idioma,obj).conteudo;
			if (titulo) {
				var titulo = $("<h4/>").append(titulo);
				$("#"+key).append(titulo);

			}
			if (conteudo) {
				$("#"+key).append(conteudo);
			}
		});

		var href;
		$.each(data.menu, function(i, value){
			item = $("<li/>").css("z-index", data.menu.length-i);

			href = value.href
			if (!href) {
				main = $("<a/>").append(mudaIdioma(idioma,value));
			} else {
				if (href == "./") {
					href = "index.html";
				}
				main = $("<a/>", {"href": href+"?hl="+idioma}).append(mudaIdioma(idioma,value));
			}

			item.append(main);

			mapItem = item.clone();

			if (i == data.menu.length-1) {
				item.addClass("last");
			}
			if (filename == href) {
				item.addClass("current");
			}

			if (value.submenu) {
				main.css({
					"padding-right": "30px",
					"background-image": "url(./img/triangulo.png)",
					"background-repeat": "no-repeat",
					"background-position": "100% 9px"
				});

				subMenu = $("<ul/>", {"class": "submenu"});
				$.each(value.submenu, function(j, subValue){
					subItem = $("<li/>");
					subMain = $("<a/>", {"href": subValue.href+"?hl="+idioma}).append(mudaIdioma(idioma,subValue));
					subItem.append(subMain);

					if (filename == subValue.href) {
						item.attr("class","current");
					}
					
					subMenu.append(subItem);
				});

				subMenu.clone().appendTo(mapItem);
				item.append(subMenu);
			}

			menu.append(item);

			sitemap.append(mapItem);
		});
		
		/*menu.append("<li id='pt'><a href='?hl=pt'>PT</a></li>");
		menu.append("<li id='en'><a href='?hl=en'>EN</a></li>");*/
	
		$("#menu").prepend(menu);
		// $("#"+idioma).attr("class","current");

		$("#sitemap").append(sitemap);

		$("#menu ul.menu li ul.submenu").each(function(){
			$(this).css("min-width", $(this).parent().width()+"px");
		});

		$("#menu ul.menu li ul.submenu").parent().hover(
			function(){
				$(this).find(".submenu").css("display", "block");
			},
			function(){
				$(this).find(".submenu").css("display", "none");	
			}
		);
	});
});