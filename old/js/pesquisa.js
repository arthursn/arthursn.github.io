$(document).ready(function(){
	$.getJSON(path + "data/pesquisa.js", function(data) {
		$("#titulo").append(mudaIdioma(idioma,data.titulo));

		$("#conteudo").append(mudaIdioma(idioma,data.conteudo.texto));

		var ol = $("<ol/>", {"class": "researchLines"}), li;
		$.each(data.conteudo.linhas, function(i, linha){
			li = $("<li/>").append(mudaIdioma(idioma,linha));
			li.appendTo(ol);
		});

		ol.appendTo("#conteudo");
	});
});