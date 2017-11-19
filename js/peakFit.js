;(function(){
	"use strict";

	var trapz = function(xy, cols=[0,1]) {
		var i = xy[0];
		var f = xy.slice(-1)[0]; 
		var h = (f[cols[0]] - i[cols[0]])/xy.length;
		var sum = xy.reduce(function(a, b){
			return a + b[cols[1]];
		}, 0);
		return sum*h - 0.5*h*(i[cols[1]] + f[cols[1]]);
	};

	var methods = {
		gauss: {
			name: "Gauss",
			fn: function(x, params) {
				var y0 = params[0];
				var xc = params[1];
				var A = params[2];
				var w = params[3];
				return y0 + A*(Math.sqrt(4.*Math.log(2.))/(Math.sqrt(Math.PI)*w))*Math.exp(-(4.*Math.log(2.)/(w*w))*(x-xc)*(x-xc));
			},
			n: 4,
			labels: ["y0", "xc", "A", "w"],
			p0: function(xy, cols=[0,1]) {
				var xymax = xy[0], xymin = xy[0];
				xy.forEach(function(curr, i, arr){
					if (curr[cols[1]] > xymax[cols[1]]) xymax = curr;
					if (curr[cols[1]] < xymin[cols[1]]) xymin = curr;
				});
				var I = xymax[cols[1]];
				var xc = xymax[cols[0]];
				var y0 = xymin[cols[1]];
				var A = trapz(xy, cols) - Math.abs(xy.slice(-1)[cols[0]][0] - xy[cols[0]][0])*y0;
				var w = 0.939*A/(I-y0);
				return [y0, xc, A, w];
			}, 
			equation: "$$y = y_0 + A\\*\\frac{\\sqrt{4\\*\\ln{2}}}{\\sqrt{\\pi}\\*w}\\*\\exp\\left[-\\frac{4\\*\\ln{2}}{w^2}\\*(x-x_c)^2\\right]$$"
		},
		lorentz: {
			name: "Lorentz",
			fn: function(x, params) {
				var y0 = params[0];
				var xc = params[1];
				var A = params[2];
				var w = params[3];
				return y0 + A*(2./Math.PI)*(w/(4.*(x-xc)*(x-xc)+w*w));
			},
			n: 4,
			labels: ["y0", "xc", "A", "w"],
			p0: function(xy, cols=[0,1]) {
				var xymax = xy[0], xymin = xy[0];
				xy.forEach(function(curr, i, arr){
					if (curr[cols[1]] > xymax[cols[1]]) xymax = curr;
					if (curr[cols[1]] < xymin[cols[1]]) xymin = curr;
				});
				var I = xymax[cols[1]];
				var xc = xymax[cols[0]];
				var y0 = xymin[cols[1]];
				var A = trapz(xy, cols) - Math.abs(xy.slice(-1)[cols[0]][0] - xy[cols[0]][0])*y0;
				var w = 0.637*A/(I-y0);
				return [y0, xc, A, w];
			},
			equation: "$$y = y_0 + A\\*\\*\\frac{2}{\\pi}\\*\\frac{w}{4\\*(x-x_c)^2+w^2}$$"
		},
		psdVoigt1: {
			name: "Pseudo-Voigt 1",
			fn: function(x, params) {
				var y0 = params[0];
				var xc = params[1];
				var A = params[2];
				var w = params[3];
				var mu = params[4];
				return y0 + A*(mu*(2./Math.PI)*(w/(4.*(x-xc)*(x-xc)+w*w))+(1.-mu)*(Math.sqrt(4.*Math.log(2.))/(Math.sqrt(Math.PI)*w))*Math.exp(-(4.*Math.log(2.)/(w*w))*(x-xc)*(x-xc)));
			},
			n: 5,
			labels: ["y0", "xc", "A", "w", "mu"],
			p0: function(xy, cols=[0,1]) {
				var xymax = xy[0], xymin = xy[0];
				xy.forEach(function(curr, i, arr){
					if (curr[cols[1]] > xymax[cols[1]]) xymax = curr;
					if (curr[cols[1]] < xymin[cols[1]]) xymin = curr;
				});
				var I = xymax[cols[1]];
				var xc = xymax[cols[0]];
				var y0 = xymin[cols[1]];
				var A = trapz(xy, cols) - Math.abs(xy.slice(-1)[cols[0]][0] - xy[cols[0]][0])*y0;
				var w = 0.788*A/(I-y0);
				var mu = .5;
				return [y0, xc, A, w, mu];
			}, 
			mcon: 2,
			con: function(con, p) {
				con[0] = 1 - p[4];
				con[1] = p[4];
			},
			equation: "$$y = y_0 + A\\left\\{\\mu\\*\\frac{2}{\\pi}\\*\\frac{w}{4\\*(x-x_c)^2+w^2} + \\left(1-\\mu\\right)\\*\\frac{\\sqrt{4\\*\\ln{2}}}{\\sqrt{\\pi}\\*w}\\*\\exp\\left[-\\frac{4\\*\\ln{2}}{w^2}\\*(x-x_c)^2\\right]\\right\\}$$"
		}
	};

	var PeakFit = function(xy, cols, method, options = {}) {
		var self = this;
		self.xy = xy;
		self.c = cols || [0, 1];
		
		self.labels = ["tth", "I", "estimative", "fit"];
		self.result = [];
		
		self.method = method || "psdVoigt1";
		self.nvar = methods[self.method].n || 5;
		self.mcon = methods[self.method].mcon || 0;
		self.rhobeg = options.rhobeg || 5.0;
		self.rhoend = options.rhoend || 1.0e-5;
		self.iprint = options.iprint || 0;
		self.maxfun = options.maxfun || 3500;

		self.p0 = [];
		self.p = [];
		self.r = 0;

		self.fn = function(x, params) {
			return methods[self.method].fn(x, params);
		};
		self.fnMin = function(n, m, p, con) { // Objective function
			if (m > 0) {
				methods[self.method].con(con, p);
			}
			return self.xy.reduce(function(a, b){
				return a + Math.pow(self.fn(b[self.c[0]], p) - b[self.c[1]], 2);
			}, 0);
		};
		self.fit = function() {
			self.p0 = methods[self.method].p0(self.xy, self.c);
			self.p = self.p0.slice();
			self.r = FindMinimum(self.fnMin, self.nvar, self.mcon, self.p, self.rhobeg, self.rhoend, self.iprint, self.maxfun);

			self.result = new Array(self.xy.length);
			self.xy.forEach(function(curr, i, arr) {
				self.result[i] = [curr[self.c[0]], curr[self.c[1]], self.fn(curr[self.c[0]],self.p0), self.fn(curr[self.c[0]],self.p)];
			});
		}
	};

	if (typeof exports !== 'undefined') {
		module.exports = PeakFit;
		module.exports = methods;
	} else {
		window.PeakFit = PeakFit;
		window.methods = methods;
	}
}());
