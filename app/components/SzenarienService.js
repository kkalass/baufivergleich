"use strict";

var _ = require('underscore');

var mkStdAnschlussSzenarien = function (params) {
    var laufzeiten = params.laufzeit;
    
    var overrides = params.overrides;
    
    var mkKredite = function(kreditNames, laufzeiten, overrides, config) {
        var r = {};
        kreditNames.map(function(kreditName) {
            r[kreditName] = _.defaults((laufzeiten[kreditNames] ? {laufzeit: laufzeiten[kreditNames]} : {}), (overrides?overrides[kreditName]: null) || {}, config || {});
        });
        return r;
    };
    
    
    var result= [
     {
         name: 'anschlussEquivalent',
         label: "Equivalente Anschlussfinanzierung",
         kredite: mkKredite(_.keys(laufzeiten), laufzeiten, overrides['anschlussEquivalent'], {laufzeit:{jahre: 10}, tilgung: {restschuld: 0}, sollzins: 2.00})
     },
     {
         name: 'anschlussExpected',
         label: "Erwartete Anschlussfinanzierung (5%)",
         kredite: mkKredite(_.keys(laufzeiten), laufzeiten, overrides['anschlussExpected'], {laufzeit:{jahre: 10}, tilgung: {restschuld: 0}, sollzins: 5.00})
     },
     {
         name: 'anschlussExpectedUngetilgt',
         label: "Erwartete Anschlussfinanzierung *UNGETILGT* (5%) => 30++ Jahre",
         kredite: mkKredite(_.keys(laufzeiten), laufzeiten, overrides['anschlussExpectedUngetilgt'], {laufzeit:{jahre: 10}, tilgung: {prozentStart: 0}, sollzins: 5.00})
     },
     {
         name: 'anschlussSehrSchlecht',
         label: "Sehr schlechte Anschlussfinanzierung (12%)",
         kredite: mkKredite(_.keys(laufzeiten), laufzeiten, overrides['anschlussSehrSchlecht'], {laufzeit:{jahre: 10}, tilgung: {restschuld: 0}, sollzins: 12.00})
     },
     {
         name: 'anschlussSehrSchlechtUngetilgt',
         label: "Sehr schlechte Anschlussfinanzierung *UNGETILGT* (12%) ",
         kredite: mkKredite(_.keys(laufzeiten), laufzeiten, overrides['anschlussSehrSchlechtUngetilgt'], {laufzeit:{jahre: 10}, tilgung: {prozentStart: 0}, sollzins: 12.00})
     },
     {
         name: 'anschlussNichts',
         label: "Ohne Anschlussfinanzierung (KFW Restschuld nach 10 Jahren + Restschuld nach 15 Jahren)",
         kredite: {
             'hauptkredit': null,
             'kfw': null
         }
     }
     ];
    
    console.log('Resultat: ', result);
    return result;
};

