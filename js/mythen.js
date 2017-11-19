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

var peak, dmyt;

DataInsituAcq.prototype.setCallbacks = function() {
	this.loadCallback = function() {
		$("#fromacq").val(1);
		$("#fromacq").attr("max", this.data.length);
		$("#toacq").val(this.data.length);
		$("#toacq").attr("max", this.data.length);
		$("#acq").val(1);
		$("#acq").attr("max", this.data.length);
		$("#nacq").html(" / "+(this.data.length));
		$("#epoch").html(this.epoch[0].toFixed(2) + " (0.00) sec");
		this.plot($("#chart")[0]);
	}
	this.plotCallback = function() {
		$("#from").attr("min", this.xmin);
		$("#from").attr("max", this.xmax);
		$("#from").val(this.xmin);
		$("#to").attr("min", this.xmin);
		$("#to").attr("max", this.xmax);
		$("#to").val(this.xmax);
		$("#epoch").html(this.epoch[this.acq].toFixed(2) + " (" + (this.epoch[this.acq]-this.epoch[0]).toFixed(2) + ") sec");
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

$("input#mythen").change(function(e){
	var file = e.target.files[0];
	if (!file) return false;
	dmyt = new DataInsituAcq(file);
	dmyt.setCallbacks();
	peak = new PeakFit(null, [0, 2], $("select#method").prop("value"), {rhoend: 1e-4, maxfun: 500});
	dmyt.load();
});

$("select#method").change(function(){
	if (!dmyt) return false;
	peak = new PeakFit(null, [0, 2], $("select#method").prop("value"), {rhoend: 1e-4, maxfun: 500});
	dmyt.pFit = [];
	dmyt.pRes = [];
	dmyt.g.updateOptions({});
});

$("input#acq").change(function(){
	if (!dmyt) return false;
	checkLimits(this);
	dmyt.acq = parseInt($("#acq").val()) - 1;
	dmyt.plot();
});

$("input#fromacq").change(function(){
	if (!dmyt) return false;
	checkLimits(this, $("#fromacq"), $("#toacq"));
	$("#acq").val($(this).val());
	dmyt.acq = parseInt($("#acq").val()) - 1;
	dmyt.plot();
});

$("input#toacq").change(function(){
	if (!dmyt) return false;
	checkLimits(this, $("#fromacq"), $("#toacq"));
});

$("input#from, input#to").change(function(){
	if (!dmyt) return false;
	checkLimits(this, $("#from"), $("#to"));
	var from = parseFloat($("#from").val());
	var to = parseFloat($("#to").val());
	dmyt.g.updateOptions({dateWindow: [from, to]});
});

$("input#fit").click(function(){
	if (!dmyt) return false;
	$("#messagebox").html("Work in progress... ");
	var from = dmyt.g.layout_.points[0][0].idx;
	var to = dmyt.g.layout_.points[0].slice(-1)[0].idx;
	dmyt.acq = parseInt($("#acq").val()) - 1;
	window.setTimeout(function(){
		peak.xy = dmyt.data[dmyt.acq].slice(from, to);
		peak.fit();
		dmyt.pFit[dmyt.acq] = [dmyt.acq, dmyt.epoch[dmyt.acq]];
		dmyt.pFit[dmyt.acq].push(peak.p);
		dmyt.pRes[dmyt.acq] = peak.result;
		dmyt.g.updateOptions({"file": dmyt.data[dmyt.acq]});
		console.log(peak.p);
		$("#messagebox").append("done!");
	}, 0);
});

$("input#autofit").click(function(){
	if (!dmyt) return false;
	$("#messagebox").html("Work in progress... ");
	var from = dmyt.g.layout_.points[0][0].idx;
	var to = dmyt.g.layout_.points[0].slice(-1)[0].idx;
	var fromacq = parseInt($("#fromacq").val()) - 1;
	var toacq = parseInt($("#toacq").val()) - 1;
	$("input:not(#cancel)").prop("disabled", true);
	$("select").prop("disabled", true);
	var j = fromacq;
	peak.iter = window.setInterval(function(){
		if (j <= toacq) {
			peak.xy = dmyt.data[j].slice(from, to);
			peak.fit();
			dmyt.pFit[j] = [j, dmyt.epoch[j]].concat(peak.p);
			dmyt.pRes[j] = peak.result;
			$("#acq").val(j+1);
			dmyt.acq = j++;
			dmyt.g.updateOptions({"file": dmyt.data[dmyt.acq]});
			console.log(dmyt.acq);
		} else {
			clearInterval(peak.iter);
			$("#messagebox").append("done!");
			$("input").prop("disabled", false);
			$("select").prop("disabled", false);
		}
	}, 0);
});

$("input#clearcurr").click(function(){
	if (!dmyt) return false;
	dmyt.acq = parseInt($("#acq").val()) - 1;
	dmyt.pFit[dmyt.acq] = [];
	dmyt.pRes[dmyt.acq] = [];
	dmyt.g.updateOptions({});
});

$("input#clearall").click(function(){
	if (!dmyt) return false;
	dmyt.pFit = [];
	dmyt.pRes = [];
	dmyt.g.updateOptions({});
});

$("input#cancel").click(function(){
	if (!dmyt) return false;
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
	if (!dmyt) return false;
	if (dmyt.pFit.length == 0) return false;
	var lbls = ["i", "epoch"].concat(methods[peak.method].labels);
	exportcsv(dmyt.pFit, lbls);
});

