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


var haspa1 = {
  label: "Haspa 1",
  monatsBetrag: 1000,
  betrag: 320000,
  kredit: {
    effzins: 2.4,
    laufzeit: 15
  },
  bauspar: {
    effzins: 2.5,
    sparzins: 0.1
  }
};

var behaviour1 = {
  label: "Genaue Monatsrate, keine Extratilgung",
  // precicely the required amount - not more
  monatsTotal: null,
  // no extra 'tilgung' at all
  yearlyExtra: 0
};

var varianten = [ {terms: haspa1, behaviour: behaviour1} ];


var StartPage = React.createClass({
    // Note that each Page must include the IntlMixin, otherwise the i18n data
    // doesn't get passed down
    mixins: [Router.Navigation, ReactIntl.IntlMixin],

    getInitialState: function() {
        return {data:_.map(varianten, function(variante) {
            return {
                variante: variante,
                data: sparEmpfehlung(variante)
            }
        })};
    },
    renderColumn: function (valueFkt) {
        return _.map(this.state.data, function(variant) {
            return (<td>{valueFkt(variant)}</td>);
        });
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
            <tr><th>Bedingungen</th>{this.renderColumn(function(variant) {return variant.variante.terms.label;})}</tr>
            <tr><th>Verhalten</th>{this.renderColumn(function(variant) {return variant.variante.behaviour.label;})}</tr>
            <tr><th>Kreditbetrag</th>{this.renderColumn(function(variant) {return variant.variante.terms.betrag + " €";})}</tr>
            <tr><th>Laufzeit</th>{this.renderColumn(function(variant) {return "TDB";})}</tr>
            <tr><th>Restschuld</th>{this.renderColumn(function(variant) {return "TDB";})}</tr>
            <tr><th>Renten-Auszahlung</th>{this.renderColumn(function(variant) {return "-";})}</tr>
            <tr><th>Kosten (absolut)</th>{this.renderColumn(function(variant) {return variant.data.kreditKosten + " €";})}</tr>
            <tr><th>Kosten (% vom getilgten)</th>{this.renderColumn(function(variant) {return "TBD";})}</tr>
            <tr><th>Monatsrate</th>{this.renderColumn(function(variant) {return "TBD";})}</tr>
            <tr><th>Extra-Tilgung pro Monat</th>{this.renderColumn(function(variant) {return "TBD";})}</tr>
            <tr><th>Extra-Tilgung pro Jahr</th>{this.renderColumn(function(variant) {return "TBD";})}</tr>
            </table>
          </div>
	);
    }
});

module.exports = StartPage;
