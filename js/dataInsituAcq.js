;(function(){
	"use strict";

	/* Function that parses input file into data array and epoch values */
	var parseData = function(datatype, str, nstep, ncols) {
		var arr = str.split("\n");
		var vals, line, ep, acq = [];
		var rawEpoch = [];
		var i = 0, j = 0;
		var data = [];
		arr.forEach(function(line, i){
			if (line[0] == "#" || line == "") {	// ignores commented lines (#) unless...
				if (datatype == "mythen") {
					if (line.slice(0,2) == "#E") {	// ...it begins with #E. In this case Get acquisition epoch
						ep = line.split(" ")[1];
						rawEpoch.push(parseFloat(ep));
					}
				}
			} else {
				vals = [];
				line.split(" ").forEach(function(v, k){
					vals.push(parseFloat(v));
				});
				if (vals.length == ncols) {
					acq.push(vals);
					j++;
					if (j >= nstep) {
						j = 0;
						data.push(acq);
						acq = [];
					}
				}
			}
		});
		var epoch = new Array(data.length);
		if (datatype == "mythen") {
			for (j = 0; j < epoch.length; j++) {
				epoch[j] = (rawEpoch[2*j] + rawEpoch[2*j+1])/2;
			}
		} else {
			for (j = 0; j < data.length; j++) {
				epoch[j] = j;
			}
		}

		return {data: data, epoch: epoch};
	};

	/* Class for loading and plotting diffractogram and fitted curve */
	var DataInsituAcq = function(file, datatype="mythen", nstep=2560, labels=["tth", "index", "I"], visibility=[false,true]) {
		var self = this;
		self.file = file;
		self.data = [];
		self.epoch = [];
		self.time = [];
		self.temp = [];
		self.acq = 0;

		self.nstep = nstep;
		self.labels = labels;
		self.visibility = visibility;
		self.ncols = self.labels.length;
		

		self.pFit = [];
		self.pRes = [];

		self.loadCallback = function(){};
		self.plotCallback = function(){};
		self.getXrangeCallback = function(){};

		self.reader = new FileReader();
		self.reader.onload = function(e) {
			var result = parseData(datatype, e.target.result, self.nstep, self.ncols);
			self.data = result.data;
			self.epoch = result.epoch;
			self.time = new Array(result.data.length).fill(0);
			self.temp = new Array(result.data.length).fill(0);
		}
		self.reader.onloadend = function(e) {
			if (typeof(self.loadCallback) == "function") {
				self.loadCallback();
			}
		}

		self.load = function() {
			self.reader.readAsText(file, "UTF-8");
		}

		self.plot = function(where) {
			if (self.data.length == 0) return false
			if (typeof(self.g) == "undefined") {
				self.g = new Dygraph(where, self.data[0], {labels: self.labels, visibility: self.visibility, zoomCallback: self.getXrange, underlayCallback: self.drawFittedCurve});
			} else {
				self.g.updateOptions({"file": self.data[self.acq]});
			}
			self.getXrange();

			if (typeof(self.plotCallback) == "function") {
				self.plotCallback()
			}
		}

		self.drawFittedCurve = function(ctx, area, dygraph) {
			if (!self.pRes[self.acq]) {
				return false;
			} else {
				if (self.pRes[self.acq].length == 0) {
					return false
				}
				ctx.save();
				ctx.strokeStyle = "#FF0000";
				ctx.lineWidth = 1.0;
				ctx.beginPath();
				var p = self.g.toDomCoords(self.pRes[self.acq][0][0], self.pRes[self.acq][0][3]);
				ctx.moveTo(p[0], p[1]);
				for (var i = 1; i < self.pRes[self.acq].length; i++) {
					p = self.g.toDomCoords(self.pRes[self.acq][i][0], self.pRes[self.acq][i][3]);
					ctx.lineTo(p[0], p[1]);
					ctx.closePath();
					ctx.stroke();
					ctx.moveTo(p[0], p[1]);
				}
				ctx.restore();
			}
		};

		self.getXrange = function() {
			self.xmin = self.g.layout_.points[0][0].xval.toFixed(2);
			self.xmax = self.g.layout_.points[0].slice(-1)[0].xval.toFixed(2);

			if (typeof(self.getXrangeCallback) == "function") {
				self.getXrangeCallback();
			}
		};
	};

	if (typeof exports !== 'undefined') {
		module.exports = DataInsituAcq;
		// module.exports = parseDataMythen;
		module.exports = parseData;
	} else {
		window.DataInsituAcq = DataInsituAcq;
		// window.parseDataMythen = parseDataMythen;
		window.parseData = parseData;
	}
}());