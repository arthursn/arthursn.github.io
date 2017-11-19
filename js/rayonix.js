"use strict";

var data2csv = function(data, labels) {
	var csv = "data:text/csv;charset=utf-8,";
	if (labels) {
		csv += labels.join(",") + "\n";
	}
	return data.reduce(function(a, b){
		return a + b.join(",") + "\n";
	}, csv);
};

var checkLimits = function(el, from, to) {
	var val = parseFloat($(el).val());
	var max = parseFloat($(el).attr("max"));
	var min = parseFloat($(el).attr("min"));
	if (from) {
		if (el.id == from.prop("id")) {
			max = parseFloat(to.val());
		}
	}
	if (to) {
		if (el.id == to.prop("id")) {
			min = parseFloat(from.val());
		}
	}
	if (val > max) {
		$(el).val(max);
	} else if (val < min) {
		$(el).val(min);
	}
};

var peak, dryx;

DataInsituAcq.prototype.setCallbacks = function() {
	this.loadCallback = function() {
		$("#fromacq").val(1);
		$("#fromacq").attr("max", this.data.length);
		$("#toacq").val(this.data.length);
		$("#toacq").attr("max", this.data.length);
		$("#acq").val(1);
		$("#acq").attr("max", this.data.length);
		$("#nacq").html(" / "+(this.data.length));
		for (var i = 0; i < dryx.time.length; i++) {
			dryx.time[i] = i*$("input#dt").val();
			dryx.temp[i] = parseFloat($("input#Ti").val()) + i*parseFloat($("input#dT").val());
		}
		this.plot($("#chart")[0]);
	}
	this.plotCallback = function() {
		$("#from").attr("min", this.xmin);
		$("#from").attr("max", this.xmax);
		$("#from").val(this.xmin);
		$("#to").attr("min", this.xmin);
		$("#to").attr("max", this.xmax);
		$("#to").val(this.xmax);
		$("#time").html(this.time[this.acq].toFixed(2));
		$("#temp").html(this.temp[this.acq].toFixed(1));
	}
	this.getXrangeCallback = function() {
		$("#from").val(this.xmin);
		$("#to").val(this.xmax);
	}
};

$.each(methods, function(key, obj){
	var opt = $("<option/>");
	opt.attr({"value": key, "id": key}).append(obj.name);
	$("select#method").append(opt);
});
$("option#psdVoigt1").prop("selected", true);

$("input,select").click(function(){
	$("#messagebox").html("");
});

$("input#fileinput").change(function(e){
	var file = e.target.files[0];
	if (!file) return false;
	dryx = new DataInsituAcq(file, "rayonix", 1494, ["tth", "d", "I", "Ib", "bck"], [false, true, false, false]);
	dryx.setCallbacks();
	peak = new PeakFit(null, [0, 2], $("select#method").prop("value"), {rhoend: 1e-4, maxfun: 500});
	dryx.load();
});

$("select#method").change(function(){
	if (!dryx) return false;
	peak = new PeakFit(null, [0, 2], $("select#method").prop("value"), {rhoend: 1e-4, maxfun: 500});
	dryx.pFit = [];
	dryx.pRes = [];
	dryx.g.updateOptions({});
});

$("input#dt").change(function(){
	if (typeof(dryx) != "undefined") {
		for (var i = 0; i < dryx.time.length; i++) {
			dryx.time[i] = i*parseFloat($("input#dt").val());
		}
		$("#time").html(dryx.time[dryx.acq].toFixed(2));
	}
});

$("input#Ti").change(function(){
	if (typeof(dryx) != "undefined") {
		for (var i = 0; i < dryx.temp.length; i++) {
			dryx.temp[i] = parseFloat($("input#Ti").val()) + i*parseFloat($("input#dT").val());
		}
		$("#temp").html(dryx.temp[dryx.acq].toFixed(1));
	}
});

$("input#dT").change(function(){
	if (typeof(dryx) != "undefined") {
		for (var i = 0; i < dryx.temp.length; i++) {
			dryx.temp[i] = parseFloat($("input#Ti").val()) + i*parseFloat($("input#dT").val());
		}
		$("#temp").html(dryx.temp[dryx.acq].toFixed(1));
	}
});

