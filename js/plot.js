"use strict";

var oldXaxis;

var isCsv = function(fname){
	var ext = fname.split(".").pop().toLowerCase();
	if (ext == 'csv') {
		return true;
	} else {
		return false;
	}
};

var checkLimits = function(el) {
	var val = parseInt($(el).val());
	var max = parseInt($(el).attr("max"));
	var min = parseInt($(el).attr("min"));
	if (el.id == "from") {
		max = parseInt($("#to").val()) - 1;
	} else if (el.id == "to") {
		min = parseInt($("#from").val()) + 1;
	}
	if (val > max) {
		$(el).val(max);
	} else if (val < min) {
		$(el).val(min);
	}
};

var selectPlot = function(g, el) {
	g.setVisibility(parseInt(el.id), el.checked);
};
var selectAll = function(g) {
	$.each($("input[name=plot]"), function(i, el){
		g.setVisibility(parseInt($(el).val()), true);
		el.checked = true;
	});
}
var deselectAll = function(g) {
	$.each($("input[name=plot]"), function(i, el){
		g.setVisibility(parseInt($(el).val()), false);
		el.checked = false;
	});
};

var toggleXaxis = function(d, el) {
	var g = d.g;
	var data = prepareData(d.data, $(el).val());
	var labels = swapXaxis(d.labels, $(el).val());
	g.updateOptions({"file": data, "labels": labels});
	labels.splice(0,1);
	var plotList = {};
	$.each($("input[name=plot]"), function(id, input){
		plotList[$(input).attr("class")] = input.checked;
		input.checked = false;
		$(input).attr("class", d.colnames[labels[id]]);
		$("label[for="+id+"]").html(labels[id]);
	});
	$.each(plotList, function(cls, chk){
		var pltChk = $("input[name=plot]."+cls)[0];
		if (pltChk) {
			pltChk.checked = chk;
			selectPlot(g, pltChk);
		}
	});
	var oldPlot = $("."+oldXaxis[0].id)[0];
	if (oldPlot) {
		oldPlot.checked = false;
		selectPlot(g, oldPlot);
		oldXaxis = $("input[name=xaxis]:checked");
	}
};

var createRadioButtons = function(d) {
	var g = d.g;
	var lbls = g.getLabels();
	$("#xaxis").html("");
	var label, radio;
	$.each(lbls, function(i, lbl) {
		label = $("<label/>");
		label.attr("for", d.colnames[lbl]);
		label.append(lbl);
		radio = $("<input name=xaxis type=radio />");
		if (i == 0) {
			radio.attr("checked", "checked");
		}
		radio.attr({"id": d.colnames[lbl], "value": i});
		radio.css("margin-right", "10px");
		$("#xaxis").append(label);
		$("#xaxis").append(radio);
	});
	oldXaxis = $("input[name=xaxis]:checked");
	/*create click event*/
	$("input[name=xaxis]").click(function(){
		toggleXaxis(d, this);
		g.updateOptions({"dateWindow": null, "valueRange": null})
	});
};
var createCheckboxes = function(d) {
	var g = d.g;
	var labels = g.getLabels();
	$("#showSeries").html("");
	var label, checkbox;
	var ylbls = labels.slice(0);
	ylbls.splice(0,1);
	$.each(ylbls, function(i, ylbl) {
		label = $("<label/>");
		label.attr("for", i);
		label.append(ylbl);
		checkbox = $("<input name=plot type=checkbox checked />");
		checkbox.attr({"class": d.colnames[ylbl], "id": i, "value": i});
		checkbox.css("margin-right", "10px");
		$("#showSeries").append(label);
		$("#showSeries").append(checkbox);
	});
	/*create click event*/
	$("input[name=plot]").click(function(){
		selectPlot(g, this);
	});
};

var swapXaxis = function(arr, xaxis) {
	if (xaxis) {
		var v = arr.slice(0);
		var x = v.splice(xaxis, 1)[0];
		v.unshift(x);
		return v;
	} else {
		return arr;
	}
};
var selectYaxes = function(arr, yaxes) {
	if (yaxes) {
		var v = [arr[0]];
		$.each(yaxes, function(j, yaxis) {
			yaxis += 1;
			v.push(arr[yaxis]);
		});
		return v;
	} else {
		return arr;
	}
};
var prepareData = function(data, xaxis, yaxes) {
	var newData = [], w;
	$.each(data, function(i, v) {
		w = swapXaxis(v, xaxis);
		w = selectYaxes(w, yaxes);
		newData.push(w);
	});
	return newData;
};

