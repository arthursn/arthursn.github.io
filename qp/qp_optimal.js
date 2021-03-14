"use strict";

var K = 273.15;
var R = 8.314;
var Tr = 25;    // Room temperature

var MsAndrews = function(wC) {
    /*Calculates Ms by Andrews equation*/
    return 539 - 423*wC;
};

var fausKM = function(TC, beta, Ms) {
    /*Calculates the untransformed fraction of austenite by Koistinen-Marburger equation*/
    var T = TC + K;
    return Math.exp(-beta*(Ms - TC));
};

var fmarKM = function(TC, beta, Ms) {
    /*Calculates the transformed fraction of martensite by Koistinen-Marburger equation*/
    return 1 - fausKM(TC, beta, Ms);
};

var w2x = function(x) {
    /*Weight fraction to mole fraction in a binary Fe-C alloy*/
    return (x/12)/(x/12 + (1-x)/56);
};

var x2w = function(x) {
    /*Mole fraction to weight fraction in a binary Fe-C alloy*/
    return 12*x/(12*x + 56*(1-x));
};

var CCE = function(xCaus, TC) {
    /*Given a temperature TC and the mole fraction of carbon in austenite (xCaus) returns 
    the mole fraction of carbon in ferrite with the same chemical potential. Equation derived
    from Lobo and Geiger approximations, put in the presented form by Bhadeshia */
    var T = TC + K;
    return xCaus*Math.exp(-(76789-43.8*T-(169105-120.4*T)*xCaus)/(R*T));
};

var derivative = function(f, x, dx) {
    /*Returns the numerical derivative in x of a function f by applying the central differences
    method. dx is the step used to calculate the derivative*/
    return (f(x+dx)-f(x-dx))/(2*dx);
};

var compute = function(params, Trng=300, Tstp=.5) {
    /*Computes the final state of austenite and martensite after the carbon partitioning
    for several quenching temperatures ranging 
        from Ms - Trng to Ms °C at steps of Tstp °C
    or, if Ms - Trng < 25 °C
        from 25 to Ms °C at steps of Tstp °C

    params is an object containing all the necessary parameters for solving the problem:
        params.wCi    : initial carbon content (initial weight fraction of carbon)
        params.Ms     : martensite start temperature in °C (will be used in the KM equation)
        params.beta   : beta parameter in the KM equation
        params.method : string 'cce' || 'decarb'. If the 'cce' option is set, calculates the 
                        constrained carbon equilibrium. Else, it will assume that martensite
                        is completely decarburized after the partitioning step.
        params.PT     : partitioning temperature in °C
    */
    var xCi = w2x(params.wCi/100);  // weight to mole fraction

    var data = [];  // array containing the temperature, phase fraction and carbon compositions
    var fausi, fausf, fausCCE, fmarCCE, fmarfr;
    var xCmar, xCaus;
    var newMs;
    var i = 0, iopt = 0, fopt = 0;
    for (var TC=Math.max(params.Ms-Trng,Tr); TC<=params.Ms; TC+=Tstp) {
        fausi = fausKM(TC, params.beta, params.Ms);     // KM equation

        if (params.method == "cce") {
            /*Calculates the final state assuming CCE*/
            var f = function(xCaus) {
                /*Newton method will be applied to this function*/
                var fausCCE = fausi*(1 - xCi)/(1 - xCaus);  // changing carbon content slightly changes the phase fraction
                var fmarCCE = 1 - fausCCE;
                return fmarCCE*CCE(xCaus, params.PT) + fausCCE*xCaus - xCi;  // function to be zeroed
            };
            var fprime = function(xCaus) {
                /*Derivative of f*/
                return derivative(f, xCaus, .01e-2);
            };
            
            xCaus = findRoot(f, fprime, xCi);   // finds root of f given xCi as initial value. Answer is the carbon content of austenite in CCE
            if (xCaus > .5) {
                xCaus = .5;
            }
            fausCCE = fausi*(1 - xCi)/(1 - xCaus);  // changing carbon content slightly changes the phase fraction
            fmarCCE = 1 - fausCCE;  // phase fraction of martensite
            xCmar = (xCi - fausCCE*xCaus)/fmarCCE;  // carbon in martensite
        } else {
            /*Applies the conservation laws (mass balance) to determine the final state*/
            fausCCE = xCi + fausi*(1 - xCi);
            xCaus = xCi/fausCCE;
            fausCCE = fausi*(1 - xCi)/(1 - xCaus);
            fmarCCE = 1 - fausCCE;
            xCmar = 0;
        }

        newMs = MsAndrews(100*x2w(xCaus));  // Ms of the carbon-enriched austenite
        if (newMs > Tr) {
            fmarfr = fausi*(1 - fausKM(Tr, params.beta, newMs));
            fausf = fausCCE*fausKM(Tr, params.beta, newMs);;
        } else {    // if the new Ms is below the room temperature then all the initial austenite is stabilized
            fmarfr = 0;
            fausf = fausCCE;
        }

        data.push([TC, fausf, fausCCE, fmarCCE, fmarfr, 100*x2w(xCaus), 100*x2w(xCmar)]);
        
        if (fausf > fopt) { // optimal temperature
            iopt = i;
            fopt = fausf;
        }
        i++;
    }
    var labels = ["TC", "fγf", "fγi", "fα'i", "fα'fr", "Cγ", "Cα'"];    // labels of the array 'data'
    return {data: data, labels: labels, iopt: iopt, Topt: data[iopt][0].toFixed(0)};
};

