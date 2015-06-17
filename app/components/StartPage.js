"use strict";

var React = require("react");
var Router = require("react-router");

var ReactIntl = require("react-intl");
var FormattedMessage = ReactIntl.FormattedMessage;
var _ = require("underscore");

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
    return {
        parts: (memo.parts || []).concat(result),
        betrag: memo.betrag + result.betrag,
        monatsrate: memo.monatsrate + result.monatsrate,
        restschuld: memo.restschuld + result.restschuld,
        //memo.monthlyValues + result.monthlyValues,
        kosten: memo.kosten + result.kosten,
        getilgt: memo.getilgt + result.getilgt
     };
};

var withProzentGetilgt = function(reduced) {

    var kostenProzentGetilgt = runden((reduced.kosten/reduced.getilgt)*100);
    return {
        parts: reduced.parts,
        betrag: reduced.betrag,
        monatsrate: reduced.monatsrate,
        restschuld: reduced.restschuld,
        monthlyValues: reduced.monthlyValues,
        kosten: reduced.kosten,
        getilgt: reduced.getilgt,
        kostenProzentGetilgt: kostenProzentGetilgt
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
    if (!_.isArray(input.kredite) && !_.isArray(input.bauspar)) {
        result = hypothekendarlehen(input);
    } else {
        var kreditResult = mehrereBerechnnen(hypothekendarlehen, input.kredite);
        var bausparResult = mehrereBerechnnen(bausparvertrag, input.bauspar);
        var total = addResult(kreditResult || emptyResult, bausparResult || emptyResult);
        result = withProzentGetilgt(total);
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
        
        // FIXME: gilt hier wirklich monatszins, oder ist das nicht ein Jahreszins?
        var zinsertrag = runden(sparbetrag* ((zins/12.0)/100.0));
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
        kosten: runden(gebuehr)
    };
};

var bausparvertrag = function(input) {
    var betrag = input.betrag;
    
    // sparphase
    var sparphase = input.sparphase || {};
    var sparphaseLaufzeit = sparphase.laufzeit || {};
    var sparergebnis = bausparphase({
        gebuehr: input.gebuehr,
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
        laufzeit: {
            jahre: kreditlaufzeit.jahre
        },
        tilgung: kreditphase.tilgung,
        sollzins: kreditphase.sollzins,
        erwartet: {
            monatsrate: krediterwartet.monatsrate,
            restschuld: krediterwartet.restschuld,
            effektivzins: krediterwartet.effektivzins,
        }
    });
    
    //betrag: 270000,
    return {
        betrag: betrag,
        sparergebnis: sparergebnis,
        kreditergebnis: kreditergebnis,
        monthlyValues: sparergebnis.monthlyValues.concat(kreditergebnis.monthlyValues),
        // FIXME: Monatrate array
        monatsrate: sparergebnis.monatsrate,
        monatsraten: [sparergebnis.monatsrate, kreditergebnis.monatsrate],
        restschuld: kreditergebnis.restschuld
    }
};

var hypothekendarlehen = function(input) {
    var years = input.laufzeit.jahre;// 20,
    var monate = years * 12;
    var betrag = input.betrag;// 317000,
    var tilgung = input.tilgung;// 2.0,
    var tilgungVerzögerungMonate = input.tilgungVerzögerungMonate || 0;
    var sollzins = input.sollzins;// 2.47,
    var effektivzins = input.effektivzins;// 2.50,
    
    var yearly = betrag * ((tilgung+sollzins)/100.0);
    var monatsrate = runden(yearly / 12.0);
    
    var kosten = 0;
    
    /*
     * Der Hypothekenrechner http://hypotheken.focus.de/rechner/focus/top.aspx?id=8&darstellung=0&zinsfestschreibung=20&gesamtkosten=398000&darlehen=317000&tilgung=2&plz=22337%20Hamburg&bauzustand=1&berufsgruppen=1&sondertilgungen=2 
     * rechnet so, dass sich nach jeder Monatsrate der Betrag verringert, nicht erst nach dem Jahr.
     * Wir machen das auch so. 
     */
    var monthlyValues = [];
    for (var i=0; i < monate; i++) {
        var restschuld = i ? monthlyValues[i-1].restschuld : betrag;
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
    return withProzentGetilgt({
        betrag: betrag,
        monatsrate: monatsrate,
        restschuld:restschuld,
        monthlyValues: monthlyValues,
        kosten: runden(kosten),
        getilgt: runden(getilgt)
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

var Haspa = {
    label: "Haspa - Angebot vom 28.05.2015",
    kredite: [HaspaAnnu, HaspaKFW]
};
var HaspaBauspar = {
    label: "Haspa - Bauspar Angebot vom 28.05.2015",
    kredite: [{
        label: "Haspa Bauspar Hypoathekendarlehen - Angebot vom 28.05.2015",
        laufzeit: {jahre: 15},
        //startzeit: {monat: 6},
        betrag: 270000,

        tilgung: 0.0,
        sollzins: 2.25,
        
        erwartet: {
            monatsrate: 506.25,
            restschuld: 270000,
            effektivzins: 2.31
        }
    }, HaspaKFW],
    bauspar: [{
        label: "Haspa Bauspar - Angebot vom 28.05.2015",
        gebuehr: 2700,
        betrag: 270000,
        sparphase: {
            laufzeit: {jahre: 15},
            monatsrate: 623,
            zins: 0.01,
        },
        kreditphase: {
            laufzeit: {jahre: 15},
            tilgung: 0.0,
            sollzins: 2.25,
            
            erwartet: {
                monatsrate: 0,
                restschuld: 0,
                effektivzins: 2.31
            }
        }
    }]
};

var behaviour1 = {
  label: "Genaue Monatsrate, keine Extratilgung",
  // precicely the required amount - not more
  monatsTotal: null,
  // no extra 'tilgung' at all
  yearlyExtra: 0
};

var varianten = [ {terms: Creditweb, behaviour: behaviour1},
                  {terms: Haspa, behaviour: behaviour1},
                  {terms: HaspaBauspar, behaviour: behaviour1}
                  ];
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
    return (<div>{_.map(terms.kredite, function(terms, idx) {return (<span>{idx!=0?' | ':''}{fkt(terms)}</span>);})}</div>);
};

var PriceFormat = function (value) {
    return (
      <FormattedMessage message="{total, number, eur}" total={value} />
    );
};

var StartPage = React.createClass({
    // Note that each Page must include the IntlMixin, otherwise the i18n data
    // doesn't get passed down
    mixins: [Router.Navigation, ReactIntl.IntlMixin],

    getInitialState: function() {
        return {data:_.map(varianten, function(variante) {
            return {
                input: variante,
                result: berechnen(variante.terms)
            }
        })};
    },
    

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
    
    render: function () {
	return (
          <div className="container">
            <div className="lead">
                <FormattedMessage message={this.getIntlMessage("WELCOME")}
                                  name="Nutzer" />
            </div>
            <table>
                <DataRow title="Bedingungen" variants={this.state.data} value={function(variant) {return variant.input.terms.label;}}/>
                <DataRow title="Kreditbetrag" variants={this.state.data} formatter={PriceFormat} value={function(variant) {return variant.result.betrag;}}/>
                <DataRow title="Laufzeit (Jahre)" variants={this.state.data} value={concatTermInput.bind(this, function(terms) {return terms.laufzeit? terms.laufzeit.jahre : undefined})}/>
                <DataRow title="Sollzins" variants={this.state.data} value={concatTermInput.bind(this, function(terms) {return terms.sollzins? terms.sollzins + ' %' : undefined})}/>
                <DataRow className="emphazise" title="Monatsrate" variants={this.state.data} formatter={PriceFormat} value={function(variant) {return variant.result.monatsrate;}}/>
                <DataRow className="deemphazise" title="Monatsrate (expected)" variants={this.state.data} value={concatTermInput.bind(this,function(terms) {return terms.erwartet ? PriceFormat(terms.erwartet.monatsrate) : undefined;})}/>
                <DataRow className="emphazise" title="Restschuld" variants={this.state.data} formatter={PriceFormat} value={function(variant) {return variant.result.restschuld;}}/>
                <DataRow className="deemphazise" title="Restschuld (expected)" variants={this.state.data} value={concatTermInput.bind(this,function(terms) {return terms.erwartet ? PriceFormat(terms.erwartet.restschuld) : undefined;})}/>
                
                <DataRow title="Getilgt" variants={this.state.data} formatter={PriceFormat} value={function(variant) {return variant.result.getilgt;}}/>
                
                <DataRow title="Kosten (absolut)" variants={this.state.data} formatter={PriceFormat} value={function(variant) {return variant.result.kosten;}}/>
                <DataRow className="emphazise" title="Kosten (% vom getilgten)" variants={this.state.data} value={function(variant) {return variant.result.kostenProzentGetilgt + " %";}}/>
                <DataRow className="emphazise" title="CHECK" variants={this.state.data} formatter={PriceFormat} value={function(variant) {return variant.result.betrag - ( variant.result.getilgt + variant.result.restschuld);}}/>
            </table>
          </div>
	);
    }
});

module.exports = StartPage;
