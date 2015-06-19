/*
 * Next Steps:
 *
 *  - Informativere Ausgabe, kreditkonzept anzeigen
 *  - Tilgungsszenarien einbauen
 *  - Detailseite zu Angeboten (incl. abgelehnte)
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

"use strict";

var React = require("react");
var Router = require("react-router");

var ReactIntl = require("react-intl");
var FormattedMessage = ReactIntl.FormattedMessage;
var Angebotstabelle = require("./Angebotstabelle");
var _ = require("underscore");
var Math2 = require("./math2");
var Kreditrechner = require("./kreditrechner");
var Datenbank = require("./Datenbank");


var FILTER_HIDDEN = function(t) {return !t.hide;};

var overrideKreditTilgung = function (kredit, tilgungsOverride) {
    if (tilgungsOverride && tilgungsOverride.tilgung) {
        kredit.tilgung = _.clone(tilgungsOverride.tilgung);    
    }
    if (tilgungsOverride && tilgungsOverride.extra) {
        kredit.extraTilgung = _.clone(tilgungsOverride.extra);    
    }
};

var mkStdAnschlussSzenarien = function (szenarien, params) {
    
    var kredite = params.kredite;
    //var laufzeiten = params.laufzeit;
    
    var overrides = params.overrides;
    
    var mkKredite = function(kreditNames, kredite, overrides, config) {
        var r = {};
        kreditNames.map(function(kreditName) {
            r[kreditName] = _.defaults({}, (kredite?kredite[kreditName]: null) || {}, (overrides?overrides[kreditName]: null) || {}, config || {});
        });
        return r;
    };
    return szenarien.map(function (r) {
        var kreditBedingungen = r.defaultKreditTerms === null ? 
               _.object(_.keys(kredite).map(function(kreditName) {return [kreditName, null];})) : 
                   mkKredite(_.keys(kredite), kredite, overrides[r.name], r.defaultKreditTerms);
        return {
            name: r.name,
            label: r.label,
            kredite: kreditBedingungen
        };
    });
};

/*
 * Example for Object:
 * 
 anschlussSzenarien: {
            laufzeit: {
                'hauptkredit': {jahre: 10}
            },
            'overrides': {
                'anschlussEquivalent': {
                    'hauptkredit': {
                        // you can override whatever you want
                        
                        //tilgung: {
                        //    prozentStart: 8.825
                        //},
                        
                        sollzins: 2.47,
                    }
                }
            }
        }
 */
var getAnschlussSzenarien = function (szenarien, angebot) {
    if (_.isArray(angebot.anschlussSzenarien)) {
        return angebot.anschlussSzenarien;
    } else if (_.isObject(angebot.anschlussSzenarien)) {
        return mkStdAnschlussSzenarien(szenarien, angebot.anschlussSzenarien);
    }
    return [
            {
                name: 'anschlussNichts',
                label: "Ohne weitere Anschlussfinanzierung"
            }
       ];
};


/*
 * Bsp. für Tilgungsszenarien 
 * 
 tilgungsSzenarien: [
            {
                title: 'Keine Extra-Tilgungen',
                kredite: {
                    'hauptkredit': {
                        // Optional: Reguläre Tilgung überschreiben
                        tilgung: {
                            monatsrate: 1200
                        }, 
                        extra: {
                            // keine Extra-Tilgung
                        },
                        
                        anschluss: {
                            'anschlussEquivalent': {
                                // Hier kann man den Tilgungssatz des Anschlussszenarios ändern - wenn das notwendig ist für das Szenario
                                // Optional: Reguläre Tilgung des Anschlussszenarios überschreiben
                                tilgung: {
                                    prozentStart: 8.825
                                },
                                
                                // Auch die Extratilgungen im Anschlussszenario können gesteuert werden
                                
                                extra: {
                                    // keine Extra-Tilgung
                                }
                                
                            }
                        }
                    }
                }
            }
        ],
 */
var getTilgungsSzenarien = function (angebot) {
    if (_.isArray(angebot.tilgungsSzenarien)) {
        return angebot.tilgungsSzenarien;
    } 
    return [
           {
               title: 'Keine Extra-Tilgungen'
           }
       ];
};

