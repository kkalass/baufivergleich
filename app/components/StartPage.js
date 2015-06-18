"use strict";

var React = require("react");
var Router = require("react-router");

var ReactIntl = require("react-intl");
var FormattedMessage = ReactIntl.FormattedMessage;
var Angebotstabelle = require("./Angebotstabelle");
var _ = require("underscore");
var Math2 = require("./math2");
var Kreditrechner = require("./kreditrechner");
var SzenarienService = require("./SzenarienService");

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

var overrideKreditTilgung = function (kredit, tilgungsOverride) {
    if (tilgungsOverride && tilgungsOverride.tilgung) {
        kredit.tilgung = _.clone(tilgungsOverride.tilgung);    
    }
    if (tilgungsOverride && tilgungsOverride.extra) {
        kredit.extraTilgung = _.clone(tilgungsOverride.extra);    
    }
};

var unfoldScenario = function (szenario) {
    var anschluss = szenario.anschlussSzenarien;
    var tilgungen = szenario.tilgungsSzenarien;
    var title = szenario.title;
    var kredite = szenario.kredite;
    
    return {
        title: title,
        szenarien: tilgungen.map(function(anschluss, kredite, tilgungszenario) {
            var varianten = anschluss.map(function(a) {
                return {
                    terms: {
                        label: a.label, 
                        kredite: _.map(kredite, function(kreditdetails, kreditname) {
                            var kredit = _.clone(kreditdetails);
                            var tilgungsOverride = tilgungszenario.kredite ? tilgungszenario.kredite[kreditname] : null;
                            
                            if (tilgungsOverride) {
                                overrideKreditTilgung(kredit, tilgungsOverride);    
                            }
                            
                            var anschlussOverride = a.kredite[kreditname];
                            kredit.abloesung = anschlussOverride ? _.clone(anschlussOverride) : null;
                            
                            if (tilgungsOverride && tilgungsOverride.anschluss && tilgungsOverride.anschluss[a.name]) {
                                var anschlussTilgungsOverride = tilgungsOverride.anschluss[a.name];
                                if (kredit.abloesung) {
                                    overrideKreditTilgung(kredit.abloesung, anschlussTilgungsOverride);
                                }
                            }
                            return kredit;
                        })
                    }
                };
            });
            return {
                title: tilgungszenario.title,
                werte: varianten
            }
        }.bind(this, anschluss, kredite))
    };
};

var StartPage = React.createClass({
    // Note that each Page must include the IntlMixin, otherwise the i18n data
    // doesn't get passed down
    mixins: [Router.Navigation, ReactIntl.IntlMixin],

    getInitialState: function() {
        var szenarien = SzenarienService.getStoredScenarios().map(unfoldScenario);
        
        return {szenarien: szenarien.map(function (szenario) {
            return {
                title: szenario.title,
                tilgungszenarien: szenario.szenarien.map(function(child) {
                    return {title: child.title, werte: Kreditrechner.berechnen(child.werte)};
                })
            }
        })};
        /*
        var varianten = SzenarienService.getVarianten();
        return {szenarien:[ 
            {
                title: "Creditweb3 - Rate hoch,  Risiko beherrschbar",
                tilgungszenarien: [
                   {
                       title: "Sparszenario: keine Extratilgungen",
                       werte: Kreditrechner.berechnen(varianten.creditweb3)
                   }
                ],
            },
            {
                title: "Creditweb - Risiko hoch",
                tilgungszenarien: [
                   {
                       title: "Sparszenario: keine Extratilgungen",
                       werte: Kreditrechner.berechnen(varianten.creditweb)
                   }
                ],
            }

        ]};
        */
    },
      
    render: function () {
    return (
          <div className="container">
            {this.state.szenarien.map(function(szenario) {
                return (
                    <div>
                        <h2>{szenario.title}</h2>
                        {szenario.tilgungszenarien.map(function (ts) {
                            return (
                                <div>
                                <h3>{ts.title}</h3>
                                <Angebotstabelle data={ts.werte} />
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
    }
});

module.exports = StartPage;