var szenarien = [

    {
        title: 'Creditweb 1200 EUR Monatsrate',
        
        hide: true,
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
        tilgungsSzenarien: [
            {
                title: 'Keine Extra-Tilgungen',
                kredite: {
                    'hauptkredit': {
                        /*
                        tilgung: {
                            monatsrate: 1200
                        }, 
                        extra: {
                            // keine Extra-Tilgung
                        },
                        */
                        anschluss: {
                            'anschlussEquivalent': {
                                // Hier kann man den Tilgungssatz des Anschlussszenarios ändern - wenn das notwendig ist für das Szenario
                                /*
                                tilgung: {
                                    prozentStart: 8.825
                                },*/
                                
                                // Auch die Extratilgungen im Anschlussszenario können gesteuert werden
                                /* 
                                extra: {
                                    // keine Extra-Tilgung
                                }
                                */
                            }
                        }
                    }
                }
            }
        ],
        
        anschlussSzenarien: mkStdAnschlussSzenarien(
            {
                laufzeit: {
                    'hauptkredit': {jahre: 10}
                },
                'overrides': {
                    'anschlussEquivalent': {
                        'hauptkredit': {
                            tilgung: {
                                prozentStart: 8.825
                            },
                            sollzins: 2.47,
                        }
                    },
                    'anschlussExpected': {
                        'hauptkredit': {
                            tilgung: {
                                prozentStart: 7.725
                            }
                        }
                    },
                    'anschlussSehrSchlecht': {
                        'hauptkredit': {
                            tilgung: {
                                prozentStart: 5.215
                            }
                        }
                    }
                }
            }
            
        )
   
    }, 
    {
        title: 'Creditweb 1280 EUR Monatsrate',
        
        hide: false,
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
        tilgungsSzenarien: [
            {
                title: 'Keine Extra-Tilgungen'
            }
        ],
        anschlussSzenarien: mkStdAnschlussSzenarien(
            {
                laufzeit: {
                    'hauptkredit': {jahre: 10}
                },
                'overrides': {
                    'anschlussEquivalent': {
                        'hauptkredit': {
                            tilgung: {
                                prozentStart: 8.825
                            },
                            sollzins: 2.47,
                        }
                    },
                    'anschlussExpected': {
                        'hauptkredit': {
                            tilgung: {
                                prozentStart: 7.725
                            }
                        }
                    },
                    'anschlussSehrSchlecht': {
                        'hauptkredit': {
                            tilgung: {
                                prozentStart: 5.215
                            }
                        }
                    }
                }
            }
            
        )
    },
    {
        title: 'Creditweb 3% Tilgung',
        bewertung: 'Schlecht',
        begruendung: 'Monatsraten mit ca. 1.450 EUR deutlich zu hoch. Vorteil: Geringe Restschuld nach 20 Jahren, selbst bei 12% problemlos',
        hide: true,
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
        tilgungsSzenarien: [
            {
                title: 'Keine Extra-Tilgungen'
            }
        ],
        anschlussSzenarien: mkStdAnschlussSzenarien(
            {
                laufzeit: {
                    'hauptkredit': {jahre: 10}
                },
                'overrides': {
                    'anschlussEquivalent': {
                        'hauptkredit': {
                            tilgung: {
                                prozentStart: 8.825
                            },
                            sollzins: 2.47,
                        }
                    },
                    'anschlussExpected': {
                        'hauptkredit': {
                            tilgung: {
                                prozentStart: 7.725
                            }
                        }
                    },
                    'anschlussSehrSchlecht': {
                        'hauptkredit': {
                            tilgung: {
                                prozentStart: 5.215
                            }
                        }
                    }
                }
            }
            
        )
   
    },
    {
        title: 'Haspa Annuitäten',
        
        hide: true,
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
                },
                erwartet: {
                    monatsrate: 956.25,
                    restschuld: 173760.75,
                    effektivzins: 2.27
                }
            },
            "kfw": { 
                label: "Haspa Annuitätendarlehen - KFW - Angebot vom 28.05.2015",
                laufzeit: {jahre: 10},
                startzeit: {monat: 6, jahr: 2015},
                betrag: 50000,
                sollzins: 1.55,
                tilgungVerzögerungMonate: 12, // 'Freijahre' in den Bedingungen - in dieser Zeit wird nicht getilgt
                tilgung: {
                    prozentStart: 2.24
                },
                
                erwartet: {
                    monatsrate: 157.92,
                    restschuld: 39190.17,
                    effektivzins: 1.56
                }
            }
        },
        tilgungsSzenarien: [
            {
                title: 'Keine Extra-Tilgungen'
                
            }
        ],
        anschlussSzenarien: mkStdAnschlussSzenarien(
            {
                laufzeit: {
                    'hauptkredit': {jahre: 15},
                    'kfw': {jahre: 20}
                },
                'overrides': {
                    'anschlussEquivalent': {
                        'kfw': {
                            tilgung: {
                                prozentStart: 4.08
                            },
                            sollzins: 1.57
                        },
                        'hauptkredit': {
                            tilgung: {
                                prozentStart: 5.566
                            },
                            sollzins: 2.47
                        }
                    },
                    'anschlussExpected': {
                        'kfw': {
                            tilgung: {
                                prozentStart: 2.796
                            }
                        },
                        'hauptkredit': {
                            tilgung: {
                                prozentStart: 4.531
                            }
                        }
                    },
                    'anschlussSehrSchlecht': {
                        'kfw': {
                            tilgung: {
                                prozentStart: 1.16
                            }
                        },
                        'hauptkredit': {
                            tilgung: {
                                prozentStart: 2.425
                            }
                        }
                    }
                }
            }
            
        )
   
    },
    {
        title: 'Experimente Nicole',
        hide: true, // temporär versteckt, ist Platzhalter für echte Alternativen
        kredite: {
            "hauptkredit" : {
                laufzeit: {jahre: 20},
                startzeit: {monat: 7, jahr: 2015},
                betrag: 326000,
                sollzins: 2.47,
                tilgung: {
                    monatsrate: 1090
                }
            }
        },
        tilgungsSzenarien: [
            {
                title: 'Keine Extra-Tilgungen'
                
            }
        ],
        anschlussSzenarien: [
             {
                 name: 'anschlussNichts',
                 label: "Ohne Anschlussfinanzierung (KFW Restschuld nach 10 Jahren + Restschuld nach 15 Jahren",
                 kredite: {
                     'hauptkredit': null
                 }
             }
        ]
   
    },
    {
        title: 'Varianten Frau Herrmann 1 - 17.06.2015',
        hide: true,
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
                },
                
                erwartet: {
                    monatsrate: 1263.25,
                    //restschuld: 153230,
                    //effektivzins: 2.50
                }
                
            }
        },
        tilgungsSzenarien: [
            {
                title: 'Keine Extra-Tilgungen'
            }
        ],
        anschlussSzenarien: mkStdAnschlussSzenarien(
            {
                laufzeit: {
                    'hauptkredit': {jahre: 15}
                },
                'overrides': {
                    'anschlussEquivalent': {
                        'hauptkredit': {
                            tilgung: {
                                prozentStart: 5.655
                            },
                            sollzins: 2.15,
                        }
                    },
                    'anschlussExpected': {
                        'hauptkredit': {
                            tilgung: {
                                prozentStart: 4.489
                            }
                        }
                    },
                    'anschlussSehrSchlecht': {
                        'hauptkredit': {
                            tilgung: {
                                prozentStart: 2.402
                            }
                        }
                    }
                }
            }
            
        )
   
    },
    {
        title: 'Volksbank Stormarn 30 Jahre Volltilgung, 2.92 %',
        hide: true,
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
        },
        tilgungsSzenarien: [
            {
                title: 'Keine Extra-Tilgungen'
            }
        ],
        anschlussSzenarien: [
             {
                 name: 'anschlussNichts',
                 label: " Anschlussfinanzierung nicht nötig, voll getilgt",
                 kredite: {
                     'hauptkredit': null
                 }
             }
        ]
   
    },
    {
        title: 'Volksbank Stormarn 30 Jahre mit Restschuld und niedriger Rate, 2.92 %',
        hide: true,
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
        tilgungsSzenarien: [
            {
                title: 'Keine Extra-Tilgungen'
            }
        ],
        anschlussSzenarien: mkStdAnschlussSzenarien(
            {
                laufzeit: {
                    'hauptkredit': {jahre: 15}
                },
                'overrides': {
                    'anschlussEquivalent': {
                        'hauptkredit': {
                            tilgung: {
                                prozentStart: 5.655
                            },
                            sollzins: 2.15,
                        }
                    },
                    'anschlussExpected': {
                        'hauptkredit': {
                            tilgung: {
                                prozentStart: 4.489
                            }
                        }
                    },
                    'anschlussSehrSchlecht': {
                        'hauptkredit': {
                            tilgung: {
                                prozentStart: 2.402
                            }
                        }
                    }
                }
            }
            
        )
   
    },
    {
        title: 'Haspa Bauspar - Angebot vom 28.05.2015',
        hide: false,
        bewertung: 'Schlecht',
        begruendung: 'Sowieso schon recht hohe Raten, obwohl nur der KFW-Kredit Unsicherheit bringt, könnte das Haus nach 10 Jahren bei 12% auch ohne Tilgung nicht mehr haltbar sein (!), Rate nach 10 Jahren über 1300',
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
                // FIXME: is this really the way to go?
                abloesung: {
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
                        tilgung: {
                            monatsrate: 1080,
                        },
                        sollzins: 2.95,
                        
                        erwartet: {
                            monatsrate: 1080,
                            restschuld: 0,
                            effektivzins: 2.31
                        }
                    }
                },
                
                erwartet: {
                    monatsrate: 506.25,
                    restschuld: 270000,
                    effektivzins: 2.31
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
                sollzins: 1.55,
                
                erwartet: {
                    monatsrate: 157.92,
                    restschuld: 39190.17,
                    effektivzins: 1.56
                }
            }
        },
        tilgungsSzenarien: [
            {
                title: 'Keine Extra-Tilgungen'
            }
        ],
        anschlussSzenarien: mkStdAnschlussSzenarien(
            {
                laufzeit: {
                    'hauptkredit': {jahre: 15},
                    'kfw': {jahre: 20}
                },
                'overrides': {
                    'anschlussEquivalent': {
                        'kfw': {
                            tilgung: {
                                prozentStart: 4.08
                            },
                            sollzins: 1.57
                        },
                        'hauptkredit': {
                            tilgung: {
                                prozentStart: 5.566
                            },
                            sollzins: 2.47
                        }
                    },
                    'anschlussExpected': {
                        'kfw': {
                            tilgung: {
                                prozentStart: 2.796
                            }
                        },
                        'hauptkredit': {
                            tilgung: {
                                prozentStart: 4.531
                            }
                        }
                    },
                    'anschlussSehrSchlecht': {
                        'kfw': {
                            tilgung: {
                                prozentStart: 1.16
                            }
                        },
                        'hauptkredit': {
                            tilgung: {
                                prozentStart: 2.425
                            }
                        }
                    }
                }
            }
            
        )
   
    }
];


module.exports = {
    getStoredScenarios: function () {
        return szenarien;
    }
};