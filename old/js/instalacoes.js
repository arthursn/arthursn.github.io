$(document).ready(function(){
	$.getJSON(path + "data/instalacoes.js", function(data) {
		$("#titulo").append(mudaIdioma(idioma,data.titulo));

		$("#equipamentos").before(mudaIdioma(idioma,data.conteudo.texto));
		$($("#equipamentos th")[0]).html(mudaIdioma(idioma,data.conteudo.cabecalho[0]));
		$($("#equipamentos th")[1]).html(mudaIdioma(idioma,data.conteudo.cabecalho[1]));
		$($("#equipamentos th")[2]).html(mudaIdioma(idioma,data.conteudo.cabecalho[2]));

		var tr, td, a;
		$.each(data.conteudo.equipamentos, function(i, obj){
			tr = $("<tr/>");
			td = $("<td/>").append(mudaIdioma(idioma,obj.nome));
			td.appendTo(tr);
			td = $("<td/>").append(mudaIdioma(idioma,obj.descricao));
			td.appendTo(tr);
			if (obj.responsavel.nick) {
				a = $("<a/>", {"href":"./pesquisadores.html?hl="+idioma+obj.responsavel.nick}).append(obj.responsavel.nome);
			} else {
				a = obj.responsavel.nome;
			}
			td = $("<td/>").append(a);
			td.appendTo(tr);

			tr.appendTo("#equipamentos");
		});
	});
});