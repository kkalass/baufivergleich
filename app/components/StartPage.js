"use strict";

var React = require("react");
var Router = require("react-router");

var ReactIntl = require("react-intl");
var FormattedMessage = ReactIntl.FormattedMessage;
var _ = require("underscore");

/*
 * Next Steps
 * 
 * - Anschlussfinanzierung generell lösen und Worst-Case Beispiele rechnen lassen, auch um meine Kosten-Berechnung zu prüfen
 * - Berechnung fixen, so dass die Ergebnisse mit den Haspa-Ergebnissen korrelieren
 * - Weitere Finanzierungsszenarien einspielen
 */

/*
 Kriterien zum Beurteilen von Immobilienfinanzierungsangeboten:
 
 - Laufzeit
 - Restschuld am Ende der Laufzeit => Risiko. Hier sollten wir eine Einstufung vornehmen.
 - Datum zu dem die Restschuld fällig ist
 - Wird zu dem Datum Geld frei, z. B. durch Rentenversicherung? Wieviel? 
        Wie hoch ist die monatliche Belastung für unsere Beiträge dazu?
        Hintergrund: Wir könnten durch Aussetzen der RV "schwierige" Zeiten überbrücken, aber das geht natürlich nicht wenn wir 
        sie zum Tilgen der Restschuld eingeplant haben.
 - Kosten: wieviel Geld haben wir der Bank bezahlt?
 - Prozentuale Kosten: Wieviel Prozent des getilgten Betrags haben wir der Bank bezahlt?
 - Monatliche Rate - konkret je Monat bei variierenden Raten => Tabellarischer Vergleich.
 
 - max. Sondertilgung pro Jahr
 
 Szenarien rechnen: 
 - Plan - wir zahlen genau die Raten, nicht mehr oder weniger
 - Tilgung - verschiedene extra Beträge eingeben (z.Bsp nach Jahr geordnet)
 - Eng - kann man temporär reduzieren? Wieviel? Welche Konsequenzen?
 
 Eigentlich müsste man anhand der obigen Daten eine Kennziffer berechnen - aber wie genau soll die aussehen?
 
Add Ons:
 - Szenarien einer Anschlussfinanzierung, Durchrechnen von Gesamtszenarien incl. Anschlussfinanzierung
 - szenario 'eigener Bausparvertrag für Extratilgung'. Um guten Zinssatz der Anschlussfinanzierung zu bekommen?
 */

