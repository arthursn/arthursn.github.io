"use strict";

var methods = {
    HV: {
        name: "HV",
        description: "Vickers (HV)",
        // description: "Vickers Hardness Number (HV)",
        t1: [238,243,248,254,260,266,272,279,286,294,302,310,318,327,336,345,354,363,372,382,392,402,412,423,434,446,458,471,484,498,513,528,544,560,577,595,613,633,653,674,697,720,746,772,800,832,865,900,940],
        t2: [100,101,103,104,106,107,108,110,112,114,116,117,119,121,123,125,127,130,132,135,137,139,141,144,147,150,153,156,159,162,165,169,172,176,180,185,190,195,200,205,210,216,222,228,234,240],
        rng: [100, 940],
        ndec: 0
    },
    HBS: {
        name: "HBS",
        description: "Brinell Standard Ball, 3000 kgf (HBS)",
        // description: "Brinell Hardness Number 10 mm Standard Ball, 3000 kgf (HBS)",
        t1: [226,231,237,243,247,253,258,264,271,279,286,294,301,311,319,327,336,344,353,362,371,381,390,400,409,421,432,442,451,(464),(475),(487),(500)],
        t2: [100,101,103,104,106,107,108,110,112,114,116,117,119,121,123,125,127,130,132,135,137,139,141,144,147,150,153,156,159,162,165,169,172,176,180,185,190,195,200,205,210,216,222,228,234,240],
        rng: [100, 463],
        ndec: 0
    },
    HBW: {
        name: "HBW",
        description: "Brinell Carbide Ball, 3000 kgf (HBW)",
        // description: "Brinell Hardness Number 10 mm Carbide Ball, 3000 kgf (HBW)",
        t1: [226,231,237,243,247,253,258,264,271,279,286,294,301,311,319,327,336,344,353,362,371,381,390,400,409,421,432,443,455,469,481,496,512,525,543,560,577,595,615,634,(654),(670),(688),(705),(722),(739)],
        t2: [100,101,103,104,106,107,108,110,112,114,116,117,119,121,123,125,127,130,132,135,137,139,141,144,147,150,153,156,159,162,165,169,172,176,180,185,190,195,200,205,210,216,222,228,234,240],
        rng: [100, 653],
        ndec: 0
    },
    HK: {
        name: "HK",
        description: "Knoop Hardness Number 500 gf and Over (HK)",
        t1: [251,256,261,266,272,278,284,290,297,304,311,318,326,334,342,351,360,370,380,391,402,414,426,438,452,466,480,495,510,526,542,558,576,594,612,630,650,670,690,710,732,754,776,799,822,846,870,895,920],
        t2: [87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,114,115,117,118,120,122,124,125,127,129,131,133,135,137,139,141,143,145,147,150,152,155,158,161,164,167,170,173,176,180,184,188,192,196,201,206,211,216,221,226,231,236,241,246,251],
        rng: [87, 920],
        ndec: 0
    },
    HRA: {
        name: "HRA",
        description: "Rockwell A (HRA)",
        // description: "Rockwell Hardness Number A Scale, 60 kgf (HRA)",
        t1: [60.5,61,61.5,62,62.4,62.8,63.3,63.8,64.3,64.8,65.3,65.8,66.3,66.8,67.4,67.9,68.4,68.9,69.4,69.9,70.4,70.9,71.5,72,72.5,73.1,73.6,74.1,74.7,75.2,75.9,76.3,76.8,77.4,78,78.5,79,79.6,80.1,80.7,81.2,81.8,82.3,82.8,83.4,83.9,84.5,85,85.6],
        t2: [26.6,27,27.4,27.8,28.2,28.7,29.1,29.5,29.9,30.3,30.7,31.2,31.6,32,32.4,32.9,33.3,33.7,34.1,34.6,35,35.5,35.9,36.3,36.8,37.2,37.7,38.1,38.6,39,39.5,40,40.4,40.9,41.4,41.8,42.3,42.8,43.3,43.8,44.3,44.8,45.3,45.8,46.3,46.8,47.3,47.9,48.4,48.9,49.5,50,50.6,51.1,51.7,52.3,52.8,53.4,54,54.6,55.2,55.8,56.4,57,57.6,58.3,58.9,59.5,60.2,60.9,61.5],
        rng: [26.6, 85.6],
        ndec: 1
    },
    HRB: {
        name: "HRB",
        description: "Rockwell B (HRB)",
        // description: "Rockwell Hardness Number B Scale, 100 kgf (HRB)",
        t1: [],
        t2: [30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100],
        rng: [30, 100],
        ndec: 1
    },
    HRC: {
        name: "HRC",
        description: "Rockwell C (HRC)",
        // description: "Rockwell C Hardness Number 150 kgf (HRC)",
        t1: [20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68],
        t2: [],
        rng: [20, 68],
        ndec: 0
    },
    HSc: {
        name: "HSc",
        description: "Scleroscope Hardness Number",
        t1: [34.2,34.8,35.5,36.3,37,37.8,38.7,39.5,40.4,41.3,42.2,43.1,44.1,45.1,46.1,47.1,48.2,49.3,50.4,51.5,52.6,53.7,54.9,56.1,57.3,58.5,59.8,61.1,62.4,63.7,65.1,66.5,67.9,69.4,70.9,72.4,74,75.6,77.3,79,80.8,82.6,84.5,86.5,88.5,90.6,92.7,95,97.3],
        t2: [],
        rng: [34.2, 97.3],
        ndec: 1
    }
};