$("input#acq").change(function(){
	if (!dryx) return false;
	checkLimits(this);
	dryx.acq = parseInt($("#acq").val()) - 1;
	dryx.plot();
});

$("input#fromacq").change(function(){
	if (!dryx) return false;
	checkLimits(this, $("#fromacq"), $("#toacq"));
	$("#acq").val($(this).val());
	dryx.acq = parseInt($("#acq").val()) - 1;
	dryx.plot();
});

$("input#toacq").change(function(){
	if (!dryx) return false;
	checkLimits(this, $("#fromacq"), $("#toacq"));
});

$("input#from, input#to").change(function(){
	if (!dryx) return false;
	checkLimits(this, $("#from"), $("#to"));
	var from = parseFloat($("#from").val());
	var to = parseFloat($("#to").val());
	dryx.g.updateOptions({dateWindow: [from, to]});
});

$("input#fit").click(function(){
	if (!dryx) return false;
	$("#messagebox").html("Work in progress... ");
	var from = dryx.g.layout_.points[0][0].idx;
	var to = dryx.g.layout_.points[0].slice(-1)[0].idx;
	dryx.acq = parseInt($("#acq").val()) - 1;
	window.setTimeout(function(){
		peak.xy = dryx.data[dryx.acq].slice(from, to);
		peak.fit();
		dryx.pFit[dryx.acq] = [dryx.acq, dryx.epoch[dryx.acq]];
		dryx.pFit[dryx.acq].push(peak.p);
		dryx.pRes[dryx.acq] = peak.result;
		dryx.g.updateOptions({"file": dryx.data[dryx.acq]});
		console.log(peak.p);
		$("#messagebox").append("done!");
	}, 0);
});

$("input#autofit").click(function(){
	if (!dryx) return false;
	$("#messagebox").html("Work in progress... ");
	var from = dryx.g.layout_.points[0][0].idx;
	var to = dryx.g.layout_.points[0].slice(-1)[0].idx;
	var fromacq = parseInt($("#fromacq").val()) - 1;
	var toacq = parseInt($("#toacq").val()) - 1;
	$("input:not(#cancel)").prop("disabled", true);
	$("select").prop("disabled", true);
	var j = fromacq;
	peak.iter = window.setInterval(function(){
		if (j <= toacq) {
			peak.xy = dryx.data[j].slice(from, to);
			peak.fit();
			dryx.pFit[j] = [j, dryx.epoch[j]].concat(peak.p);
			dryx.pRes[j] = peak.result;
			$("#acq").val(j+1);
			dryx.acq = j++;
			dryx.g.updateOptions({"file": dryx.data[dryx.acq]});
			console.log(dryx.acq);
		} else {
			clearInterval(peak.iter);
			$("#messagebox").append("done!");
			$("input").prop("disabled", false);
			$("select").prop("disabled", false);
		}
	}, 0);
});

$("input#clearcurr").click(function(){
	if (!dryx) return false;
	dryx.acq = parseInt($("#acq").val()) - 1;
	dryx.pFit[dryx.acq] = [];
	dryx.pRes[dryx.acq] = [];
	dryx.g.updateOptions({});
});

$("input#clearall").click(function(){
	if (!dryx) return false;
	dryx.pFit = [];
	dryx.pRes = [];
	dryx.g.updateOptions({});
});

$("input#cancel").click(function(){
	if (!dryx) return false;
	if (typeof(peak.iter) != "undefined") {
		clearInterval(peak.iter);
		$("input").prop("disabled", false);
		$("select").prop("disabled", false);
	}
});

var exportcsv = function(data, labels) {
	var encodeUri = encodeURI(data2csv(data, labels));
	var link = $("#linkcsv");
	link.attr("href", encodeUri);
	link.attr("download", "data.csv");
	link[0].click();
}

$("input#exportcsv").click(function(){
	if (!dryx) return false;
	if (dryx.pFit.length == 0) return false;
	var lbls = ["i", "epoch"].concat(methods[peak.method].labels);
	exportcsv(dryx.pFit, lbls);
});

