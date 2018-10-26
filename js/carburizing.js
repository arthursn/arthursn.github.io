"use strict";

// Global variables and functions

var K = 273.15;     // 0 Celsius in Kelvin
var R = 8.3144598;  // Gas constant in J/mol.K

var w2x = function(x) {
    // Converts weight fraction to mole fraction in a binary Fe-C alloy
    return (x/12)/(x/12 + (1-x)/56);
};

var x2w = function(x) {
    // Converts mole fraction to weight fraction in a binary Fe-C alloy
    return 12*x/(12*x + 56*(1-x));
};

var D = function(TC, xC) {
    // Diffusion coefficient of austenite according to Agren, 1985 
    // TC: Temperature in Celsius; xC: mole fraction of carbon     
    // Return D in um^2/s                                          
    var T = TC + K;
    var yC = xC/(1 - xC);

    var preExp = 4.53e5*(1 + yC*(1 - yC)*8339.9/T);
    var exp = -(1/T - 2.221e-4)*(17767 - 26436*yC);
    return preExp*Math.exp(exp);    // um^2/s
};

var w2H = function(w, type="HV") {
    // Given a weight carbon percentage w, returns the expected hardness of the
    // martensitic structure.
    // w: weight carbon percentage; type: HV or HRC, the output hardness type
    // Data from A. Litwinchuk et al., J. Material Science, Vol. 11, 1976, p. 1200.
    var H;
    if (type == "HV") {
        H = -127.19061329*Math.pow(w,5) + 907.03314744*Math.pow(w,4) - 2048.52805601*Math.pow(w,3) + 1141.48291358*Math.pow(w,2) + 695.18294151*w + 263.04598012;
    } else {
        H = 7.35247546*Math.pow(w,5) - 49.43090942*Math.pow(w,4) + 123.8518122*Math.pow(w,3) - 176.93894801*Math.pow(w,2) + 137.65069739*w + 22.54730001
    }
    return H;
}

$(function() {
    var calculate = function() {
        var c0 = parseFloat($("#calculator [name=c0-calc]").val());
        var TC = parseFloat($("#calculator [name=TC-calc]").val());
        var DD = D(TC, w2x(c0/100.))*1e-12;
        $("#calculator [name=D-calc]").val(DD.toPrecision(4));
    };
    calculate();

    $("#calculator input").change(function() {
        calculate();
    });
});