var data2csv = function(data, lbls) {
	return data.reduce(function(a, b){
		return a + b.join(",") + "\n";
	}, "data:text/csv;charset=utf-8," + lbls.join(",") + "\n");
};
var csv2data = function(csv, skiplines=0) {
	var data = [], labels = [];
	var s, s1;
	$.each(csv.split("\n"), function(i, v){
		s = v.split(/[,;]+/);
		if (i == skiplines) {
			labels = s;
		} else if (i > skiplines) {
			if (s.length == labels.length) {
				s1 = [];
				$.each(s, function(j, v1) {
					s1.push(parseFloat(v1));
				});
				data.push(s1);
			}
		}
	});
	return {"data":data, "labels":labels};
};
var getXYaxes = function() {
	var currXaxis = $("input[name=xaxis]:checked");
	var xaxis = parseInt($(currXaxis).val());
	var yaxes = [];
	$.each($("input[name=plot]:checked"), function(i, el){
		yaxes.push(parseInt($(el).val()));
	});
	return {"xaxis":xaxis, "yaxes":yaxes};
}
var exportcsv = function(d) {
	var xy = getXYaxes();
	var data = prepareData(d.data, xy.xaxis, xy.yaxes);
	var lbls = swapXaxis(d.labels, xy.xaxis);
	lbls = selectYaxes(lbls, xy.yaxes);
	var encodeUri = encodeURI(data2csv(data, lbls));
	var link = $("#linkcsv");
	link.attr("href", encodeUri);
	link.attr("download", "data.csv");
	link[0].click();
}

var getParams = function(id) {
	if (id) {
		var val = parseInt($(id).val());
		return val;
	} else {
		var from = parseInt($("#from").val())
		var to = parseInt($("#to").val())
		var every = parseInt($("#every").val())
		var skiplines = parseInt($("#skiplines").val())
		return {"from":from, "to":to, "every":every, "skiplines":skiplines}
	}
};

var linearReg = function() {
	if (!d) return false;
	var xy = getXYaxes();
	var data = prepareData(d.data, xy.xaxis, [xy.yaxes[0]]);
	d.reg = regression("linear", data);
	d.g.updateOptions({});
	var equation = "y = " + d.reg.equation[0].toExponential(6) + " * x";
	if (d.reg.equation[1] > 0) {
		equation += " + ";
	} else {
		equation += " - ";
	}
	equation += Math.abs(d.reg.equation[1]).toExponential(6);
	$("#regresult").html(equation);
};

var clearAll = function() {
	$("#chart").html("");
	$("#showSeries").html("");
	$("#xaxis").html("");
	$("#from").val("");
	$("#to").val("");
	$("#every").val(1);
	clearReg();
}

var clearReg = function() {
	if (!d) return false;
	d.reg.equation = [];
	if (d.g) d.g.updateOptions({});
	$("#regresult").html("");
};

