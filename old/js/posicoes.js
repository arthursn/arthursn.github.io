$(document).ready(function(){
	$.getJSON(path + "data/posicoes.js", function(data) {
		$("#titulo").append(mudaIdioma(idioma,data.titulo));
		$("#conteudo").append(mudaIdioma(idioma,data.conteudo));
	});
});