$(function() {
    var Tr = 25;        // Room temperature
    var maxn = 1000;    // max grid size
    var conversion = {
        length: {  // *unit* to um
            m: 1e6,
            cm: 1e4, 
            mm: 1e3, 
            um: 1,
            nm: 1e-3,
            A: 1e-4
        },
        time: {    // *unit* to s
            s: 1,
            min: 60,
            h: 3600,
            d: 86400
        }
    };
    var oldunits = {}
    // var warningMessage = "Tempo muito curto ou espessura muito grande para a temperatura escolhida. Isso faz que a grade fique muito refinada e a simulação demore demais.<br>Escolha parâmetros diferentes (<b>tempo maior, espessura menor ou temperatura maior</b>).";
    var warningMessage = "Time too short or austenite region too thick for the chosen temperature. This leads to a to fine grid and the simulation takes too long. Please choose different parameters (<b>longer time, narrower thickness, or higher temperature</b>).";

    var getUnits = function() {
        var uLength = $("select[name=u-length]").val();
        var uTime = $("select[name=u-time]").val();
        // units string
        var sLength = $("select[name=u-length] option:checked").html();
        var sTime = $("select[name=u-time] option:checked").html();
        // conversion factors
        var fLength = conversion.length[uLength];
        var fTime = conversion.time[uTime];

        return {
            length: {
                s: sLength,
                f: fLength
            },
            time: {
                s: sTime,
                f: fTime
            }
        };
    };

    var getParams = function() {
        // units
        var units = getUnits();

        $(".u-length").html(units.length.s);
        $(".u-time").html(units.time.s);

        // Gets parameters from input fields, evaluates some other variables, and returns object
        var model = $("input[name=model]:checked").val();   // Model type (D constant of as function of c)
        var TC = eval($("input[name=TC]").val());           // Temperature in °C
        var c0 = eval($("input[name=c0]").val());           // wt.% C in the bulk
        var cs = eval($("input[name=cs]").val());           // wt.% C in the surface
        var L = eval($("input[name=L]").val())/2;           // Length of the simulation domain (mm)
        var t = eval($("input[name=t]").val());             // time in minutes

        if (typeof oldunits.length !== "undefined") {
            L = L*oldunits.length.f/units.length.f;
            t = t*oldunits.time.f/units.time.f;
        }
        oldunits = units;  // set oldunits to current values        

        // update eval-ed values
        $("input[name=TC]").val(TC);
        $("input[name=c0]").val(c0);
        $("input[name=cs]").val(cs);
        $("input[name=L]").val(2*L);
        $("input[name=t]").val(t);
        
        c0 = w2x(c0/100);       // c0 in mole fraction
        cs = w2x(cs/100);       // cs in mole fraction
        L = L*units.length.f;   // L in um
        t = t*units.time.f;     // time in s

        // Simulation parameters
        var rmax = parseFloat($("input[name=rmax]").val());    // maximum allowed value of r
        var nit = parseInt($("input[name=nit]").val());        // number of iterations

        var Dmax = Math.max(D(TC, c0), D(TC, cs));  // max carbon diffusivity (um^2/s)
        var dt = t/nit;                             // time step (s)
        var dz = Math.sqrt(dt*Dmax/rmax);           // length step (um)
        var n = Math.round(L/dz + 1)                // grid size
        dz = L/(n-1);                               // recalculates dz
        
        var k = rmax*nit/(Dmax*Math.pow(maxn-1, 2));
        var tmin = k*L*L/units.time.f;              // tmin (min)
        var Lmax = 2*Math.sqrt(t/k)/units.length.f; // Lmax (mm)
        
        if (parseInt(tmin) > 1) {
            tmin = parseInt(tmin);
        } else {
            tmin = tmin.toPrecision(2);
        }

        if (parseInt(Lmax) > 1) {
            Lmax = parseInt(Lmax);
        } else {
            Lmax = Lmax.toPrecision(2);
        }

        $("input[name=n]").val(n);
        $("label .tmin").html("[min. " + tmin + " " + units.time.s + "]");
        $("label .Lmax").html("[max. " + Lmax + " " + units.length.s + "]");

        return {"TC": TC, "c0": c0, "cs": cs, "L": L, "n": n, "t": t, 
                "rmax": rmax, "dz": dz, "dt": dt, "dtdz2": dt/(dz*dz), 
                "nit": nit, "Dmax": Dmax, "tmin": tmin, "Lmax": Lmax,
                "units": units, "model": model};
    }

    var compute = function(p) {
        // Gets parameters p and runs simulation
        var data = [[0, 0, 0]];
        if (p.n == 1) {  // if gridsize is too small it's because the diffusion occurs too fast
            data = [[0, 100*x2w(p.cs), 100*x2w(p.c0)], [2*p.L/p.units.length.f, 100*x2w(p.cs), 100*x2w(p.c0)]];
        } else if (p.n <= maxn) {
            var r, g;
            var c = Array.apply(null, Array(p.n)).map(Number.prototype.valueOf, p.c0);
            c[0] = p.cs;
            var c1 = new Array(p.n);

            // Explicit finite differences method
            if (p.model == "var") {
                for (var it = 0; it < p.nit; ++it) {
                    for (var i = 1; i < c.length; ++i) {
                        r = D(p.TC, c[i])*p.dtdz2;  // r term
                        g = .25*(D(p.TC, c[i+1]) - D(p.TC, c[i-1]))*p.dtdz2;    // gradient term
                        c1[i] = (r - g)*c[i-1] + (1 - 2*r)*c[i] + (r + g)*c[i+1];
                    }
                    c1[0] = p.cs;
                    c1[c1.length-1] = c1[c1.length-2];  // Neumann boundary condition at node -1
                    c = c1.slice(0);    // make a copy of c1 to c
                }
            } else {
                var Dct = D(p.TC, p.c0);
                for (var it = 0; it < p.nit; ++it) {
                    for (var i = 1; i < c.length; ++i) {
                        r = Dct*p.dtdz2;  // r term
                        c1[i] = r*(c[i-1] + c[i+1]) + (1 - 2*r)*c[i];
                    }
                    c1[0] = p.cs;
                    c1[c1.length-1] = c1[c1.length-2];  // Neumann boundary condition at node -1
                    c = c1.slice(0);    // make a copy of c1 to c
                }
            }

            var z, ci, Hi;
            var c0 = 100*x2w(p.c0);
            var dataLeft = [];
            var dataRight = [];
            for (var i = 0; i < c.length; ++i) {
                ci = 100*x2w(c[i]);
                Hi = w2H(ci);

                z = i*p.dz/p.units.length.f;
                dataLeft.push([z, ci, c0, Hi]);
                
                z = 2*p.L/p.units.length.f - z;
                dataRight.push([z, ci, c0, Hi]);
            }
            data = dataLeft.slice(0,-1).concat(dataRight.reverse());
        }
        return data;
    };

    var alertBox = function(p) {
        if (p.n > maxn) {
            $(".help-box").html("<div class='alert alert-danger'>");
            $(".help-box > .alert-danger").html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;").append("</button>");;
            $(".help-box > .alert-danger").append(warningMessage);
            $(".help-box > .alert-danger").append("</div>");
        } else {
            $(".help-box").html("");
        }
    };

    /****************** Events ****************/

    var p = getParams();
    var data = compute(p)
    var labels = ['Posição', 'Teor de carbono', 'Carbono matriz', 'Dureza'];
    var visibility = {0: true, 1: true, 2: false};
    $.each(visibility, function(i, v) {
        $(".toggle-plot[value="+i+"]").attr("checked", v);
    });
    var graph = new Dygraph($("#chart")[0], data, {
            labels: labels,
            visibility: visibility,
            xlabel: 'Posição (' + p.units.length.s + ')',
            ylabel: 'Concentração de carbono (% peso)',
            y2label: 'Dureza (HV)',
            axes: {
                y: {valueRange: [0, x2w(p.cs)*120]}
                // y2: {valueRange: [0, 1000]}
            },
            series: {
                "Dureza": {
                    axis: "y2"
                }
            }
        });
    alertBox(p);

    $("#params .form-control, input[name=model]").change(function(){
        // Event triggered when changing value in input field. If gridsize is bigger
        // than maxn, shows alert message. Otherwise, runs simulation
        var p = getParams();
        data = compute(p);
        graph.updateOptions({
                file: data,
                axes: {
                    y: {valueRange: [0, x2w(Math.max(p.c0, p.cs))*120]}
                    // y2: {valueRange: [0, 1000]}
                },
                xlabel: 'Posição (' + p.units.length.s + ')'
            });  // updates plotting range
        alertBox(p);
    });

    $(".toggle-plot").change(function(){
        graph.setVisibility($(this).val(), $(this).is(":checked"));
    });

    $("#select-all").click(function(){
        $(".toggle-plot").not(":checked").trigger("click");
    });

    $("#clean-all").click(function(){
        $(".toggle-plot:checked").trigger("click");
    });

    $("#exportcsv").click(function() {
        // Exports data as csv file
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
        // Exports data as text file
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