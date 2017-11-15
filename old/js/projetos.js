$(document).ready(function(){
	$.getJSON(path + "data/projetos.js", function(data) {
		$("#titulo").append(mudaIdioma(idioma,data.titulo));

		var agora = {"pt":"atual", "en":"current"}, fim;
		var tr, td;
		$.each(data.projetos, function(i, obj) {
			fim = obj.fim;
			if (!fim) {
				fim = agora[idioma];
			}

			tr = $("<tr/>");
			td = $("<td/>", {"class":"vigencia"}).append(obj.inicio+" - "+fim);
			td.appendTo(tr);
			td = $("<td/>").append(mudaIdioma(idioma,obj.titulo));
			td.appendTo(tr);
			tr.appendTo("#projetos");

			tr = $("<tr/>");
			if (i < (data.projetos.length-1)) {
				tr.css("border-bottom", "1px dashed #000");
			}
			td = $("<td/>");
			td.appendTo(tr);
			td = $("<td/>").append(mudaIdioma(idioma,obj.descricao));
			td.appendTo(tr);
			tr.appendTo("#projetos");
		});
	});
});