var unfoldScenario = function (szenarien, angebot) {
    var anschluss = _.filter(getAnschlussSzenarien(szenarien.anschluss, angebot), FILTER_HIDDEN);
    var tilgungen = _.filter(getTilgungsSzenarien(angebot), FILTER_HIDDEN);
    var title = angebot.title;
    var kredite = angebot.kredite;
    
    return {
        title: title,
        abgelehnt: angebot.abgelehnt,
        bewertung: angebot.bewertung,
        begruendung: angebot.begruendung,
        kredite: kredite, 
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
                            
                            
                            if (a.kredite && (typeof a.kredite[kreditname]) !== 'undefined') {
                                var anschlussOverride = a.kredite[kreditname];
                                kredit.abloesung = anschlussOverride ? _.clone(anschlussOverride) : null;
                            }
                            
                            
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
        var data = Datenbank.get();

        var angebote = _.clone(data.angebote);
        angebote.sort(function (a1, a2) {
            if (!!a1.abgelehnt != !!a2.abgelehnt) {
                return a1.abgelehnt ? 1 : -1;
            }
            return a1.title < a2.title ? -1 : (a1.title > a2.title ? 1 : 0); 
        });
        
        var angeboteUnfolded = angebote.map(unfoldScenario.bind(this, data.szenarien));
        
        return {
            maxMonatsrate: 1280,
            angebote: angeboteUnfolded.map(function (angebot) {
                return {
                    abgelehnt: angebot.abgelehnt,
                    title: angebot.title,
                    bewertung: angebot.bewertung,
                    begruendung: angebot.begruendung,
                    kredite: angebot.kredite,
                    tilgungszenarien: angebot.szenarien.map(function(child) {
                        return {title: child.title, werte: Kreditrechner.berechnen(child.werte)};
                    })
                }
            })
        };
    },
      
    
    render: function () {
    return (
          <div className="container">
            {this.state.angebote.map(function(angebot) {
                if (!this.props.showAll && angebot.abgelehnt) {
                    return (<div className="angebot abgelehnt">
                        <a href="#/all" title={angebot.begruendung}>{angebot.title}</a>
                    </div>);
                }
                return (
                    <div className={angebot.abgelehnt ? "angebot abgelehnt" : "angebot"}>
                        <h2>{angebot.title}</h2>
                        
                        {_.map(angebot.kredite, function(kredit, kreditname) {
                            if (kredit.type === 'bauspar') {
                                return (<h3>BAUFSPAR</h3>);
                            }
                            return (
                                <div>
                                   {_.size(angebot.kredite) > 1 ? (<h4>{kreditname}</h4>): ''}
                                   <table>
                                       <tr><th>Sollzinsbindung&nbsp;</th><td>{kredit.laufzeit.jahre + " Jahre"}</td></tr>
                                       <tr><th>Betrag&nbsp;</th><td><FormattedMessage message="{total, number, eur}" total={kredit.betrag} /></td></tr>
                                       <tr><th>Sollzins&nbsp;</th><td>{kredit.sollzins} %</td></tr>
                                       {kredit.tilgung.prozentStart ? (<tr><th>Anfangstilgung&nbsp;</th><td>{kredit.tilgung.prozentStart} %</td></tr>) : ''}
                                       {kredit.tilgung.monatsrate ? (<tr><th>Monatsrate&nbsp;</th><td><FormattedMessage message="{total, number, eur}" total={kredit.tilgung.monatsrate} /></td></tr>) : ''}
                                       {kredit.tilgung.restschuld ? (<tr><th>Restschuld&nbsp;</th><td><FormattedMessage message="{total, number, eur}" total={kredit.tilgung.restschuld} /></td></tr>) : ''}
                                   </table>
                               </div>
                            );
                        })}
                        <br/>
                        <table>
                            <tr><th>Bewertung&nbsp;</th><td>{angebot.bewertung}</td></tr>
                            <tr><th>Begründung&nbsp;</th><td>{angebot.begruendung}</td></tr>
                        </table>

                        {angebot.tilgungszenarien.map(function (ts) {
                            return (
                                <div>
                                <h3>{ts.title}</h3>
                                <Angebotstabelle maxMonatsrate={this.state.maxMonatsrate} data={ts.werte} />
                                </div>
                            );
                        }.bind(this))}
                    </div>
                );
            }.bind(this))}
        </div>
    );
    }
});

module.exports = StartPage;
