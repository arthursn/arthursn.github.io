"use strict";

$(function(){
    var K = 273.15;     // 0 Celsius in Kelvin
    var R = 8.3144598;  // Gas constant in J/mol.K
    var Tr = 25;        // Room temperature
    var maxit = 20000;  // max number of iterations
    var warningMessage = "Number of iterations exceeds maximum. Please redefine your parameters";

    var w2x = function(x) {
        /* Converts weight fraction to mole fraction in a binary Fe-C alloy */
        return (x/12)/(x/12 + (1-x)/56);
    };

    var x2w = function(x) {
        /* Converts mole fraction to weight fraction in a binary Fe-C alloy */
        return 12*x/(12*x + 56*(1-x));
    };

    var D = function(TC, xC) {
        /* Diffusion coefficient of austenite according to Agren, 1985 */
        var T = TC + K;
        var yC = xC/(1 - xC);

        var preExp = 4.53e5*(1 + yC*(1 - yC)*8339.9/T);
        var exp = -(1/T - 2.221e-4)*(17767 - 26436*yC);
        return preExp*Math.exp(exp);    // um^2/s
    };

    var getParams = function() {
        /* Gets parameters from input fields, evaluates some other variables, and returns object */
        var TC = eval($("input[name=TC]").val());           // Temperature in °C
        var c0 = eval($("input[name=c0]").val());           // wt.% C in the bulk
        var cs = eval($("input[name=cs]").val());           // wt.% C in the surface
        var L = eval($("input[name=L]").val());             // Length of the simulation domain (mm)
        var n = parseInt($("input[name=n]").val()) + 1;     // grid size of the simulation
        var t = eval($("input[name=t]").val());             // time in minutes
        var rmax = eval($("input[name=rmax]").val());       // maximum allowed value of r
        $("input[name=TC]").val(TC);
        $("input[name=c0]").val(c0);
        $("input[name=cs]").val(cs);
        $("input[name=L]").val(L);
        $("input[name=t]").val(t);
        $("input[name=rmax]").val(rmax);
        c0 = w2x(c0/100);   // c0 in mole fraction
        cs = w2x(cs/100);   // cs in mole fraction
        L = L*1000          // L in um
        t = t*60;           // time in seconds

        var Dmax = Math.max(D(TC, c0), D(TC, cs));  // max diffusivity (um^2/s)
        var dz = L/(n-1);                           // length step in um
        var dt = rmax*dz*dz/Dmax;                   // time step s
        var nit = Math.round(t/dt);                 // number of iterations
        var dtdz2 = dt/(dz*dz);                     // dt/dz^2
        $("input[name=nit]").val(nit);

        return {"TC": TC, "c0": c0, "cs": cs, "L": L, "n": n, "t": t, "rmax": rmax, "dz": dz, "dt": dt, "dtdz2": dtdz2, "nit": nit};
    }

    var compute = function(p) {
        /* Gets parameters p and runs simulation */
        var r, g;
        var c = Array.apply(null, Array(p.n)).map(Number.prototype.valueOf, p.c0);
        c[0] = p.cs;
        var c1 = new Array(p.n);

        for (var it = 0; it < p.nit; ++it) {
            // Explicit finite differences method
            for (var i = 1; i < c.length; ++i) {
                r = D(p.TC, c[i])*p.dtdz2;  // r term
                g = .25*(D(p.TC, c[i+1]) - D(p.TC, c[i-1]))*p.dtdz2;    // gradient term
                c1[i] = (r - g)*c[i-1] + (1 - 2*r)*c[i] + (r + g)*c[i+1];
            }
            c1[0] = p.cs;
            c1[c1.length-1] = c1[c1.length-2];  // Neumann boundary condition at node -1
            c = c1.slice(0);    // make a copy of c1 to c
        }

        var z;
        data = [];
        for (var i = 0; i < c.length; ++i) {
            z = i*p.dz/1000;
            data.push([z, 100*x2w(c[i]), 100*x2w(p.c0)]);
        }

        return data;
    };

    /****************** Events ****************/

    var p = getParams();
    var data = compute(p)
    var labels = ['Profundidade', 'Teor de carbono', 'Carbono matriz'];
    var graph = new Dygraph($("#chart")[0], data,
        {
            valueRange: [0, x2w(p.cs)*120],
            labels: labels,
            xlabel: 'Profundidade (mm)',
            ylabel: 'Concentração de carbono (% peso)'
        });

    $("input").change(function(){
        /* Event triggered when changing value in input field. If number of iterations
        is lower than maxit, shows alert message. Otherwise, runs simulation */
        var p = getParams();
        if (p.nit > maxit) {
            $("input[name=nit]").addClass("outrange");
            alert(warningMessage);
        } else {
            $("input[name=nit]").removeClass("outrange");
            data = compute(p);
            graph.updateOptions({"file": data, "valueRange": [0, x2w(Math.max(p.c0, p.cs))*120]});  // updates plotting range
        }
    });

    $("#exportcsv").click(function() {
        /* Exports data as csv file */
        var fileContent = "data:text/csv;charset=utf-8,";
        fileContent += labels.join(",") + "\n";
        fileContent = data.reduce(function(a, b) {
            return a + b.join(",") + "\n";
        }, fileContent);
        var encodeUri = encodeURI(fileContent);
        var link = $("#linkcsv");
        link.attr("href", encodeUri);
        link.attr("download", "data.csv");
        link[0].click();
    });

    $("#exporttxt").click(function() {
        /* Exports data as text file */
        var fileContent = "data:text/plain;charset=utf-8,";
        fileContent += "#" + labels.join(", ") + "\n";
        fileContent = data.reduce(function(a, b) {
            return a + b.join(" ") + "\n";
        }, fileContent);
        var encodeUri = encodeURI(fileContent);
        var link = $("#linktxt");
        link.attr("href", encodeUri);
        link.attr("download", "data.txt");
        link[0].click();
    });
});