$(document).ready(function(){
	$.getJSON(path + "data/downloads.js", function(data) {
		$("#arquivos").before(mudaIdioma(idioma,data.conteudo.texto));
		$($("#arquivos th")[0]).html(mudaIdioma(idioma,data.conteudo.cabecalho[0]));
		$($("#arquivos th")[1]).html(mudaIdioma(idioma,data.conteudo.cabecalho[1]));
		$($("#arquivos th")[2]).html(mudaIdioma(idioma,data.conteudo.cabecalho[2]));
		$($("#arquivos th")[3]).html(mudaIdioma(idioma,data.conteudo.cabecalho[3]));

		var td, tr, a;
		$.each(data.conteudo.arquivos, function(i, arq){
			tr = $("<tr/>");
			a = $("<a/>", {"href": arq.url, "title": arq.url}).append(arq.nome);
			td = $("<td/>").append(a);
			td.appendTo(tr);
			td = $("<td/>").append(mudaIdioma(idioma,arq.descricao));
			td.appendTo(tr);
			if (arq.responsavel.nick) {
				a = $("<a/>", {"href":"./pesquisadores.html?hl="+idioma+arq.responsavel.nick}).append(arq.responsavel.nome);
			} else {
				a = arq.responsavel.nome;
			}
			td = $("<td/>").append(a);
			td.appendTo(tr);
			td = $("<td/>").append(arq.data);
			td.appendTo(tr);

			tr.appendTo("#arquivos");
		});
	});
});