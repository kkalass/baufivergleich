"use strict";
var _ = require("underscore");
var Math2 = require("./math2");

var emptyResult = {betrag: 0.0, monatsrate: 0.0 , restschuld: 0.0, kosten: 0.0, getilgt: 0.0, monthlyValues:[], parts: []};

var addResult = function(memo, result) {
    /*
    if (!memo) {
        return result;
    }
    if (!result) {
      
        return memo;
    }
    */
    return {
        parts: (memo.parts || []).concat(result),
        betrag: memo.betrag + result.betrag,
        monatsrate: memo.monatsrate + result.monatsrate,
        monatsraten: (memo.monatsraten||[]).concat(result.monatsraten||[]),
        restschuld: memo.restschuld + result.restschuld,
        //memo.monthlyValues + result.monthlyValues,
        kosten: memo.kosten + result.kosten,
        getilgt: memo.getilgt + result.getilgt
     };
};

var withProzentGetilgt = function(reduced) {

    var kostenProzentGetilgt = reduced.getilgt === 0 ? undefined : Math2.runden((reduced.kosten/reduced.getilgt)*100);
    return {
        parts: reduced.parts,
        betrag: reduced.betrag,
        monatsrate: reduced.monatsrate,
        monatsraten: reduced.monatsraten,
        restschuld: reduced.restschuld,
        monthlyValues: reduced.monthlyValues,
        kosten: reduced.kosten,
        getilgt: reduced.getilgt,
        kostenProzentGetilgt: kostenProzentGetilgt,
        abloesungsresult: reduced.abloesungsresult,
        kreditresult: reduced.kreditresult,
        startzeitMonate: reduced.startzeitMonate,
        laufzeitMonate: reduced.laufzeitMonate
    };
};

var mehrereBerechnnen = function(fkt, kredite) {
    if (_.isArray(kredite)) {
        var results = _.map(kredite, fkt);
        var reduced = _.reduce(results, addResult, emptyResult);
        return withProzentGetilgt(reduced);
    }
    return undefined;
};


var berechnen = function(input) {
    var result;
    if (!_.isArray(input) && !_.isArray(input.kredite)) {
        //console.log('Berechne', input)
        result = input.type === "bauspar" ? bausparvertrag(input) : hypothekendarlehen(input);
    } else {
        var kreditResult = mehrereBerechnnen(berechnen, _.isArray(input) ? input : input.kredite);
        result = withProzentGetilgt(kreditResult);
    }
    //console.log('Kreditberechnung: ', input, " => ", result);
    return result;
};

var bausparphase = function(input) {
    var gebuehr = input.gebuehr;
    var monate = input.laufzeit.jahre * 12;
    var monatsrate = input.monatsrate;
    var zins = input.zins;

    var monthlyValues = [];
    for (var i=0; i < monate; i++) {
        var sparbetrag = i ? monthlyValues[i-1].sparbetrag : 0;
        
        // FIXME: Jahreszins korrekt am Ende eines Jahres, nicht am Ende von 12 Monaten berechnen!
        // FIXME: Zinsberechnungserbebnis weicht von Haspa ab!
        var zinsertrag = 0;
        if ((i % 12 ) === 0) {
            zinsertrag = Math2.runden(sparbetrag* (zins/100.0));
        }
        
        sparbetrag += zinsertrag;
        
        // sparen
        sparbetrag += monatsrate;

        monthlyValues.push({
            rate: monatsrate,
            sparbetrag: Math2.runden(sparbetrag),
            zinsertragMonat: zinsertrag
        });
    }
    
    var sparbetrag =  monthlyValues[monthlyValues.length - 1].sparbetrag;
    return {
        monatsrate: monatsrate,
        monthlyValues: monthlyValues,
        getilgt: Math2.runden(sparbetrag),
        kosten: Math2.runden(gebuehr.abschluss + 12 * (gebuehr.jahr || 0)) 
    };
};

var laufzeitToMonths = function(laufzeit) {
    if (!laufzeit) {
        return 0;
    }
    return (laufzeit.monate || 0) + (laufzeit.jahre || 0)*12;
};
var cloneLaufzeit = function (laufzeit) {
    return {monate: laufzeit.monate || 0, jahre: laufzeit.jahre || 0};
}
var monthsToLaufzeit = function(months) {
    return {monate: months%12, jahre: months/12 }
}