var runden = function (number) {
    return parseFloat(number.toFixed(2))
};
var runden0 = function (number) {
    return parseFloat(number.toFixed(0))
};

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

    var kostenProzentGetilgt = reduced.getilgt === 0 ? undefined : runden((reduced.kosten/reduced.getilgt)*100);
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
        console.log('Berechne', input)
        result = input.type === "bauspar" ? bausparvertrag(input) : hypothekendarlehen(input);
    } else {
        var kreditResult = mehrereBerechnnen(berechnen, _.isArray(input) ? input : input.kredite);
        result = withProzentGetilgt(kreditResult);
    }
    console.log('Kreditberechnung: ', input, " => ", result);
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
            zinsertrag = runden(sparbetrag* (zins/100.0));
        }
        
        sparbetrag += zinsertrag;
        
        // sparen
        sparbetrag += monatsrate;

        monthlyValues.push({
            rate: monatsrate,
            sparbetrag: runden(sparbetrag),
            zinsertragMonat: zinsertrag
        });
    }
    
    var sparbetrag =  monthlyValues[monthlyValues.length - 1].sparbetrag;
    return {
        monatsrate: monatsrate,
        monthlyValues: monthlyValues,
        getilgt: runden(sparbetrag),
        kosten: runden(gebuehr.abschluss + 12 * (gebuehr.jahr || 0)) 
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

var hypothekendarlehen = function(input) {
    var years = input.laufzeit.jahre;// 20,
    var startMonths = laufzeitToMonths(input.startzeit);
    
    var monate = laufzeitToMonths(input.laufzeit);
    var betrag = input.betrag;// 317000,
    var tilgung = input.tilgung;// 2.0,
    var tilgungVerzögerungMonate = input.tilgungVerzögerungMonate || 0;
    var sollzins = input.sollzins;// 2.47,
    var effektivzins = input.effektivzins;// 2.50,
    
    var yearly = betrag * ((tilgung+sollzins)/100.0);
    var monatsrate = tilgung === undefined ? input.monatsrate : runden(yearly / 12.0);
    
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
        var zinsbetrag = runden(restschuld * ((sollzins/12.0)/100.0));
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
        restschuld: runden(restschuld),
        monthlyValues: monthlyValues,
        kosten: runden(kosten),
        getilgt: runden(getilgt)
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
}



var Creditweb = {
    label: "Creditweb - focus.de rechner 16.06.2015",
    laufzeit: {jahre: 20},
    startzeit: {monat: 7},
    betrag: 317000,
    tilgung: 2.0,
    sollzins: 2.47,
    
    erwartet: {
        monatsrate: 1180.83,
        restschuld: 153230,
        effektivzins: 2.50
    }
};

var Creditweb2=_.defaults({tilgung: 3.00}, Creditweb);
var Creditweb3=_.defaults({tilgung: 2.45}, Creditweb);

var Herrmann1 = {
    label: "Herrmann 1 -  17.06.2015",
    laufzeit: {jahre: 15},
    startzeit: {monat: 7},
    betrag: 326000,
    tilgung: 2.5,
    sollzins: 2.15,
    
    erwartet: {
        monatsrate: 1263.25,
        //restschuld: 153230,
        //effektivzins: 2.50
    }
};

var HaspaAnnu = {
    label: "Haspa Annuitätendarlehen - Angebot vom 28.05.2015",
    laufzeit: {jahre: 15},
    startzeit: {monat: 6},
    betrag: 270000,
    tilgung: 2.0,
    sollzins: 2.25,
    
    erwartet: {
        monatsrate: 956.25,
        restschuld: 173760.75,
        effektivzins: 2.27
    }
};

var HaspaKFW = {
    label: "Haspa Annuitätendarlehen - KFW - Angebot vom 28.05.2015",
    laufzeit: {jahre: 10},
    startzeit: {monat: 6},
    betrag: 50000,
    tilgung: 2.24,
    tilgungVerzögerungMonate: 12, // 'Freijahre' in den Bedingungen - in dieser Zeit wird nicht getilgt
    sollzins: 1.55,
    
    erwartet: {
        monatsrate: 157.92,
        restschuld: 39190.17,
        effektivzins: 1.56
    }
};

var HaspaBausparDarlehen = {
    label: "Haspa Bauspar Hypoathekendarlehen - Angebot vom 28.05.2015",
    type: "kredit",
    laufzeit: {jahre: 15},
    //startzeit: {monat: 6},
    betrag: 270000,
    abloesung: [{
        label: "Haspa Bauspar - Angebot vom 28.05.2015",
        type: "bauspar",
        gebuehr: {abschluss: 2700, jahr: 12},
        betrag: 270000,
        sparphase: {
            laufzeit: {jahre: 15},
            monatsrate: 623,
            zins: 0.25,
        },
        kreditphase: {
            laufzeit: {jahre: 15},
            tilgung: undefined,
            monatsrate: 1080,
            sollzins: 2.95,
            
            erwartet: {
                monatsrate: 1080,
                restschuld: 0,
                effektivzins: 2.31
            }
        }
    }],
    tilgung: 0.0,
    sollzins: 2.25,
    
    erwartet: {
        monatsrate: 506.25,
        restschuld: 270000,
        effektivzins: 2.31
    }
};

var behaviour1 = {
  label: "Genaue Monatsrate, keine Extratilgung",
  // precicely the required amount - not more
  monatsTotal: null,
  // no extra 'tilgung' at all
  yearlyExtra: 0
};

var DataRow = React.createClass({
    render: function() {
        
        return (<tr style={this.props.style} className={this.props.className}><th>{this.props.title}</th>{_.map(this.props.variants, function(variant) {
            var value = (typeof this.props.value === 'function') ? this.props.value(variant): this.props.value;
            var formattedValue = (typeof this.props.formatter === 'function') ? this.props.formatter(value): value;
            return (<td>{formattedValue}</td>);
        }.bind(this))}</tr>);
    }
});

var concatTermInput = function(fkt, variant) {
    var terms = variant.input.terms;
    var value = fkt(terms);
    if (value !== undefined) {
        return value;
    }
    var childTerms = terms.kredite.concat((terms.bauspar|| []).map(function(bauspar) {return bauspar.kreditphase;}) );
    return (<div>{_.map(childTerms, function(terms, idx) {return (<span>{idx!=0?' | ':''}{fkt(terms)}</span>);})}</div>);
};

var PriceFormat = function (value) {
    return (
      <FormattedMessage message="{total, number, eur}" total={value} />
    );
};
 
var MonatsratenFormat = function(monatsraten) {
    var ratespermonth = _.reduce(monatsraten, function(memo, monatsrate) {
        var start = monatsrate.monthStart;
        var end = monatsrate.monthEnd;
        for (var i = 0; i < end; i++) {
            if (memo.length <= i) {
                memo.push(0);
            }
            if (i >= start && i < end) {
                memo[i] = runden(memo[i] + monatsrate.value);
            }
        };
        return memo;
    }, []);
    //console.log(ratespermonth);
    var combinedMonatsraten = _.reduce(ratespermonth, function (memo, value, index) {
        //console.log('', value, ' idx' , index);
        var r = memo.length > 0 ? memo[memo.length-1] : undefined;
        if (!r || r.value !== value) {
            var newR = {
                value: value,
                monthStart: index + 1,
                monthEnd: index + 1
            };
            memo.push(newR);
        } else {
            r.monthEnd = index + 1;
        }
        return memo;
    }, []);
    return (<table>{combinedMonatsraten.map(function(monatsrate) {
        return (<tr><td>{monatsrate.monthStart}</td><td>&nbsp;-&nbsp;</td><td>{monatsrate.monthEnd}</td><td>:&nbsp;</td><td><FormattedMessage message="{total, number, eur}" total={monatsrate.value} /></td></tr>);
    })}</table>);
};

var Angebotstabelle = React.createClass({
   
    /*
     * 
 - Laufzeit
 - Restschuld am Ende der Laufzeit => Risiko. Hier sollten wir eine Einstufung vornehmen.
 - Datum zu dem die Restschuld fällig ist
 - Wird zu dem Datum Geld frei, z. B. durch Rentenversicherung? Wieviel? 
        Wie hoch ist die monatliche Belastung für unsere Beiträge dazu?
        Hintergrund: Wir könnten durch Aussetzen der RV "schwierige" Zeiten überbrücken, aber das geht natürlich nicht wenn wir 
        sie zum Tilgen der Restschuld eingeplant haben.
 - Kosten: wieviel Geld haben wir der Bank bezahlt?
 - Prozentuale Kosten: Wieviel Prozent des getilgten Betrags haben wir der Bank bezahlt?
 - Monatliche Rate - konkret je Monat bei variierenden Raten => Tabellarischer Vergleich.
 
     */
    // <DataRow title="Verhalten" variants={this.state.data} value={function(variant) {return variant.input.behaviour.label;}}/>
/*
                 <DataRow title="Laufzeit (Jahre)" variants={this.state.data} value={concatTermInput.bind(this, function(terms) {return terms.laufzeit? terms.laufzeit.jahre : undefined})}/>
                <DataRow title="Sollzins" variants={this.state.data} value={concatTermInput.bind(this, function(terms) {return terms.sollzins? terms.sollzins + ' %' : undefined})}/>
                <DataRow className="emphazise" title="CHECK" variants={this.state.data} formatter={PriceFormat} value={function(variant) {return variant.result.betrag - ( variant.result.getilgt + variant.result.restschuld);}}/>
                <DataRow className="deemphazise" title="Monatsrate (expected)" variants={this.state.data} value={concatTermInput.bind(this,function(terms) {return terms.erwartet ? PriceFormat(terms.erwartet.monatsrate) : undefined;})}/>
                <DataRow className="deemphazise" title="Restschuld (expected)" variants={this.state.data} value={concatTermInput.bind(this,function(terms) {return terms.erwartet ? PriceFormat(terms.erwartet.restschuld) : undefined;})}/>

 */    
    render: function () {
    return (
            <table className="angebote">
                <DataRow title="Bedingungen" variants={this.props.data} value={function(variant) {return variant.input.terms.label;}}/>
                <DataRow title="Kreditbetrag" variants={this.props.data} formatter={PriceFormat} value={function(variant) {return variant.result.betrag;}}/>
                <DataRow className="emphazise" title="Monatsrate" variants={this.props.data} formatter={MonatsratenFormat} value={function(variant) {return variant.result.monatsraten;}}/>
                <DataRow className="emphazise" title="Restschuld" variants={this.props.data} formatter={PriceFormat} value={function(variant) {return variant.result.restschuld;}}/>
                
                <DataRow title="Getilgt" variants={this.props.data} formatter={PriceFormat} value={function(variant) {return variant.result.getilgt;}}/>
                
                <DataRow title="Kosten (absolut)" variants={this.props.data} formatter={PriceFormat} value={function(variant) {return variant.result.kosten;}}/>
                <DataRow className="emphazise" title="Kosten (% vom getilgten)" variants={this.props.data} value={function(variant) {return variant.result.kostenProzentGetilgt + " %";}}/>
            </table>
          
    );
    }
});

var variantenHerrmann = [ 
    
    {terms: {
        label: "Equivalente Anschlussfinanzierung (2.15%, 30 Jahre)",
        kredite: [_.defaults({abloesung: {
            laufzeit: {jahre: 15},
            startzeit: {monat: 6},
            
            tilgung: 5.655,
            sollzins: 2.15,

        }}, Herrmann1)]
    }},
    {terms: {
        label: "Vermutliche Anschlussfinanzierung (5%, 30 Jahre)",
        kredite: [_.defaults({abloesung: {
            laufzeit: {jahre: 15},
            startzeit: {monat: 6},
            
            tilgung: 4.489,
            sollzins: 5,

        }}, Herrmann1)]
    }},
    {terms: {
        label: "Vermutliche (ungetilgte) Anschlussfinanzierung (5%, 30++ Jahre)",
        kredite: [_.defaults({abloesung: {
            laufzeit: {jahre: 15},
            startzeit: {monat: 6},
            
            tilgung: 0,
            sollzins: 5

        }}, Herrmann1)]
    }},
    {terms: {
        label: "Sehr schlechte Anschlussfinanzierung (12%, 30 Jahre)",
        kredite: [_.defaults({abloesung: {
            laufzeit: {jahre: 15},
            startzeit: {monat: 6},
            
            tilgung: 2.402,
            sollzins: 12.00,

        }}, Herrmann1)]
    }},
    {terms: {
        label: "Sehr schlechte (ungetilgte) Anschlussfinanzierung (12%, 30++ Jahre)",
        kredite: [_.defaults({abloesung: {
            laufzeit: {jahre: 15},
            startzeit: {monat: 6},
            
            tilgung: 0,
            sollzins: 12.00,

        }}, Herrmann1)]
    }},
    {terms: {
        label: "Ohne Anschlussfinanzierung (Restschuld nach 15 Jahren)",
        kredite: [Herrmann1]
    }},
];
var variantenHaspa = [ 
                  {terms: {
                      label: "Ohne Anschlussfinanzierung (KFW Restschuld nach 10 Jahren + Restschuld nach 15 Jahren)",
                      kredite: [HaspaAnnu, HaspaKFW]
                  }}
                  ];
var variantenHaspaBauspar = [ 
                {terms: {
                    label: "Equivalente KFW Anschlussfinanzierung (1,55%, 30 Jahre)",
                    kredite: [HaspaBausparDarlehen, _.defaults({abloesung: {
                        laufzeit: {jahre: 20},
                        tilgung: 4.08,
                        sollzins: 1.57,
                    }}, HaspaKFW)]
                }},
                {terms: {
                    label: "Vermutliche KFW Anschlussfinanzierung (5%, 30 Jahre)",
                    kredite: [HaspaBausparDarlehen, _.defaults({abloesung: {
                        laufzeit: {jahre: 20},
                        tilgung: 2.796,
                        sollzins: 5.00,
                
                    }}, HaspaKFW)]
                }},
                {terms: {
                    label: "Vermutliche (ungetilgte) KFW Anschlussfinanzierung (5%, 30++ Jahre)",
                    kredite: [HaspaBausparDarlehen, _.defaults({abloesung: {
                        laufzeit: {jahre: 20},
                        tilgung: 0,
                        sollzins: 5.00,
                
                    }}, HaspaKFW)]
                }},
                      {terms: {
                          label: "Sehr schlechte KFW Anschlussfinanzierung (12%, 30 Jahre)",
                          kredite: [HaspaBausparDarlehen, _.defaults({abloesung: {
                              label: "Sehr schlechtes Anschlussdarlehen fuer KFW - Angebot vom 28.05.2015",
                              laufzeit: {jahre: 20},
                              startzeit: {monat: 6},
                              
                              tilgung: 1.16,
                              sollzins: 12.00,
                          }}, HaspaKFW)]
                      }},
                      {terms: {
                          label: "Sehr schlechte (ungetilgte) Anschlussfinanzierung (12%, 30++ Jahre)",
                          kredite: [HaspaBausparDarlehen, _.defaults({abloesung: {
                              label: "Sehr schlechtes (ungetilgtes) Anschlussdarlehen fuer KFW - Angebot vom 28.05.2015",
                              laufzeit: {jahre: 20},
                              startzeit: {monat: 6},
                              
                              tilgung: 0,//1.15,
                              sollzins: 12.00,
                          }}, HaspaKFW)]
                      }},
                      {terms: {
                          label: "Ohne KFW Anschlussfinanzierung (Restschuld nach 10 Jahren, Gesamt 30 Jahre)",
                          kredite: [HaspaBausparDarlehen, HaspaKFW]
                      }},
                      /*
                      {terms: {
                          label: "Sehr gute KFW Anschlussfinanzierung (1%, 30 Jahre)",
                          kredite: [HaspaBausparDarlehen, _.defaults({abloesung: {
                              label: "Sehr gutes Anschlussdarlehen fuer KFW - Angebot vom 28.05.2015",
                              laufzeit: {jahre: 20},
                              startzeit: {monat: 6},
                              
                              tilgung: 4.3,
                              sollzins: 1.00,

                          }}, HaspaKFW)]
                      }},
                      */
                      ];



var variantenCreditweb = [ 
                {terms: {
                    label: "Equivalente Anschlussfinanzierung (2.47%, 40 Jahre)",
                    kredite: [_.defaults({abloesung: {
                        label: "equivalentes Anschlussdarlehen fuer Creditweb",
                        laufzeit: {jahre: 20},
                        startzeit: {monat: 7},
                        
                        tilgung: 3.87,
                        sollzins: 2.47,
                
                    }}, Creditweb)]
                }},
                {terms: {
                    label: "Vermutliche Anschlussfinanzierung (5%, 40 Jahre)",
                    kredite: [_.defaults({abloesung: {
                        label: "erwartetes Anschlussdarlehen fuer Creditweb",
                        laufzeit: {jahre: 20},
                        startzeit: {monat: 7},
                        
                        tilgung: 2.919,
                        sollzins: 5.00,
                
                    }}, Creditweb)]
                }},
                {terms: {
                    label: "Vermutliche (ungetilgte) Anschlussfinanzierung (5%, 40 Jahre)",
                    kredite: [_.defaults({abloesung: {
                        label: "erwartetes Anschlussdarlehen fuer Creditweb",
                        laufzeit: {jahre: 20},
                        startzeit: {monat: 7},
                        
                        tilgung: 0,
                        sollzins: 5.00,
                
                    }}, Creditweb)]
                }},
                  {terms: {
                      label: "Sehr schlechte Anschlussfinanzierung (12%, 40 Jahre)",
                      kredite: [_.defaults({abloesung: {
                          label: "Sehr schlechtes , Anschlussdarlehen fuer Creditweb",
                          laufzeit: {jahre: 20},
                          startzeit: {monat: 7},
                          
                          tilgung: 1.213,
                          sollzins: 12.00,
                      }}, Creditweb)]
                  }},
                  {terms: {
                      label: "Sehr schlechte (ungetilgte) Anschlussfinanzierung (12%, 40++ Jahre)",
                      kredite: [_.defaults({abloesung: {
                          label: "Sehr schlechtes (ungetilgtes), Anschlussdarlehen fuer Creditweb",
                          laufzeit: {jahre: 20},
                          startzeit: {monat: 7},
                          
                          tilgung: 0.00, 
                          sollzins: 12.00,
                      }}, Creditweb)]
                  }},
                  
                  
                  {terms: {
                      label: "Ohne Anschlussfinanzierung (Restschuld nach 20 Jahren)",
                      kredite: [Creditweb]
                  }},
                  /*{terms: {
                      label: "Sehr gute Anschlussfinanzierung (1%, 40 Jahre)",
                      kredite: [_.defaults({abloesung: {
                          label: "Sehr gutes Anschlussdarlehen fuer Creditweb",
                          laufzeit: {jahre: 20},
                          startzeit: {monat: 7},
                          
                          tilgung: 4.517,
                          sollzins: 1.00,

                      }}, Creditweb)]
                  }},
                  */
                  ];

var variantenCreditweb2 = [ 
                          {terms: {
                              label: "Equivalente Anschlussfinanzierung (2.47%, 30 Jahre)",
                              kredite: [_.defaults({abloesung: {
                                  laufzeit: {jahre: 10},
                                  startzeit: {monat: 7},
                                  
                                  tilgung: 8.825,
                                  sollzins: 2.47,
                          
                              }}, Creditweb2)]
                          }},
                          {terms: {
                              label: "Vermutliche Anschlussfinanzierung (5%, 30 Jahre)",
                              kredite: [_.defaults({abloesung: {
                                  laufzeit: {jahre: 10},
                                  startzeit: {monat: 7},
                                  
                                  tilgung: 7.725,
                                  sollzins: 5.00,
                          
                              }}, Creditweb2)]
                          }},
                          {terms: {
                              label: "Vermutliche (ungetilgte) Anschlussfinanzierung (5%, 30 Jahre)",
                              kredite: [_.defaults({abloesung: {
                                  laufzeit: {jahre: 10},
                                  startzeit: {monat: 7},
                                  
                                  tilgung: 0,
                                  sollzins: 5.00,
                          
                              }}, Creditweb2)]
                          }},
                            {terms: {
                                label: "Sehr schlechte Anschlussfinanzierung (12%, 30 Jahre)",
                                kredite: [_.defaults({abloesung: {
                                    laufzeit: {jahre: 10},
                                    startzeit: {monat: 7},
                                    
                                    tilgung: 5.215,
                                    sollzins: 12.00,
                                }}, Creditweb2)]
                            }},
                            {terms: {
                                label: "Sehr schlechte (ungetilgte) Anschlussfinanzierung (12%, 30++ Jahre)",
                                kredite: [_.defaults({abloesung: {
                                    laufzeit: {jahre: 10},
                                    startzeit: {monat: 7},
                                    
                                    tilgung: 0.00, 
                                    sollzins: 12.00,
                                }}, Creditweb2)]
                            }},
                            
                            
                            {terms: {
                                label: "Ohne Anschlussfinanzierung (Restschuld nach 20 Jahren)",
                                kredite: [Creditweb2]
                            }},
                            /*{terms: {
                                label: "Sehr gute Anschlussfinanzierung (1%, 40 Jahre)",
                                kredite: [_.defaults({abloesung: {
                                    label: "Sehr gutes Anschlussdarlehen fuer Creditweb",
                                    laufzeit: {jahre: 20},
                                    startzeit: {monat: 7},
                                    
                                    tilgung: 4.517,
                                    sollzins: 1.00,

                                }}, Creditweb)]
                            }},
                            */
                            ];


var variantenCreditweb3 = [ 
                          {terms: {
                              label: "Equivalente Anschlussfinanzierung (2.47%, 30 Jahre)",
                              kredite: [_.defaults({abloesung: {
                                  laufzeit: {jahre: 10},
                                  startzeit: {monat: 7},
                                  
                                  tilgung: 8.825,
                                  sollzins: 2.47,
                          
                              }}, Creditweb3)]
                          }},
                          {terms: {
                              label: "Vermutliche Anschlussfinanzierung (5%, 30 Jahre)",
                              kredite: [_.defaults({abloesung: {
                                  laufzeit: {jahre: 10},
                                  startzeit: {monat: 7},
                                  
                                  tilgung: 7.725,
                                  sollzins: 5.00,
                          
                              }}, Creditweb3)]
                          }},
                          {terms: {
                              label: "Vermutliche (ungetilgte) Anschlussfinanzierung (5%, 30 Jahre)",
                              kredite: [_.defaults({abloesung: {
                                  laufzeit: {jahre: 10},
                                  startzeit: {monat: 7},
                                  
                                  tilgung: 0,
                                  sollzins: 5.00,
                          
                              }}, Creditweb3)]
                          }},
                            {terms: {
                                label: "Sehr schlechte Anschlussfinanzierung (12%, 30 Jahre)",
                                kredite: [_.defaults({abloesung: {
                                    laufzeit: {jahre: 10},
                                    startzeit: {monat: 7},
                                    
                                    tilgung: 5.215,
                                    sollzins: 12.00,
                                }}, Creditweb3)]
                            }},
                            {terms: {
                                label: "Sehr schlechte (ungetilgte) Anschlussfinanzierung (12%, 30++ Jahre)",
                                kredite: [_.defaults({abloesung: {
                                    laufzeit: {jahre: 10},
                                    startzeit: {monat: 7},
                                    
                                    tilgung: 0.00, 
                                    sollzins: 12.00,
                                }}, Creditweb3)]
                            }},
                            
                            
                            {terms: {
                                label: "Ohne Anschlussfinanzierung (Restschuld nach 20 Jahren)",
                                kredite: [Creditweb3]
                            }},
                            
                            ];
var variantenBerechnen = function(varianten) {
    return _.map(varianten, function(variante) {
        return {
            input: variante,
            result: berechnen(variante.terms)
        }
    });

} 
var StartPage = React.createClass({
    // Note that each Page must include the IntlMixin, otherwise the i18n data
    // doesn't get passed down
    mixins: [Router.Navigation, ReactIntl.IntlMixin],

    getInitialState: function() {
        return {
            herrmann: variantenBerechnen(variantenHerrmann),
            haspa: variantenBerechnen(variantenHaspa),
            haspaBauspar: variantenBerechnen(variantenHaspaBauspar),
            creditweb: variantenBerechnen(variantenCreditweb),
            creditweb2: variantenBerechnen(variantenCreditweb2),
            creditweb3: variantenBerechnen(variantenCreditweb3)
        };
    },
      
    render: function () {
        /*
         <h2>Creditweb - Risiko hoch</h2>
            <Angebotstabelle data={this.state.creditweb}/>
            <h2>Creditweb2 - Rate (zu) hoch, kein Risiko</h2>
            <Angebotstabelle data={this.state.creditweb2}/>

         */
    return (
          <div className="container">
            <div className="lead">
                <FormattedMessage message={this.getIntlMessage("WELCOME")}
                                  name="Nutzer" />
            </div>
            <h2>Haspa</h2>
            <Angebotstabelle data={this.state.haspa}/>
            <h2>Herrmann 1 - Risiko viel zu hoch</h2>
            <Angebotstabelle data={this.state.herrmann}/>
           
            <h2>Haspa Bauspar - Rate zu hoch, Risiko hoch</h2>
            <Angebotstabelle data={this.state.haspaBauspar}/>
            
            <h2>Creditweb3 - Rate hoch,  Risiko beherrschbar</h2>
            <Angebotstabelle data={this.state.creditweb3}/>
        
            <h2>Creditweb - Risiko hoch</h2>
            <Angebotstabelle data={this.state.creditweb}/>
        </div>
    );
    }
});

module.exports = StartPage;