/*****************************************************/
var encodeQuery = function() {
    var query = {};
    $.each($("input.param"), function(i, dom) {
        query[$(dom).attr("name")] = $(dom).val();
    });
    $.each($("input.method"), function(i, dom) {
        if (dom.checked == true) {
            query[$(dom).attr("name")] = $(dom).val();
        }
    });
    var plot = [];
    $.each($("input[name=plot]"), function(i, dom) {
        if (dom.checked == true) {
            plot.push($(dom).val());
        }
    });
    query["plot"] = plot;
    return URI().search(query).href();
};

/*****************************************************/

var exportcsv = function(result) {
    /*Export data as csv file*/
    var csvContent = "data:text/csv;charset=utf-8,";
    csvContent += result.labels.join(";") + "\n";
    csvContent = result.data.reduce(function(a, b) {
        return a + b.join(";") + "\n";
    }, csvContent);
    var encodeUri = encodeURI(csvContent);
    var link = $("#linkcsv");
    link.attr("href", encodeUri);
    link.attr("download", "data.csv");
    link[0].click();
}

/*****************************************************/
var getParams = function(fromUrl, paramsDefault) {
    /*get parameters from the 'input' fields defined in the HTML code*/
    var PT, wCi, beta, Ms, method;
    if (fromUrl) {
        var query = URI().query();
        var params = URI.parseQuery(query);
        PT = parseFloat(params.PT) || paramsDefault.PT;
        wCi = parseFloat(params.wCi) || paramsDefault.wCi;
        beta = parseFloat(params.beta) || paramsDefault.beta;
        Ms = parseFloat(params.Ms) || paramsDefault.Ms;
        method = params.method || paramsDefault.method;
    } else {
        PT = parseFloat($("input[name=PT]").val());
        wCi = parseFloat($("input[name=wCi]").val());
        beta = parseFloat($("input[name=beta]").val());
        Ms = parseFloat($("input[name=Ms]").val());
        method = $("input[name=method]:checked").val();
    }
    return {"PT": PT, "wCi": wCi, "beta": beta, "Ms": Ms, "method": method};
};

var setParams = function(params) {
    /*set parameters to the 'input' fields*/
    $("input[name=PT]").val(params.PT);
    $("input[name=wCi]").val(params.wCi);
    $("input[name=beta]").val(params.beta);
    $("input[name=Ms]").val(params.Ms);
    $.each($("input[name=method]"), function(i, dom) {
        if ($(dom).val() == params.method) {
            dom.checked = true;
        }
    });
};

var togglePlotStatus = function(g, el) {
    g.setVisibility(parseInt(el.id), el.checked);
};

var setPlotStatus =  function(g, plotList) {
    $.each($("input[name=plot]"), function(i, dom) {
        if (plotList.includes($(dom).val()) == true) {
            dom.checked = true;
        } else {
            dom.checked = false;
        }
        g.setVisibility(parseInt(dom.id), dom.checked);
    });
};

var plot = function(result) {
    return new Dygraph($('#chart')[0], result.data, {
        labels: result.labels,
        legend: "always",
        xlabel: "Quenching temperature (°C)",
        ylabel: "Phase fraction",
        y2label: "Carbon content (wt.%)",
        series: {
            "Cγ": {axis: "y2"},
            "Cα'": {axis: "y2"},
        }
    });
};

var data2str = function(result, i) {
    /*Receives the array 'result' (output of function 'compute') and parses it into a string*/
    var str = [];
    result.data[i].forEach(function(v, j){
        str.push(result.labels[j] + ": " + v);
    });
    return str.join("\n");
}

$(function(){
    var query = URI().query();
    var params = URI.parseQuery(query);
    var paramsDefault = getParams();
    var plotListDefault = [];
    $.each($("input[name=plot]:checked"), function(i, dom){
        plotListDefault.push($(dom).val());
    });

    var plotList = params.plot || plotListDefault;
    if (typeof(plotList) != "object") {
        plotList = [plotList];
    }
    plotList.unshift("T");

    var params = getParams(true, paramsDefault);
    setParams(params);

    var result = compute(params);
    $("#Topt").html(result.Topt).attr("title", data2str(result, result.iopt));
    var g = plot(result);
    setPlotStatus(g, plotList);

    $("input[name=plot]").click(function(){
        togglePlotStatus(g, this);
        history.pushState(null, null, encodeQuery());
    });

    $("input#selectAll").click(function(){
        $.each($("input[name=plot]"), function(i, el){
            el.checked = true;
            togglePlotStatus(g, el);
        });
        history.pushState(null, null, encodeQuery());
    });

    $("input#deselectAll").click(function(){
        $.each($("input[name=plot]"), function(i, el){
            el.checked = false;
            togglePlotStatus(g, el);
        });
        history.pushState(null, null, encodeQuery());
    });

    $("input.param, input[name=method]").change(function(){
        result = compute(getParams());
        $("#Topt").html(result.Topt).attr("title", data2str(result, result.iopt));
        g.updateOptions({"file": result.data});
        history.pushState(null, null, encodeQuery());
    });

    $("label[for=Topt]").click(function(){
        alert(data2str(result, result.iopt));
    });

    $("input#reset").click(function(){
        setParams(paramsDefault);
        result = compute(getParams());
        $("#Topt").html(result.Topt).attr("title", data2str(result, result.iopt));
        g = plot(result);
        setPlotStatus(g, plotListDefault);
        history.pushState(null, null, location.pathname);
    });

    $("input#exportcsv").click(function(){
        exportcsv(result);
    });

    window.result = result;
});
