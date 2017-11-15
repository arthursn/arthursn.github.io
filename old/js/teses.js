//troca da notação "2k11" para "2011". é besta ter que ter isso.
function converteAno(ano) {
	ano = ano.split("k");
	ano = parseInt(ano[0])*1000 + parseInt(ano[1]);
	return ano;
}
function replaceUppertoLower(string) {
	string = string.replace(/ACUTE/g, "acute")
				   .replace(/TILDE/g, "tilde")
				   .replace(/CIRC/g, "circ")
				   .replace(/CEDIL/g, "cedil");
	return(string);
}
function replaceHTML(string) {
	string = string.replace(/&aacute;/g, "\\\\'{a}")
				   .replace(/&Aacute;/g, "\\\\'{A}")
				   .replace(/&atilde;/g, "\\\\~{a}")
				   .replace(/&Atilde;/g, "\\\\~{A}")
				   .replace(/&acirc;/g, "\\\\^{a}")
				   .replace(/&Acirc;/g, "\\\\^{A}")
				   .replace(/&eacute;/g, "\\\\'{e}")
				   .replace(/&Eacute;/g, "\\\\'{E}")
				   .replace(/&ecirc;/g, "\\\\^{e}")
				   .replace(/&Ecirc;/g, "\\\\^{E}")
				   .replace(/&Oacute;/g, "\\\\'{O}")
				   .replace(/&otilde;/g, "\\\\~{o}")
				   .replace(/&Otilde;/g, "\\\\~{O}")
				   .replace(/&uacute;/g, "\\\\'{u}")
				   .replace(/&Uacute;/g, "\\\\'{U}")
				   .replace(/&ccedil;/g, "\\\\c{c}")
				   .replace(/&Ccedil;/g, "\\\\c{C}")
				   .replace(/&Ccedil;/g, "\\\\C{C}");

	return(string);
}
function toBib(bibjson) {
	var bib = new Array();

	bib.push(bibjson.citationKey.toLowerCase());
	$.each(bibjson.entryTags, function(key, value){
		value = replaceHTML(value);
		if(key == "title") {
			bib.push(key.toLowerCase() + " = {{" + value + "}}");
		} else {
			bib.push(key.toLowerCase() + " = {" + value + "}");
		}
	});

	return("@" + bibjson.entryType.toLowerCase() + "{" + bib.join(",\\n") + "\\n}");
}
function saveBib(bib,citationKey) {
	var oldIE;
    if ($('html').is('.ie6, .ie7, .ie8')) {
        oldIE = true;
    }
    //Roda somente se o browser é o IE < 10	
    if(oldIE) {
    	w = window.open();
		doc = w.document;
		doc.open("text/plain", "replace");
		doc.charset = "utf-8";
		doc.write(bib);
		doc.close();
    } else {
		var blob = new Blob([bib], {
		    type: "text/plain;charset=utf-8;",
		});
		saveAs(blob, citationKey+".bib");
	}
}

$(document).ready(function(){
	$.getJSON(path + "data/teses.js", function(data) {
		$("#titulo").append(mudaIdioma(idioma,data.titulo));
		
		var id, rowYear, row, cell, cite;
		var year;
		var author;
		var title;
		var type;
		var school;
		var address;
		var pdf;

		$.each(data.teses, function(year, bibobj){
			year = converteAno(year);
			rowYear = $("<tr/>").append($("<td/>").attr({"colspan":"3", "class":"anoPub"}).append(year));
			$("#pub").append(rowYear);
			$.each(bibobj, function(i, object){
				citationKey = object.citationKey.toLowerCase();

				row = $("<tr/>").attr("id",citationKey);
				cell = $("<td/>").attr("class","ref");

				cite = $("<td/>").attr("class","cite");
				pdf = object.extraTags.pdf;
				if (pdf) {
					cite.append($("<a/>", {"href":pdf, "title":"Download file in PDF", "class":"pdf", "target": "_blank"}));
				}
				cite.append($("<a/>").attr({"href":"javascript: saveBib(\""+toBib(object)+"\",\""+citationKey+"\");", "title":"Download BibTeX entry"}).append("BibTeX"));

				id = $("#pub .id:last").text();
				if (id) {
					id = id.slice(1,-1);
					id = parseInt(id) + 1;
				} else {
					id = 1;
				}
				row.append("<td class='id' style='vertical-align: top'>["+id+"]</td>")

				author = object.entryTags.author.split(",");
				author = replaceUppertoLower(author[0].toUpperCase()) + ", " + author[1] + ". ";
				cell.append(author);

				title = object.entryTags.title;
				cell.append($("<b/>").append(title + ". "));

				cell.append(year + ". ");

				type = object.entryTags.type;
				cell.append(type + " - ");

				school = object.entryTags.school;
				cell.append(school + ", ");

				address = object.entryTags.address;
				cell.append(address + ", ");

				cell.append(year + ".");			

				row.append(cell);

				row.append(cite);

				$("#pub").append(row);
			});
		});
	});
});