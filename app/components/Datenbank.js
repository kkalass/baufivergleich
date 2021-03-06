"use strict";

var _ = require('underscore');

var daten = {
  szenarien: {
      anschluss: [
            {
                name: 'anschlussEquivalent',
                label: "Equivalente Volltilgung",
                defaultKreditTerms: {tilgung: {restschuld: 0}, sollzins: 2.00}
            },
            {
                name: 'anschlussExpected',
                label: "Erwartete Volltilgung (5%)",
                defaultKreditTerms: {tilgung: {restschuld: 0}, sollzins: 5.00}
            },
            {
                name: 'anschlussExpectedUngetilgt',
                label: "Erwartete Anschlussfinanzierung *UNGETILGT* (5%) ",
                defaultKreditTerms: {tilgung: {prozentStart: 0}, sollzins: 5.00}
            },
            {
                name: 'anschlussSehrSchlecht',
                label: "Sehr schlechte Volltilgung (12%)",
                defaultKreditTerms: {tilgung: {restschuld: 0}, sollzins: 12.00}
            },
            {
                name: 'anschlussSehrSchlechtUngetilgt',
                label: "Sehr schlechte Anschlussfinanzierung *UNGETILGT* (12%) ",
                defaultKreditTerms: {tilgung: {prozentStart: 0}, sollzins: 12.00}
            },
            {
                name: 'anschlussNichts',
                label: "Ohne Anschlussfinanzierung",
                defaultKreditTerms: null
            }
      ]
  },
  
  angebote: [
    {
        title: 'Eigene Kombi: Bauspar über 250TE',
        abgelehnt: false,
        bewertung: '',
        begruendung: 'Sehr viele Annahmen, keine konkrete Angebote. u. a. Annahme, dass wir nur 25% Mindestsparguthaben bei der Ablösung brauchen. Und Annahme, dass meine Rechnung einigermassen korrekt ist...',
        kredite: {
            "hauptkredit" : {
                label: "Bauspar Hypoathekendarlehen S",
                type: "kredit",
                laufzeit: {jahre: 15},
                startzeit: {monat: 6, jahr: 2015},
                betrag: 316000,
                sollzins: 2.15,
                tilgung: {
                    restschuld: 250000
                },
                
                abloesung: {
                    label: "Bauspar Schwäbisch Hall",
                    type: "bauspar",
                    
                    gebuehr: {
                        abschluss: 2500, 
                        //jahr: 12
                    },
                    
                    betrag: 250000,
                    
                    sparphase: {
                        laufzeit: {jahre: 15},
                        //monatsrate: 700, // bei 50% Mindestsparguthaben
                        monatsrate: 570, // bei 25% Mindestsparguthaben
                        zins: 0.25
                    },
                    
                    kreditphase: {
                        laufzeit: {jahre: 17},
                        tilgung: {
                            restschuld: 0,
                        },
                        sollzins: 2.35
                    }
                }
            }
        }
    },
     {
         title: 'Creditweb 1200 EUR Monatsrate',
         
         abgelehnt: true,
         bewertung: 'Schlecht',
         begruendung: 'Erwarteter Zinssatz nicht mehr auf 0-Restschuld weiterführbar, Worst-Case-Zinssatz auch tilgungsfrei deutlich über Monatsrate, Equivalente Anschlussfinanzierung führt zu höherer Rate.',
         
         kredite: {
             "hauptkredit" : {
                 label: "Creditweb - focus.de rechner 16.06.2015",
                 laufzeit: {jahre: 20},
                 startzeit: {monat: 7, jahr: 2015},
                 betrag: 317000,
                 sollzins: 2.47,
                 // man könnte hier schon einen gemeinsamen Tilgungssatz angeben, wenn sich die Szenarien nur durch extra tilgung Unterscheiden
                 tilgung: {
                     monatsrate: 1200
                 }
             }
         },
         
         anschlussSzenarien: {
             'kredite': {
                 'hauptkredit': {
                     laufzeit: {
                         jahre: 10
                     }
                 }
             },
             'overrides': {
                 'anschlussEquivalent': {
                     'hauptkredit': {
                         sollzins: 2.47,
                     }
                 }
             }
         }
     },
     {
         title: 'Interhyp - 28.05.2015 - DSL Bank - 20 Jahre gebunden, 30 bis Volltilgung',
         
         abgelehnt: true,
         bewertung: 'Schlecht',
         begruendung: 'Nach 20 Jahren Rate selbst im besten Fall zu hoch - mit dieser Anfangsrate ist Volltilgung nicht in 30 Jahren machbar',
         
         kredite: {
             "hauptkredit" : {
                 label: "DSL Bank",
                 laufzeit: {jahre: 20},
                 startzeit: {monat: 7, jahr: 2015},
                 betrag: 318000,
                 sollzins: 2.41,
                 // man könnte hier schon einen gemeinsamen Tilgungssatz angeben, wenn sich die Szenarien nur durch extra tilgung Unterscheiden
                 tilgung: {
                     prozentStart: 2.0
                 }
             }
         },
         
         anschlussSzenarien: {
             'kredite': {
                 'hauptkredit': {
                     laufzeit: {
                         jahre: 10
                     }
                 }
             },
             'overrides': {
                 'anschlussEquivalent': {
                     'hauptkredit': {
                         sollzins: 2.41
                     }
                 }
             }
         }
     },
     {
         title: 'Interhyp - 19.06.2015 - DSL Bank - 20 Jahre gebunden, 32 bis Volltilgung',
         
         abgelehnt: true,
         bewertung: '',
         begruendung: '',
         
         kredite: {
             "hauptkredit" : {
                 label: "DSL Bank",
                 laufzeit: {jahre: 20},
                 startzeit: {monat: 7, jahr: 2015},
                 betrag: 318000,
                 sollzins: 2.54,
                 // man könnte hier schon einen gemeinsamen Tilgungssatz angeben, wenn sich die Szenarien nur durch extra tilgung Unterscheiden
                 tilgung: {
                     prozentStart: 2.0
                 }
             }
         },
         
         anschlussSzenarien: {
             'kredite': {
                 'hauptkredit': {
                     laufzeit: {
                         jahre: 12
                     }
                 }
             },
             'overrides': {
                 'anschlussEquivalent': {
                     'hauptkredit': {
                         sollzins: 2.54
                     }
                 }
             }
         }
     },
     {
         title: 'Interhyp - 19.06.2015 - DSL Bank - 20 Jahre gebunden, 32 bis Volltilgung - höhere Anfangstilgung',
         
         abgelehnt: false,
         bewertung: 'Evtl. Machbar',
         begruendung: 'Wie die vergleichbaren Angebote - z. B. von Creditweb - würde das prinzipiell funktionieren, ist aber noch etwas teurer',
         
         kredite: {
             "hauptkredit" : {
                 label: "DSL Bank",
                 laufzeit: {jahre: 20},
                 startzeit: {monat: 7, jahr: 2015},
                 betrag: 318000,
                 sollzins: 2.54,
                 // man könnte hier schon einen gemeinsamen Tilgungssatz angeben, wenn sich die Szenarien nur durch extra tilgung Unterscheiden
                 tilgung: {
                     monatsrate: 1280
                 }
             }
         },
         
         anschlussSzenarien: {
             'kredite': {
                 'hauptkredit': {
                     laufzeit: {
                         jahre: 12
                     }
                 }
             },
             'overrides': {
                 'anschlussEquivalent': {
                     'hauptkredit': {
                         sollzins: 2.54
                     }
                 }
             }
         }
     },
     {
         title: 'Interhyp - 19.06.2015 - Sparkasse Westholstein - 20 Jahre gebunden, 32 bis Volltilgung',
         
         abgelehnt: true,
         bewertung: 'Schlecht',
         begruendung: 'Bei erwartetem Szenario ist die Monatsrate im Anschluss zu hoch',
         
         kredite: {
             "hauptkredit" : {
                 label: "Sparkasse Westholstein",
                 laufzeit: {jahre: 20},
                 startzeit: {monat: 7, jahr: 2015},
                 betrag: 318000,
                 sollzins: 2.61,
                 // man könnte hier schon einen gemeinsamen Tilgungssatz angeben, wenn sich die Szenarien nur durch extra tilgung Unterscheiden
                 tilgung: {
                     prozentStart: 2.0
                 }
             }
         },
         
         anschlussSzenarien: {
             'kredite': {
                 'hauptkredit': {
                     laufzeit: {
                         jahre: 12
                     }
                 }
             },
             'overrides': {
                 'anschlussEquivalent': {
                     'hauptkredit': {
                         sollzins: 2.61
                     }
                 }
             }
         }
     },
     {
         title: 'Interhyp - 28.05.2015 - DSL Bank - 20 Jahre gebunden, 40 bis Volltilgung',
         
         abgelehnt: true,
         bewertung: 'Schlecht',
         begruendung: 'Veraltet. Volltilgung  in 40 Jahren beim erwarteten Zinssatz machbar, aber bei 12% Zinsen nach 20 Jahren ist das Haus nicht mehr haltbar',
         
         kredite: {
             "hauptkredit" : {
                 label: "DSL Bank",
                 laufzeit: {jahre: 20},
                 startzeit: {monat: 7, jahr: 2015},
                 betrag: 318000,
                 sollzins: 2.41,
                 // man könnte hier schon einen gemeinsamen Tilgungssatz angeben, wenn sich die Szenarien nur durch extra tilgung Unterscheiden
                 tilgung: {
                     prozentStart: 2.0
                 }
             }
         },
         
         anschlussSzenarien: {
             'kredite': {
                 'hauptkredit': {
                     laufzeit: {
                         jahre: 20
                     }
                 }
             },
             'overrides': {
                 'anschlussEquivalent': {
                     'hauptkredit': {
                         sollzins: 2.41
                     }
                 }
             }
         }
     },
     {
         title: 'Interhyp - 28.05.2015 - DSL Bank - 20 Jahre gebunden, 30 bis Volltilgung - Unsere Variation mit höherer Monatsrate',
         
         abgelehnt: true,
         bewertung: 'Evtl. Machbar',
         begruendung: 'Veraltet. Wie die vergleichbaren Angebote - z. B. von Creditweb - würde das prinzipiell funktionieren',
         
         kredite: {
             "hauptkredit" : {
                 label: "DSL Bank",
                 laufzeit: {jahre: 20},
                 startzeit: {monat: 7, jahr: 2015},
                 betrag: 318000,
                 sollzins: 2.41,
                 tilgung: {
                     monatsrate: 1280
                 }
             }
         },
         
         anschlussSzenarien: {
             'kredite': {
                 'hauptkredit': {
                     laufzeit: {
                         jahre: 10
                     }
                 }
             },
             'overrides': {
                 'anschlussEquivalent': {
                     'hauptkredit': {
                         sollzins: 2.41
                     }
                 }
             }
         }
     },
     {
         title: 'Creditweb 1280 EUR Monatsrate, 32 Jahre bis Volltilgung',
         
         abgelehnt: false,
         bewertung: 'Evtl. Machbar',
         begruendung: 'Monatsrate zu hoch, aber Worst-Case-Zinssatz bei Tilgungsfreiheit unter der Monatsrate. Erwartete Anschlussfinanzierung führt zu etwas niedrigerer Anschluss-Rate.',
         
         kredite: {
             "hauptkredit" : {
                 label: "Creditweb - focus.de rechner 16.06.2015",
                 laufzeit: {jahre: 20},
                 startzeit: {monat: 7, jahr: 2015},
                 betrag: 317000,
                 sollzins: 2.47,
                 // man könnte hier schon einen gemeinsamen Tilgungssatz angeben, wenn sich die Szenarien nur durch extra tilgung Unterscheiden
                 tilgung: {
                     monatsrate: 1280
                 }
             }
         },
         anschlussSzenarien: {
             'kredite': {
                 'hauptkredit': {
                     laufzeit: {
                         jahre: 12
                     }
                 }
             },
             'overrides': {
                 'anschlussEquivalent': {
                     'hauptkredit': {
                         sollzins: 2.47,
                     }
                 }
             }
         }
     },
     {
         title: 'Creditweb 3% Tilgung',
         bewertung: 'Schlecht',
         begruendung: 'Monatsraten mit ca. 1.450 EUR deutlich zu hoch. Vorteil: Geringe Restschuld nach 20 Jahren, selbst bei 12% problemlos',
         abgelehnt: true,
         kredite: {
             "hauptkredit" : {
                 label: "Creditweb - focus.de rechner 16.06.2015",
                 laufzeit: {jahre: 20},
                 startzeit: {monat: 7, jahr: 2015},
                 betrag: 317000,
                 sollzins: 2.47,
                 // man könnte hier schon einen gemeinsamen Tilgungssatz angeben, wenn sich die Szenarien nur durch extra tilgung Unterscheiden
                 tilgung: {
                     prozentStart: 3.00
                 }
             }
         },
         anschlussSzenarien: {
             'kredite': {
                 'hauptkredit': {
                     laufzeit: {
                         jahre: 10
                     }
                 }
             },
             'overrides': {
                 'anschlussEquivalent': {
                     'hauptkredit': {
                         sollzins: 2.47,
                     }
                 }
             }
         }
    
     },
     {
         title: 'Haspa Annuitäten',
         
         abgelehnt: true,
         bewertung: 'Sehr Schlecht',
         begruendung: 'Hängt extrem von Anschlussfinanzierung ab - selbst bei equivalenter Anschlussfinanzierung ist die Rate dann höher, bei 12% ist eine Zwangsversteigerung unausweichlich',
         
         kredite: {
             "hauptkredit" : {
                 label: "Haspa Annuitätendarlehen - Angebot vom 28.05.2015",
                 laufzeit: {jahre: 15},
                 startzeit: {monat: 6, jahr: 2015},
                 betrag: 270000,
                 sollzins: 2.25,
                 tilgung: {
                     prozentStart: 2.00
                 }
             },
             "kfw": { 
                 label: "Haspa Annuitätendarlehen - KFW - Angebot vom 28.05.2015",
                 laufzeit: {jahre: 10},
                 
                 startzeit: {
                     monat: 6, 
                     jahr: 2015
                 },
                 
                 betrag: 50000,
                 sollzins: 1.55,
                 tilgungVerzögerungMonate: 12, // 'Freijahre' in den Bedingungen - in dieser Zeit wird nicht getilgt
                 tilgung: {
                     prozentStart: 2.24
                 }
             }
         },
         anschlussSzenarien: {
             'kredite': {
                 'hauptkredit': {
                     laufzeit: {
                         jahre: 15
                     }
                 },
                 'kfw': {
                     laufzeit: {
                         jahre: 20
                     }
                 }
             },
             'overrides': {
                 'anschlussEquivalent': {
                     'kfw': {
                         sollzins: 1.57
                     },
                     'hauptkredit': {
                         sollzins: 2.47
                     }
                 }
             }
         }
    
     },
     {
         title: 'Experimente Klas',
         
         abgelehnt: true,
         bewertung: '',
         begruendung: 'Was wäre wenn - kein realistisches Angebot.',
         
         kredite: {
             "hauptkredit" : {
                 laufzeit: {jahre: 20},
                 startzeit: {monat: 7, jahr: 2015},
                 betrag: 317000,
                 sollzins: 1.9,
                 // man könnte hier schon einen gemeinsamen Tilgungssatz angeben, wenn sich die Szenarien nur durch extra tilgung Unterscheiden
                 tilgung: {
                     //prozentStart: 2.5
                     monatsrate: 1200
                 }
             }
         },
         anschlussSzenarien: {
             'kredite': {
                 'hauptkredit': {
                     laufzeit: {
                         jahre: 10
                     }
                 }
             },
             'overrides': {
                 'anschlussEquivalent': {
                     'hauptkredit': {
                         sollzins: 1.9,
                     }
                 }
             }
         }
     },
     {
         title: 'Varianten Frau Herrmann 1 - 17.06.2015',
         abgelehnt: true,
         bewertung: 'Sehr Schlecht',
         begruendung: 'Bei 12% auch tilgungsfrei sehr wahrscheinlich Zwangsversteigerung, bei erwarteter Anschlussfinanzierung nicht nach 30 Jahren getilgt',
         kredite: {
             "hauptkredit" : {
                 laufzeit: {jahre: 15},
                 startzeit: {monat: 7, jahr: 2015},
                 betrag: 326000,
                 sollzins: 2.15,
                 tilgung: {
                     prozentStart: 2.5
                 }
             }
         },
         anschlussSzenarien: {
             'kredite': {
                 'hauptkredit': {
                     laufzeit: {
                         jahre: 15
                     }
                 }
             },
             'overrides': {
                 'anschlussEquivalent': {
                     'hauptkredit': {
                         sollzins: 2.15,
                     }
                 }
             }
         }

    
     },
     {
         title: 'Variante Frau Herrmann 1 - 18.06.2015 - 40 Jahre',
         abgelehnt: true,
         bewertung: 'Sehr Schlecht',
         // FIXME: Sondertilgungsszenarien mit einbauen - so hatte Frau Herrmann das wohl gemeint - das könnte uns etwas Flexibilität geben
         begruendung: 'Sehr hohe Restschuld nach 20 Jahren , schon bei 5% ungetilgter Anschlussfinanzierung steigt die Monatsrate, sehr sehr hohes Risiko',
         kredite: {
             "hauptkredit" : {
                 laufzeit: {jahre: 20},
                 startzeit: {monat: 7, jahr: 2015},
                 betrag: 326000,
                 sollzins: 2.51,
                 tilgung: {
                     prozentStart: 1
                 }
             }
         },
         anschlussSzenarien: {
             'kredite': {
                 'hauptkredit': {
                     laufzeit: {
                         jahre: 20
                     }
                 }
             },
             'overrides': {
                 'anschlussEquivalent': {
                     'hauptkredit': {
                         sollzins: 2.51,
                     }
                 }
             }
         }
         
     },
     {
         title: 'Variante Frau Herrmann 2  - 18.06.2015 - Bausparkombi',
         abgelehnt: true,
         bewertung: 'Sehr Schlecht',

         begruendung: 'Macht überhaupt keinen Sinn - war das überhaupt so gemeint? Ist mir etwas unklar',
         kredite: {
             
             "hauptkredit" : {
                 laufzeit: {jahre: 20},
                 startzeit: {monat: 7, jahr: 2015},
                 betrag: 163000,
                 sollzins: 2.51,
                 tilgung: {
                     prozentStart: 1
                 }
             },
             "bauspar" : {
                 type: "kredit",
                 laufzeit: {jahre: 15},
                 startzeit: {monat: 6, jahr: 2015},
                 betrag: 163000,
                 sollzins: 2.25,
                 tilgung: {
                     prozentStart: 0
                 },
                
                 abloesung: {
                     
                     type: "bauspar",
                     gebuehr: {
                         // FIXME: gebühren?
                         abschluss: 0, 
                         jahr: 0
                     },
                     
                     betrag: 163000,
                     sparphase: {
                         laufzeit: {jahre: 15},
                         monatsrate: 263.71,
                         // FIXME: gibt es Zins?
                         zins: 0.0
                     },
                     // FIXME: spare ich hier genug an?
                     // FIXME: sind die Werte wirklich das was sie meinte?
                     kreditphase: {
                         laufzeit: {jahre: 15},
                         tilgung: {
                             restschuld: 0,
                         },
                         sollzins: 2.15
                     }
                 }
                 
             },
         },
         anschlussSzenarien: {
             'kredite': {
                 'hauptkredit': {
                     laufzeit: {
                         jahre: 10
                     }
                 },
                 'kfw': {
                     laufzeit: {
                         jahre: 20
                     }
                 }
             },
             'overrides': {
                 'anschlussEquivalent': {
                     'hauptkredit': {
                         sollzins: 2.51,
                     }
                 }
             }
         }
     },
     {
         title: 'Variante Frau Herrmann 3 - Konstantdarlehen - 18.06.2015 - 30 Jahre',
         abgelehnt: true,
         bewertung: 'Evtl. machbar',
         begruendung: 'Ähnlich dem Konstantdarlehen bei Creditweb, ursprünglich hatte sie uns 2.15 angegeben, auf Nachfrage das aber auf 2.51 korrigiert',
         kredite: {
             "hauptkredit" : {
                 laufzeit: {jahre: 20},
                 startzeit: {monat: 7, jahr: 2015},
                 betrag: 326000,
                 sollzins: 2.51,
                 tilgung: {
                     prozentStart: 2.5
                 }
             }
         },
         anschlussSzenarien: {
             'kredite': {
                 'hauptkredit': {
                     laufzeit: {
                         jahre: 10
                     }
                 }
             },
             'overrides': {
                 'anschlussEquivalent': {
                     'hauptkredit': {
                         sollzins: 2.51,
                     }
                 }
             }
         }
         
     },
     {
         title: 'Variante Frau Herrmann 4  - 18.06.2015 - Bauspar - 32 Jahre',
         abgelehnt: false,
         bewertung: 'Machbar',

         begruendung: 'Ganz so nicht so interessant, unklar. Laut mail wie folgt gedacht: Belastung 1. bis 3. Jahr monatlich 1.004,08 € - 4. bis 15. Jahr monatlich 1.304,08 € - Restlaufzeit monatlich 1.297,00 €',
         kredite: {
             "hauptkredit" : {
                 type: "kredit",
                 laufzeit: {jahre: 15},
                 startzeit: {monat: 6, jahr: 2015},
                 betrag: 326000,
                 sollzins: 2.15,
                 tilgung: {
                     prozentStart: 0
                 },
                
                 abloesung: {
                     
                     type: "bauspar",
                     gebuehr: {
                         // FIXME: gebühren?
                         abschluss: 0, 
                         jahr: 0
                     },
                     
                     betrag: 326000,
                     sparphase: {
                         laufzeit: {jahre: 15},
                         monatsrate: 420,
                         // FIXME: gibt es Zins?
                         zins: 0.0
                     },
                    
                     kreditphase: {
                         laufzeit: {jahre: 17},
                         tilgung: {
                             restschuld: 0,
                         },
                         sollzins: 2.35
                     }
                 }
                 
             },
         }
     },
     {
         title: 'Variante Frau Herrmann 5 -unsere variation  - 18.06.2015 - Bauspar - 32 Jahre',
         abgelehnt: false,
         bewertung: 'Evtl. Machbar',

         begruendung: 'Das einzige echte voll getilgte Angebot, ich habe aber Zweifel an der Realisierbarkeit. Ausserdem fehlen Infos zu Gebühren und so.',
         kredite: {
             "hauptkredit" : {
                 type: "kredit",
                 laufzeit: {jahre: 15},
                 startzeit: {monat: 6, jahr: 2015},
                 betrag: 326000,
                 sollzins: 2.15,
                 tilgung: {
                     prozentStart: 0
                 },
                
                 abloesung: {
                     
                     type: "bauspar",
                     gebuehr: {
                         // FIXME: gebühren?
                         abschluss: 0, 
                         jahr: 0
                     },
                     
                     betrag: 326000,
                     sparphase: {
                         laufzeit: {jahre: 15},
                         monatsrate: 620,
                         // FIXME: gibt es Zins?
                         zins: 0.0
                     },
                    
                     kreditphase: {
                         laufzeit: {jahre: 17},
                         tilgung: {
                             restschuld: 0,
                         },
                         sollzins: 2.35
                     }
                 }
                 
             },
         }
     },
     {
         title: 'Variante Frau Herrmann 5b -unsere variation  - 18.06.2015 - Bauspar - 32 Jahre - mehr eigenkapital',
         abgelehnt: false,
         bewertung: 'Evtl. Machbar',

         begruendung: 'Das einzige echte voll getilgte Angebot, ich habe aber Zweifel an der Realisierbarkeit. Ausserdem fehlen Infos zu Gebühren und so.',
         kredite: {
             "hauptkredit" : {
                 type: "kredit",
                 laufzeit: {jahre: 15},
                 startzeit: {monat: 6, jahr: 2015},
                 betrag: 316000,
                 sollzins: 2.15,
                 tilgung: {
                     prozentStart: 0
                 },
                
                 abloesung: {
                     
                     type: "bauspar",
                     gebuehr: {
                         // FIXME: gebühren?
                         abschluss: 0, 
                         jahr: 0
                     },
                     
                     betrag: 316000,
                     sparphase: {
                         laufzeit: {jahre: 15},
                         monatsrate: 620,
                         // FIXME: gibt es Zins?
                         zins: 0.0
                     },
                    
                     kreditphase: {
                         laufzeit: {jahre: 17},
                         tilgung: {
                             restschuld: 0,
                         },
                         sollzins: 2.35
                     }
                 }
                 
             },
         }
     },
     {
         title: 'Volksbank Stormarn 30 Jahre Volltilgung, 2.92 %',
         abgelehnt: true,
         bewertung: 'Schlecht',
         begruendung: 'Rate zu hoch und würde sich eh nur lohnen, wenn der Zinssatz deutlich über dem von mir erwarteten liegen würde',
         kredite: {
             "hauptkredit" : {
                 laufzeit: {jahre: 30},
                 startzeit: {monat: 7, jahr: 2015},
                 betrag: 320000,
                 sollzins: 2.92,
                 tilgung: {
                     prozentStart: 2.0876
                 }
                 
             }
         }
    
     },
     {
         title: 'Volksbank Stormarn 30 Jahre mit Restschuld und niedriger Rate, 2.92 %',
         abgelehnt: true,
         bewertung: 'Sehr Schlecht',
         begruendung: 'Restschuld führt wieder zu Unsicherheit, bei 12% wäre wieder Zwangsvollstreckung wahrscheinlich ...',
         kredite: {
             "hauptkredit" : {
                 laufzeit: {jahre: 30},
                 startzeit: {monat: 7, jahr: 2015},
                 betrag: 320000,
                 sollzins: 2.92,
                 tilgung: {
                     monatsrate: 1100
                 }
                 
             }
         },
         anschlussSzenarien: {
             'kredite': {
                 'hauptkredit': {
                     laufzeit: {
                         jahre: 15
                     }
                 }
             },
             'overrides': {
                 'anschlussEquivalent': {
                     'hauptkredit': {
                         sollzins: 2.92,
                     }
                 }
             }
         }
             
     },
     {
         title: 'Haspa Bauspar - Angebot vom 28.05.2015',
         abgelehnt: true,
         bewertung: 'Schlecht',
         begruendung: 'Sowieso schon recht hohe Raten, obwohl nur der KFW-Kredit Unsicherheit bringt, könnte das Haus nach 10 Jahren bei 12% auch ohne Tilgung nicht mehr haltbar sein (!), Rate nach 10 Jahren auch im besten Fall über 1300',
         kredite: {
             "hauptkredit" : {
                 label: "Haspa Bauspar Hypoathekendarlehen - Angebot vom 28.05.2015",
                 type: "kredit",
                 laufzeit: {jahre: 15},
                 startzeit: {monat: 6, jahr: 2015},
                 betrag: 270000,
                 sollzins: 2.25,
                 tilgung: {
                     prozentStart: 0
                 },
                 
                 abloesung: {
                     label: "Haspa Bauspar - Angebot vom 28.05.2015",
                     type: "bauspar",
                     
                     gebuehr: {
                         abschluss: 2700, 
                         jahr: 12
                     },
                     
                     betrag: 270000,
                     
                     sparphase: {
                         laufzeit: {jahre: 15},
                         monatsrate: 623,
                         zins: 0.25
                     },
                     
                     kreditphase: {
                         laufzeit: {jahre: 15},
                         tilgung: {
                             monatsrate: 1080,
                         },
                         sollzins: 2.95
                     }
                 }
             },
             "kfw": {
                 label: "Haspa Annuitätendarlehen - KFW - Angebot vom 28.05.2015",
                 laufzeit: {jahre: 10},
                 startzeit: {monat: 6},
                 betrag: 50000,
                 tilgung: {
                     prozentStart: 2.24
                 },
                 tilgungVerzögerungMonate: 12, // 'Freijahre' in den Bedingungen - in dieser Zeit wird nicht getilgt
                 sollzins: 1.55
             }
         },
         anschlussSzenarien: {
             'kredite': {
                 'kfw': {
                     laufzeit: {
                         jahre: 20
                     }
                 }
             },
             'overrides': {
                 'anschlussEquivalent': {
                     'kfw': {
                         sollzins: 1.57
                     }
                 }
             }
         }
     }
 ]
};

module.exports = {
    get: function () {
        return daten;
    }
};