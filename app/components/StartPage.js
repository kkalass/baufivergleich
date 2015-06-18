"use strict";

var React = require("react");
var Router = require("react-router");

var ReactIntl = require("react-intl");
var FormattedMessage = ReactIntl.FormattedMessage;
var Angebotstabelle = require("./Angebotstabelle");
var _ = require("underscore");
var Math2 = require("./math2");
var Kreditrechner = require("./kreditrechner");

/**
 * <h1>
 * Sparszenarien, Anschlussszenarien
 */

var CreditwebBase = {
    label: "Creditweb - focus.de rechner 16.06.2015",
    laufzeit: {jahre: 20},
    startzeit: {monat: 7},
    betrag: 317000,
    
    sollzins: 2.47,
    
    erwartet: {
        monatsrate: 1180.83,
        restschuld: 153230,
        effektivzins: 2.50
    }
};

var Creditweb=_.defaults({/*tilgung: 2.00,*/ monatsrate: 1200}, CreditwebBase);
var Creditweb2=_.defaults({tilgung: 3.00}, CreditwebBase);
var Creditweb3=_.defaults({ monatsrate: 1300}, CreditwebBase);

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

/*
72000 = 0.4 * x;
x = 72/0.4;
*/
var variantenNicole = [ 
                         
         {terms: {
             label: "Equivalente Anschlussfinanzierung (2.15%, 30 Jahre)",
             kredite: [{
                 label: "Herrmann 1 -  17.06.2015",
                 laufzeit: {jahre: 20},
                 startzeit: {monat: 7},
                 betrag: 326000,
                 monatsrate: 1090,
                 sollzins: 2.47,
                 /*abloesung: {
                     laufzeit: {jahre: 15},
                     startzeit: {monat: 6},
                     
                     tilgung: 5.655,
                     sollzins: 2.15,

                 },*/
                 
                 erwartet: {
                     monatsrate: 1263.25,
                     //restschuld: 153230,
                     //effektivzins: 2.50
                 }
             }]
         }}
 ];

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


var StartPage = React.createClass({
    // Note that each Page must include the IntlMixin, otherwise the i18n data
    // doesn't get passed down
    mixins: [Router.Navigation, ReactIntl.IntlMixin],

    getInitialState: function() {
        return {
            herrmann: Kreditrechner.berechnen(variantenHerrmann),
            nicole: Kreditrechner.berechnen(variantenNicole),
            haspa: Kreditrechner.berechnen(variantenHaspa),
            haspaBauspar: Kreditrechner.berechnen(variantenHaspaBauspar),
            creditweb: Kreditrechner.berechnen(variantenCreditweb),
            creditweb2: Kreditrechner.berechnen(variantenCreditweb2),
            creditweb3: Kreditrechner.berechnen(variantenCreditweb3)
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
            <h3>Sparszenario: keine Extratilgungen</h3>
            <Angebotstabelle data={this.state.haspa}/>
            <h2>Nicole</h2>
            <h3>Sparszenario: keine Extratilgungen</h3>
            <Angebotstabelle data={this.state.nicole}/>
            <h2>Herrmann 1 - Risiko viel zu hoch</h2>
            <h3>Sparszenario: keine Extratilgungen</h3>
            <Angebotstabelle data={this.state.herrmann}/>
           
            <h2>Haspa Bauspar - Rate zu hoch, Risiko hoch</h2>
            <h3>Sparszenario: keine Extratilgungen</h3>
            <Angebotstabelle data={this.state.haspaBauspar}/>
            
            <h2>Creditweb3 - Rate hoch,  Risiko beherrschbar</h2>
            <h3>Sparszenario: keine Extratilgungen</h3>
            <Angebotstabelle data={this.state.creditweb3}/>
        
            <h2>Creditweb - Risiko hoch</h2>
            <h3>Sparszenario: keine Extratilgungen</h3>
            <Angebotstabelle data={this.state.creditweb}/>
        </div>
    );
    }
});

module.exports = StartPage;