var bausparvertrag = function(input) {
    var betrag = input.betrag;
    
    // sparphase
    var sparphase = input.sparphase || {};
    var sparphaseLaufzeit = sparphase.laufzeit || {};
    var spargebuehr = input.gebuehr || {};
    
    var creditStartMonths = laufzeitToMonths(input.startzeit);
    var sparMonths = laufzeitToMonths(sparphaseLaufzeit);
    var sparStartMonths = creditStartMonths - sparMonths; 
        
    var sparergebnis = bausparphase({
        startzeit: {
            monate: sparStartMonths
        },
        gebuehr: {
            abschluss: spargebuehr.abschluss,
            jahr: spargebuehr.jahr
        },
        laufzeit: {
            jahre: sparphaseLaufzeit.jahre
        },
        monatsrate: sparphase.monatsrate,
        zins: sparphase.zins
    });
    
    var restschuld = betrag - sparergebnis.getilgt;
    
    // kreditphase
    var kreditphase = input.kreditphase;
    var kreditlaufzeit = kreditphase.laufzeit || {};
    var krediterwartet = kreditphase.erwartet || {};
    var kreditergebnis = hypothekendarlehen({
        betrag: restschuld,
        startzeit: {
            monate: creditStartMonths
        },
        laufzeit: {
            jahre: kreditlaufzeit.jahre
        },
        monatsrate: kreditphase.monatsrate,
        tilgung: kreditphase.tilgung,
        sollzins: kreditphase.sollzins,
        erwartet: {
            monatsrate: krediterwartet.monatsrate,
            restschuld: krediterwartet.restschuld,
            effektivzins: krediterwartet.effektivzins,
        }
    });
    
    
    return {
        startzeitMonate: sparStartMonths,
        laufzeitMonate: laufzeitToMonths(kreditlaufzeit) + laufzeitToMonths(sparphaseLaufzeit),
        betrag: betrag,
        kosten: sparergebnis.kosten + kreditergebnis.kosten,
        getilgt: sparergebnis.getilgt + kreditergebnis.getilgt,
        sparergebnis: sparergebnis,
        kreditergebnis: kreditergebnis,
        monthlyValues: sparergebnis.monthlyValues.concat(kreditergebnis.monthlyValues),
        // FIXME: Monatrate array
        monatsrate: sparergebnis.monatsrate,
        monatsraten: [{monthStart: 0, value: sparergebnis.monatsrate, monthEnd: 15*12}, {monthStart: 15*12, value: kreditergebnis.monatsrate, monthEnd: 30*12}],
        restschuld: kreditergebnis.restschuld
    }
};

var monatsrateFromRestschuld = function(betrag, sollzins, months, restschuld) {
    /*
     * b1 = (b0 * (1-tilgung));
     * 
     * betrag0 * (zinssatz + tilgungssatzInitial) = monatsrate;
     * betrag1 = betrag0 - (monatsrate - betrag0*zinssatz);
     * betrag1 = betrag0 - monatsrate + betrag0*zinssatz;
     * betrag1 = betrag0 + betrag0*zinssatz - monatsrate ;
     * betrag1 = betrag0*(1 + zinssatz) - monatsrate ;
     * 
     * betrag2 =  betrag1*(1 + zinssatz) - monatsrate;
     * betrag3 =  betrag2*(1 + zinssatz) - monatsrate
     * 
     * 
     * betrag3 =  (betrag1*(1 + zinssatz) - monatsrate)*(1 + zinssatz) - monatsrate
     * betrag3 =  betrag1*(1 + zinssatz)*(1 + zinssatz) - monatsrate*(1 + zinssatz) - monatsrate
     * betrag3 =  (betrag0*(1 + zinssatz) - monatsrate)*(1 + zinssatz)*(1 + zinssatz) - monatsrate*(1 + zinssatz) - monatsrate
     * betrag3 =  betrag0*(1 + zinssatz)*(1 + zinssatz)*(1 + zinssatz) - monatsrate*(1 + zinssatz)*(1 + zinssatz) - monatsrate*(1 + zinssatz) - monatsrate
     * 
     * betrag3 =  betrag0*(1 + zinssatz)^3 - monatsrate*(1 + zinssatz)^2 - monatsrate*(1 + zinssatz)^1 - monatsrate*(1 + zinssatz)^0
     *
     *  betrag3 =  betrag0*(1 + zinssatz)^3 - monatsrate*((1 + zinssatz)^2 + (1 + zinssatz)^1 + (1 + zinssatz)^0)
     *  
     *  monatsrate*((1 + zinssatz)^2 + (1 + zinssatz)^1 + (1 + zinssatz)^0) = betrag0*(1 + zinssatz)^3 - betrag3
     *  monatsrate = (betrag0*(1 + zinssatz)^3 - betrag3) / ((1 + zinssatz)^2 + (1 + zinssatz)^1 + (1 + zinssatz)^0);
     *  
     *  monatsrate = (betrag*monatsSollzinsP^3 - restschuld) / (monatsSollzinsP^2 + monatsSollzinsP^1 + 1);
     */
    var monatsSollzinsP = 1.0 + (sollzins/12.0)/100.00;
    var d = 1;
    for (var m = 1; m < months; m++) {
        d += Math.pow(monatsSollzinsP, m);
    }
    var r = (betrag*Math.pow(monatsSollzinsP, months) - restschuld) / d;
    console.log("(",betrag,"*Math.pow(",monatsSollzinsP,", ", months,") - ",restschuld,") / ",d,";", " => ", r);
    return r;
};

