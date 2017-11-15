function keys(obj) {
    var keys = [];
    for(var key in obj) {
        if(obj.hasOwnProperty(key)) {
            keys.push(key);
        }
    }
    return keys;
}

$(document).ready(function(){
	$.getJSON(path + "data/pesquisadores.js", function(data) {
		$("#titulo").append(mudaIdioma(idioma,data.titulo));

		var membros = data.pesquisadores.membros;
		var id, aux, linha, ficha, redes, contato, info, texto, seta;
		var posicoes = mudaIdioma(idioma,data.pesquisadores.posicoes);
		for (var pos in posicoes) {
			$(pos).append("<td colspan='2'>"+posicoes[pos]+"</td>");
		}
		var ids = keys(membros);
		ids.sort();
		ids.reverse();

		for (var i in ids) {
			id = ids[i];
			linha = $("<tr/>", {"id": id});
			ficha = $("<td/>", {"class": "ficha"});
			redes = $("<div/>", {"class": "redes"});
			nome = $("<h4/>").append(membros[id].nome);
			formacao = $("<span/>").append(membros[id].formacao);
			contato = $("<a/>", {"href": "mailto:"+membros[id].email}).append(membros[id].email);
			info = $("<td/>", {"class": "descricao"});
			seta = $("<img/>", {"class": "seta", "src": "./img/seta.png"});
			
			if (membros[id].foto)
				ficha.append("<div class='moldura'><div class='foto'><img src='"+membros[id].foto+"'/></div></div>");
			else
				ficha.append("<div class='moldura'><div class='foto'><img src='./img/pesquisadores/0.jpg'/></div></div>");

			if (membros[id].lattes) {
				aux = $("<a/>", {"href": membros[id].lattes, "target": "_blank", "title": "Lattes CV"}).append("<img class='redes' src='./img/logo_lattes.png'/>");
				redes.append(aux);
			}
			if (membros[id].linkedin) {
				aux = $("<a/>", {"href": membros[id].linkedin, "target": "_blank", "title": "Linkedin profile"}).append("<img class='redes' src='./img/logo_linkedin.png'/>");
				redes.append(aux);
			}
			if (membros[id].researchgate) {
				aux = $("<a/>", {"href": membros[id].researchgate, "target": "_blank", "title": "ResearchGate profile"}).append("<img class='redes' src='./img/logo_researchgate.png'/>");
				redes.append(aux);
			}

			ficha.append(redes)
			ficha.append(nome);
			ficha.append(formacao);
			ficha.append(contato);
		
			switch (idioma) {
				case "pt": 
					texto = membros[id].pt;
					break;
				case "en":
					texto = membros[id].en;
					break;
				case "es":
					texto = membros[id].es;
					break;
			}
			
			info.append(seta).append("<div>"+texto+"</div>");
			
			if (membros[id].posicao == "#chefe") {
				contato.after("<br/>+55 11 3091 5460");
			}
		
			linha.append(ficha).append(info);
		
			$(membros[id].posicao).after(linha);
		}

		if (!anchor) {
			$("#hgoldens").addClass("current");
		} else {
			$("#"+anchor).addClass("current");
			$(function() {
			    $(document).scrollTop($("#"+anchor).offset().top);
			});
		}

		var parent, descricao, posLast, posThis, newPos;
		$(".ficha").hoverIntent(function() {
			$("tr.current").removeClass("current");
			parent = $(this).parent();
			parent.addClass("current");

			descricao = parent.find("td.descricao div");

			posLast = $(".ficha:last").position().top + $(".ficha:last").height();
			posThis = parent.position().top + descricao.height() + 10;
			newPos = -20 + posLast - posThis + "px";

			if (posThis > posLast)
				descricao.css("top",newPos);
		});
	});
});