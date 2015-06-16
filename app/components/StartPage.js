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

var resultTemplate = {
    zinsBetrag: {
                summe: 0,
                details: [0]
            },

};

var runden = function (number) {
    return parseFloat(number.toFixed(2))
};
var runden0 = function (number) {
    return parseFloat(number.toFixed(0))
};

var hypothekendarlehen = function(input) {
    var label = input.label;// "Creditweb - focus.de rechner 16.06.2015",
    var years = input.laufzeit.jahre;// 20,
    var betrag = input.betrag;// 317000,
    var tilgung = input.tilgung;// 2.0,
    var tilgungVerzögerungMonate = input.tilgungVerzögerungMonate || 0;
    var sollzins = input.sollzins;// 2.47,
    var effektivzins = input.effektivzins;// 2.50,
    
    var yearly = betrag * ((tilgung+sollzins)/100.0);
    var monatsrate = runden(yearly / 12.0);
    var restschuld = betrag;
    
    /*
    for (var i=0; i < years; i++) {
        var realYearly = monatsrate * 12.0;
        var zinsbetrag = runden(restschuld * (sollzins/100.0));
        var tilgungsbetrag = realYearly - zinsbetrag;
        restschuld -= tilgungsbetrag;
    }
    */

    /*
     * Der Hypothekenrechner http://hypotheken.focus.de/rechner/focus/top.aspx?id=8&darstellung=0&zinsfestschreibung=20&gesamtkosten=398000&darlehen=317000&tilgung=2&plz=22337%20Hamburg&bauzustand=1&berufsgruppen=1&sondertilgungen=2 
     * rechnet so, dass sich nach jeder Monatsrate der Betrag verringert, nicht erst nach dem Jahr.
     * Wir machen das auch so. 
     */
    var monthlyValues = [];
    for (var i=0; i < 12*years; i++) {
        var restschuld = i ? monthlyValues[i-1].restschuld : betrag;
        var zinsbetrag = runden(restschuld * ((sollzins/12.0)/100.0));
        var tilgungsbetrag = i>=tilgungVerzögerungMonate? monatsrate - zinsbetrag : 0;
        monthlyValues.push({
            restschuld: restschuld - tilgungsbetrag,
            tilgungsbetrag: tilgungsbetrag,
            zinsbetrag: zinsbetrag
        });
    }
    
    return {
        monatsrate: monatsrate,
        restschuld: monthlyValues[monthlyValues.length - 1].restschuld,
        monthlyValues: monthlyValues
    };
}


var sparEmpfehlung = function (params) {
    var terms = params.terms;
  var kreditZinsEff = terms.kredit.effzins;
  var kreditLaufzeitJahre = terms.kredit.laufzeit;
  var bausparZinsEff = terms.bauspar.effzins;
  var bausparSparZins = terms.bauspar.sparzins;
  var betrag = terms.betrag;
  var monatsBetrag = terms.monatsBetrag;
  var jahresZins = betrag*kreditZinsEff/100.0;
  var monatsZins = jahresZins/12.0;
  var zinskosten1 = jahresZins*kreditLaufzeitJahre;

  var monatsSpar = monatsBetrag - monatsZins;
  var jahresSpar = 12.0*monatsSpar;
  var tilgungAnfang = (jahresSpar / betrag)*100.0;
  return {
      tilgungAnfang: tilgungAnfang,
      jahresSpar: jahresSpar,
      monatsZins: monatsZins,
      jahresZins: jahresZins,
      kreditKosten: zinskosten1
  }
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


var behaviour1 = {
  label: "Genaue Monatsrate, keine Extratilgung",
  // precicely the required amount - not more
  monatsTotal: null,
  // no extra 'tilgung' at all
  yearlyExtra: 0
};

var varianten = [ {terms: Creditweb, behaviour: behaviour1},
                  {terms: HaspaAnnu, behaviour: behaviour1},
                  {terms: HaspaKFW, behaviour: behaviour1}
                  ];
var DataRow = React.createClass({
    render: function() {
        
        return (<tr><th>{this.props.title}</th>{_.map(this.props.variants, function(variant) {
            var value = (typeof this.props.value === 'function') ? this.props.value(variant): this.props.value;
            var formattedValue = (typeof this.props.formatter === 'function') ? this.props.formatter(value): value;
            return (<td>{formattedValue}</td>);
        }.bind(this))}</tr>);
    }
});

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
                result: hypothekendarlehen(variante.terms)
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
    render: function () {
	return (
          <div className="container">
            <div className="lead">
                <FormattedMessage message={this.getIntlMessage("WELCOME")}
                                  name="Nutzer" />
            </div>
            <table>
                <DataRow title="Bedingungen" variants={this.state.data} value={function(variant) {return variant.input.terms.label;}}/>
                <DataRow title="Verhalten" variants={this.state.data} value={function(variant) {return variant.input.behaviour.label;}}/>
                <DataRow title="Kreditbetrag" variants={this.state.data} formatter={PriceFormat} value={function(variant) {return variant.input.terms.betrag;}}/>
                <DataRow title="Laufzeit (Jahre)" variants={this.state.data} value={function(variant) {return variant.input.terms.laufzeit.jahre;}}/>
                <DataRow title="Monatsrate" variants={this.state.data} formatter={PriceFormat} value={function(variant) {return variant.result.monatsrate;}}/>
                <DataRow title="Monatsrate (expected)" variants={this.state.data} formatter={PriceFormat} value={function(variant) {return variant.input.terms.erwartet.monatsrate;}}/>
                <DataRow title="Restschuld" variants={this.state.data} formatter={PriceFormat} value={function(variant) {return variant.result.restschuld;}}/>
                <DataRow title="Restschuld (expected)" variants={this.state.data} formatter={PriceFormat} value={function(variant) {return variant.input.terms.erwartet.restschuld;}}/>
                <DataRow title="Renten-Auszahlung" variants={this.state.data} value={"-"}/>
                <DataRow title="Kosten (absolut)" variants={this.state.data} formatter={PriceFormat} value={function(variant) {return variant.result.kreditKosten;}}/>
                <DataRow title="Kosten (% vom getilgten)" variants={this.state.data} value={"TBD"}/>
                
                <DataRow title="Extra-Tilgung pro Monat" variants={this.state.data} value={"TBD"}/>
                <DataRow title="Extra-Tilgung pro Jahr" variants={this.state.data} value={"TBD"}/>
            </table>
          </div>
	);
    }
});

module.exports = StartPage;