var hypothekendarlehen = function(input) {
    var years = input.laufzeit.jahre;// 20,
    var startMonths = laufzeitToMonths(input.startzeit);
    
    var monate = laufzeitToMonths(input.laufzeit);
    var betrag = input.betrag;// 317000,
    var tilgung = input.tilgung;// {prozentStart: 2.0, restschuld: 0, monatsrate: 1200}
    var tilgungVerzögerungMonate = input.tilgungVerzögerungMonate || 0;
    var sollzins = input.sollzins;// 2.47,
    var effektivzins = input.effektivzins;// 2.50,
    
    var monatsrate;
    if (tilgung.prozentStart !== undefined) {
        var yearly = betrag * ((tilgung.prozentStart+sollzins)/100.0);
        monatsrate = Math2.runden(yearly / 12.0);
    } else if (tilgung.monatsrate !== undefined) {
        monatsrate = tilgung.monatsrate;
    } else if (tilgung.restschuld !== undefined) {
        monatsrate = monatsrateFromRestschuld(betrag, sollzins, monate, tilgung.restschuld);
    } else {
        
        throw "tilgung not yet supported: " + JSON.stringify(tilgung);
    }
    
    var kosten = 0;
    
    /*
     * Der Hypothekenrechner http://hypotheken.focus.de/rechner/focus/top.aspx?id=8&darstellung=0&zinsfestschreibung=20&gesamtkosten=398000&darlehen=317000&tilgung=2&plz=22337%20Hamburg&bauzustand=1&berufsgruppen=1&sondertilgungen=2 
     * rechnet so, dass sich nach jeder Monatsrate der Betrag verringert, nicht erst nach dem Jahr.
     * Wir machen das auch so. 
     */
    var monthlyValues = [];
    for (var c=0; c < startMonths + monate; c++) {
        var i = c - startMonths;
        if (i < 0) {
            monthlyValues.push({
                rate: 0
            });
            continue;
        }
        var restschuld = i>0 ? monthlyValues[c-1].restschuld : betrag;
        var zinsbetrag = Math2.runden(restschuld * ((sollzins/12.0)/100.0));
        kosten += zinsbetrag;
        var tilgungsbetrag = i>=tilgungVerzögerungMonate? monatsrate - zinsbetrag : 0;
        monthlyValues.push({
            rate: monatsrate,
            restschuld: restschuld - tilgungsbetrag,
            tilgungsbetrag: tilgungsbetrag,
            zinsbetrag: zinsbetrag
        });
    }
    
    var restschuld =  monthlyValues[monthlyValues.length - 1].restschuld;
    var getilgt = betrag - restschuld;
    
    var kreditresult = withProzentGetilgt({
        betrag: betrag,
        monatsrate: monatsrate,
        startzeitMonate: startMonths,
        laufzeitMonate: monate,
        monatsraten: [{monthStart: startMonths, value: monatsrate, monthEnd: startMonths+monate}],
        restschuld: Math2.runden(restschuld),
        monthlyValues: monthlyValues,
        kosten: Math2.runden(kosten),
        getilgt: Math2.runden(getilgt)
    });
    
    if (!input.abloesung) {
        return kreditresult;
    }
    var abloesung = input.abloesung;
    
    
 // FIXME: sicherstellen dass Restschuld und Summe der Abloesungsbeträge passen!
    if (abloesung) {
        abloesung = (_.isArray(abloesung) ? abloesung : [abloesung]).map(function(a) {
            var ab = _.clone(a);
            if (!ab.betrag) {
                ab.betrag = kreditresult.restschuld;    
            }
            ab.startzeit = {jahre: years};
            return ab;
        });
    }
    
    var abloesungsresult = berechnen(abloesung);
    
    var startzeitMonate = Math.min(kreditresult.startzeitMonate, abloesungsresult.startzeitMonate);
    var laufzeitMonate = Math.max(kreditresult.startzeitMonate + kreditresult.laufzeitMonate, abloesungsresult.startzeitMonate + abloesungsresult.laufzeitMonate) - startzeitMonate;
    return withProzentGetilgt({
        betrag: kreditresult.betrag,
        monatsraten: (kreditresult.monatsraten||[]).concat(abloesungsresult.monatsraten || []),
        restschuld: abloesungsresult.restschuld,
        kosten: kreditresult.kosten + abloesungsresult.kosten,
        getilgt: kreditresult.getilgt + abloesungsresult.getilgt,
        startzeitMonate: startzeitMonate,
        laufzeitMonate: laufzeitMonate,
        abloesungsresult: abloesungsresult,
        kreditresult: kreditresult
    });
};


var variantenBerechnen = function(varianten) {
    return _.map(varianten, function(variante) {
        return {
            input: variante,
            result: berechnen(variante.terms)
        }
    });

}; 

module.exports = {berechnen: variantenBerechnen};
