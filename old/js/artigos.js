function excludeLowerCase(array) {
	$.each(array, function(i, value){
		if(value < "A" || value > "Z") {
			array.splice(i,1);
		}
	});
	return(array);
}
function replaceLaTeX(string) {
	string = string.replace(/\\'{a}/g, "&aacute;")
				   .replace(/\\'{A}/g, "&Aacute;")
				   .replace(/\\~{a}/g, "&atilde;")
				   .replace(/\\~{A}/g, "&Atilde;")
				   .replace(/\\\^{a}/g, "&acirc;")
				   .replace(/\\\^{A}/g, "&Acirc;")
				   .replace(/\\'{e}/g, "&eacute;")
				   .replace(/\\'{E}/g, "&Eacute;")
				   .replace(/\\\^{e}/g, "&ecirc;")
				   .replace(/\\\^{E}/g, "&Ecirc;")
				   .replace(/\\'{i}/g, "&iacute;")
				   .replace(/\\'{\\i}/g, "&iacute;")
				   .replace(/\\'{I}/g, "&Iacute;")
				   .replace(/\\'{\\I}/g, "&Iacute;")
				   .replace(/\\'{o}/g, "&oacute;")
				   .replace(/\\'{O}/g, "&Oacute;")
				   .replace(/\\~{o}/g, "&otilde;")
				   .replace(/\\~{O}/g, "&Otilde;")
				   .replace(/\\'{u}/g, "&uacute;")
				   .replace(/\\'{U}/g, "&Uacute;")
				   .replace(/\\c{c}/g, "&ccedil;")
				   .replace(/\\c{C}/g, "&Ccedil;")
				   .replace(/\\C{C}/g, "&Ccedil;");

	return(string);
}
function toBib(bibjson) {
	monthCorresp = {"January":"jan", "February":"feb", "March":"mar", "April":"apr", "May":"may", "June":"jun", "July":"jul", "August":"aug", "September":"sep", "October":"oct", "November":"nov", "December":"dec"};
	var bib = new Array();

	bib.push(bibjson.citationKey.toLowerCase());
	$.each(bibjson.entryTags, function(key, value){
		if(key == "MONTH") {
			bib.push(key.toLowerCase() + " = " + monthCorresp[value]);
		} else {
			bib.push(key.toLowerCase() + " = {" + value.replace(/\\/g, "\\\\") + "}");
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

function includeRef(location) {
	$.ajax({
		url: location,
		async: false,
		success: function(data) {
			bibobj = bibtexParse.toJSON(data);

			var row, rowYear, cell, cite;
			var id;
			var citationKey;
			var authors, author, name, surname, prename, authorString;
			var title;
			var journal;
			var volume;
			var number;
			var month;
			var pages;
			var year, year0 = 0;
			var doi;

			$.each(bibobj, function(index, object){
				citationKey = object.citationKey.toLowerCase();

				row = $("<tr/>").attr("id",citationKey);
				cell = $("<td/>").attr("class","ref");

				cite = $("<td/>").attr("class","cite");
				cite.append($("<a/>", {"href":"javascript:saveBib(\""+toBib(object)+"\",\""+citationKey+"\");", "title":"Download BibTeX entry"}).append("BibTeX"));

				id = $("#pub .id:last").text();
				if (id) {
					id = id.slice(1,-1);
					id = parseInt(id) + 1;
				} else {
					id = 1;
				}
				row.append("<td class='id' style='vertical-align: top'>["+id+"]</td>")		

				year0 = year;
				year = object.entryTags.YEAR;

				if (year != year0) {
					rowYear = $("<tr/>").append($("<td/>").attr({"colspan":"3", "class":"anoPub"}).append(year));
					$("#pub").append(rowYear);
				}

				doi = object.entryTags.DOI;
				if (doi) {
					cell.append($("<a/>").attr({"class":"doi", "href":"http://dx.doi.org/"+doi, "target":"_blank"}));
				}

				author = object.entryTags.AUTHOR.split(" and ");
				$.each(author, function(i){
					name = author[i].split(",");
					surname = name[0];
					prename = name[1].split(" ");
					for(j=0; j<prename.length; j++){
						prename[j] = prename[j].slice(0,1);
					};
					if (surname.slice(0,1) == "{")
						surname = surname.slice(1,-1);
					author[i] = surname.toUpperCase() + ", " + excludeLowerCase(prename).join(".").toUpperCase() + ".";
				});
				authorString = author.join("; ") + " ";

				cell.append(replaceLaTeX(authorString));

				title = object.entryTags.TITLE.slice(1,-1);
				cell.append(replaceLaTeX(title) + ". ");

				journal = object.entryTags.JOURNAL;
				cell.append(replaceLaTeX(journal) + ", ");

				volume = object.entryTags.VOLUME;
				if (volume)
					cell.append("vol. " + volume + ", ");

				number = object.entryTags.NUMBER;
				if (number)
					cell.append("n. " + number + ", ");

				pages = object.entryTags.PAGES;
				if (pages)
					cell.append("p. " + pages.replace("--", "-") + ", ");

				if (year)
					cell.append(year + " ");

				row.append(cell);

				row.append(cite);

				$("#pub").append(row);
			});
		}
	});
}

$(document).ready(function(){
	includeRef("./data/publicacoes.bib.txt");

	$.getJSON(path + "data/artigos.js", function(data) {
		$("#titulo").append(mudaIdioma(idioma,data.titulo));

		$.each(data.artigos, function(citationKey, pdf){
			$("#"+citationKey + " .cite").prepend($("<a/>", {"href":pdf, "title":"Download file in PDF", "class":"pdf", "target": "_blank"}));
		});
	});
});