$(function(){
    var fromSet = [];
    $.each($("#from option"), function(i, obj){
        fromSet.push($(obj).val());
    });

    var toSet = [];
    $.each($("#to option"), function(i, obj){
        toSet.push($(obj).val());
    });

    var sortNumber = function(a, b){
        return a-b;
    };

    var setParamsUrl = function(p) {
        history.pushState(null, null, URI().search({from: p.from, to: p.to}).href());
    };

    var getParams = function(fromUrl) {
        /* Gets parameters and returns JSON object */
        var from = $("#from").val();    // Hardness type of the original values
        var to = $("#to").val();    // Hardness type of the converted values
        
        if (fromUrl) {
            var pQuery = URI.parseQuery(URI().query());
            if (typeof pQuery.from !== "undefined") {
                if ($.inArray(pQuery.from, fromSet) >= 0) {
                    from = pQuery.from;
                    $("#from").val(from);
                }
            }
            if (typeof pQuery.to !== "undefined") {
                if ($.inArray(pQuery.to, toSet) >= 0) {
                    to = pQuery.to;
                    $("#to").val(to);
                }
            }
        }

        try {
            var Hfrom = eval("["+$("#Hfrom").val()+"]");    // Evaluate original hardness values to a list
            var Hfromstr = [];

            Hfrom.forEach(function(el, i, arr){
                if (el < methods[from].rng[0] || el > methods[from].rng[1]) {
                    Hfromstr.push("(" + arr[i] + ")");
                } else {
                    Hfromstr.push(arr[i]);
                }
            });
            Hfromstr = Hfromstr.join(", ")
            $("#Hfrom").val(Hfromstr);

            $(".has-warning .help-block").css("display", "none");
            $("#Hfrom").parent().removeClass("has-warning");

            return {success: true, from: from, to: to, Hfrom: Hfrom};
        } catch(e) {
            $("#Hfrom").parent().addClass("has-warning");
            $(".has-warning .help-block").css("display", "");

            return {success: false};
        }
    }

    var convert = function(p) {
        /* Receives JSON object p containing parameters and makes interpolation */

        var lt1 = Math.min(methods[p.from].t1.length, methods[p.to].t1.length);
        var lt2 = Math.min(methods[p.from].t2.length, methods[p.to].t2.length);
        var Hsetfrom, Hsetto;   // dataset used in the interpolation
        if (lt2 != 0) {
            // concatenates and sorts data from tables t1 and t2 for 'p.from' and 'p.to' data
            Hsetfrom = methods[p.from].t2.slice(-lt2).concat(methods[p.from].t1.slice(0,lt1)).sort(sortNumber);
            Hsetto = methods[p.to].t2.slice(-lt2).concat(methods[p.to].t1.slice(0,lt1)).sort(sortNumber);
        } else {
            Hsetfrom = methods[p.from].t1.slice(0,lt1);
            Hsetto = methods[p.to].t1.slice(0,lt1);
        }

        if (Hsetto.length == Hsetfrom.length) {
            // Just in case... Hsetto should never have a different length than Hsetfrom
            if (Hsetto.length == 0) {
                Hto = "Insufficient data for interpolation";
            } else {
                if (p.from !== undefined) {
                    // Everpolate FUCK YEAH!
                    var Hto = everpolate.linear(p.Hfrom, Hsetfrom, Hsetto);   // Converted hardness values
                    Hto.forEach(function(el, i, arr){
                        // Set converted hardness values to "methods[to].ndec" decimal places and put values 
                        // into round brackets if out of range
                        arr[i] = el.toFixed(methods[p.to].ndec);
                        if (el < methods[p.to].rng[0] || el > methods[p.to].rng[1]) {
                            arr[i] = "(" + arr[i] + ")";
                        }
                    });
                    Hto = Hto.join(", ")  // Converts array Hto to string
                }
            }
        } else {
            console.log("Lengths differ");
        }

        return Hto;
    };

    /****** EVENTS ******/

    // Adds Hardness descriptions to option entries
    $.each(methods, function(i, entry){
        $("option[value="+entry.name+"]").html(entry.description + " [" + entry.rng.join("&ndash;") + "]");
    });

    getParams(true);    // getParams from URL query

    $("select").change(function(){
        var p = getParams();
        if (p.success == true) {
            var Hto = convert(p);
            $("#Hto").val(Hto);  // Set converted hardness to input field
            setParamsUrl(p);
        }
    });

    $("input#Hfrom").change(function(){
        var p = getParams();
        if (p.success == true) {
            var Hto = convert(p);
            $("#Hto").val(Hto);  // Set converted hardness to input field
        }
    });
});