var DataPlot = function(file) {
	var self = this;
	self.file = file;
	
	self._data = [];
	self.data = self._data;
	self.labels = [];
	self.colnames = {};

	self.paramsDefault = {};
	self.reg = {}; 

	self.reader = new FileReader();
	self.reader.onload = function(e) {
		var skiplines = getParams("#skiplines");
		if (isCsv(self.file.name) == false) {
			var arr = e.target.result.split("\n");
			var i, j=0, vals, line, ncol;
			self._data = [];
			for (i=skiplines; (line = arr[i]) != null; i++) {
				if (line[0] != "#" && line != "") { // ignore commented and empty lines
					vals = [];
					$.each(line.split(/[\s\t]+/), function(k, v){
						if (v != "") {
							vals.push(parseFloat(v));
						}
					});
					if (j == 0) {
						ncol = vals.length;
					}
					if (vals.length == ncol) {
						self._data.push(vals);
					}
					j++;
				}
			}
			self.labels = [];
			self.colnames = {};
			var col;
			for (i=1; i <= ncol; i++) {
				col = "col"+i;
				self.labels.push(col);
				self.colnames[col] = col;
			}
		} else {
			var csv = e.target.result;
			var result = csv2data(csv, skiplines);
			self.labels = result.labels;
			self._data = result.data;
			self.colnames = {};
			$.each(self.labels, function(i, label){
				self.colnames[label] = "col" + (i+1);
			});
		}
	}
	self.reader.onloadend = function(e){
		self.paramsDefault = {
			"from": 1,
			"to": self._data.length - 1,
			"every": 1
		};

		var from = getParams("#from") || self.paramsDefault.from;
		var to = getParams("#to") || self.paramsDefault.to;
		var every = getParams("#to") || self.paramsDefault.every;
		$("#from").val(from).attr("max", self._data.length-1);
		$("#to").val(to).attr("max", self._data.length-1);
		$("#every").val(every).attr("max", self._data.length-1);

		self.plot(true);
	};

	self.load = function() {
		self.reader.readAsText(self.file, "UTF-8");
	}

	self.drawLines = function(ctx, area, layout) {
		// http://dygraphs.com/gallery/#g/linear-regression
		if (typeof(self.reg.equation) == "undefined") {
			return false;
		}
		else if (self.reg.equation.length > 0) {
			var range = self.g.xAxisRange();
			var a = self.reg.equation[0];
			var b = self.reg.equation[1];

			var x1 = range[0];
			var y1 = a*x1 + b;
			var x2 = range[1];
			var y2 = a*x2 + b;

			var p1 = self.g.toDomCoords(x1, y1);
			var p2 = self.g.toDomCoords(x2, y2);

			ctx.save();
			ctx.lineWidth = 1.5;
			ctx.beginPath();
			ctx.moveTo(p1[0], p1[1]);
			ctx.lineTo(p2[0], p2[1]);
			ctx.closePath();
			ctx.stroke();
			ctx.restore();
		}
	};

	self.plot = function(newg) {
		var line, params = getParams();
		self.data = [];
		for (var i=params.from+1; (line=self._data[i]) != null && i < params.to; i+=params.every) {
			self.data.push(line);
		}

		if (self.data.length > 0) {
			if (newg) {
				self.g = new Dygraph($("#chart")[0], self.data, {"labels": self.labels, "legend": "always", "underlayCallback": self.drawLines});
				createRadioButtons(self);
				createCheckboxes(self);
			} else {
				self.g.updateOptions({"file": self.data});
				toggleXaxis(self, $("input[name=xaxis]:checked"));
			}
		}
	};
};

var d, file;

$("#data").change(function(e){
	file = $("#data")[0].files[0];
	if (!file) return false;
	clearAll();
	d = new DataPlot(file);
	d.load();
});

$("#reload").click(function(e){
	if (!d) return false;
	file = $("#data")[0].files[0];
	if (!file) return false;
	clearAll();
	d = new DataPlot(file);
	d.load();
});

$("#reset").click(function(e){
	if (!d) return false;
	$("#from").val(d.paramsDefault.from);
	$("#to").val(d.paramsDefault.to);
	$("#every").val(d.paramsDefault.every);
	d.data = d._data.slice();
	d.plot();
});

$("#selectAll").click(function(){
	if (!d) return false;
	selectAll(d.g);
});

$("#deselectAll").click(function(){
	if (!d) return false;
	deselectAll(d.g);
});

$("#exportcsv").click(function(){
	if (!d) return false;
	exportcsv(d);
});

$("#savepng").click(function(){
	if (!d) return false;
	// http://cavorite.com/labs/js/dygraphs-export/
	var link = $("#linkimg");
	Dygraph.Export.asPNG(d.g, link[0]);
	link.attr("href", link[0].src);
	link.attr("download", "data.png");
	link[0].click();
});

$("input.params:not(#skiplines)").change(function(){
	if (d.g) {
		checkLimits(this);
		d.plot();
	}
});

$("#skiplines").keyup(function(e){
	if (e.which == 13) {
		$("#reload").click();
	};
});

$("#regression").click(linearReg);
$("#clearreg").click(clearReg);
