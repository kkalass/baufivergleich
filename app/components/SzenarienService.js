"use strict";

var _ = require('underscore');

var szenarien = [
                 
    {
        title: 'Creditweb',
        kredite: {
            "hauptkredit" : {
                label: "Creditweb - focus.de rechner 16.06.2015",
                laufzeit: {jahre: 20},
                startzeit: {monat: 7, jahr: 2015},
                betrag: 317000,
                sollzins: 2.47,
                // man könnte hier schon einen gemeinsamen Tilgungssatz angeben, wenn sich die Szenarien nur durch extra tilgung Unterscheiden
                /*
                tilgung: {
                    prozentStart: 2.00
                } 
                */
            }
        },
        tilgungsSzenarien: [
            {
                title: '1200 EUR, keine Extra-Tilgungen',
                kredite: {
                    'hauptkredit': {
                        tilgung: {
                            monatsrate: 1200
                        }, 
                        extra: {
                            // keine Extra-Tilgung
                        },
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
            },
            {
                title: '1300 EUR, keine Extra-Tilgungen',
                kredite: {
                    'hauptkredit': {
                        tilgung: {
                            monatsrate: 1300
                        }
                    }
                }
            },
            {
                title: '3%, keine Extra-Tilgungen',
                hide: true,
                kredite: {
                    'hauptkredit': {
                        tilgung: {
                            prozentStart: 3.00
                        }
                    }
                }
            }
        ],
        anschlussSzenarien: [
             {
                 name: 'anschlussEquivalent',
                 label: "Equivalente Anschlussfinanzierung (2.47%) => 30 Jahre",
                 kredite: {
                     'hauptkredit': {
                         laufzeit: {jahre: 10},
                         
                         tilgung: {
                             //restschuld: 0
                             prozentStart: 8.825
                         },
                         sollzins: 2.47,
                     }
                 }
             },
             {
                 name: 'anschlussExpected',
                 label: "Erwartete Anschlussfinanzierung (5%) => 30 Jahre",
                 kredite: {
                     'hauptkredit': {
                         laufzeit: {jahre: 10},
                         tilgung: {
                             //restschuld: 0
                             prozentStart: 7.725
                         },
                         sollzins: 5.00,
                     }
                 }
             },
             {
                 name: 'anschlussExpectedUngetilgt',
                 label: "Erwartete Anschlussfinanzierung *UNGETILGT* (5%) => 30++ Jahre",
                 kredite: {
                     'hauptkredit': {
                         laufzeit: {jahre: 10},
                         tilgung: {
                             prozentStart: 0
                         },
                         sollzins: 5.00,
                     }
                 }
             },
             {
                 name: 'anschlussSehrSchlecht',
                 label: "Sehr schlechte Anschlussfinanzierung (12%) => 30 Jahre",
                 kredite: {
                     'hauptkredit': {
                         laufzeit: {jahre: 10},
                         tilgung: {
                             //restschuld: 0
                             prozentStart: 5.215
                         },
                         sollzins: 12.00,
                     }
                 }
             },
             {
                 name: 'anschlussSehrSchlechtUngetilgt',
                 label: "Sehr schlechte Anschlussfinanzierung *UNGETILGT* (12%) => 30++ Jahre",
                 kredite: {
                     'hauptkredit': {
                         laufzeit: {jahre: 10},
                         tilgung: {
                             prozentStart: 0
                         },
                         sollzins: 12.00,
                     }
                 }
             },
             {
                 name: 'anschlussNichts',
                 label: "Ohne Anschlussfinanzierung (Restschuld nach 20 Jahren)",
                 kredite: {
                     'hauptkredit': null
                 }
             }
        ]
   
    }, 
    {
        title: 'Haspa Annuitäten',
        hide: true,
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
        anschlussSzenarien: [
             {
                 name: 'anschlussNichts',
                 label: "Ohne Anschlussfinanzierung (KFW Restschuld nach 10 Jahren + Restschuld nach 15 Jahren",
                 kredite: {
                     'hauptkredit': null,
                     'kfw': null
                 }
             }
        ]
   
    },
    {
        title: 'Varianten Nicole',
        hide: true,
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
        hide: false,
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
        anschlussSzenarien: [
             {
                 name: 'anschlussEquivalent',
                 label: "Equivalente Anschlussfinanzierung (2.15%) => 30 Jahre",
                 kredite: {
                     'hauptkredit': {
                         laufzeit: {jahre: 15},
                         
                         tilgung: {
                             //restschuld: 0
                             prozentStart: 5.655
                         },
                         sollzins: 2.15,
                     }
                 }
             },
             {
                 name: 'anschlussExpected',
                 label: "Erwartete Anschlussfinanzierung (5%) => 30 Jahre",
                 kredite: {
                     'hauptkredit': {
                         laufzeit: {jahre: 15},
                         tilgung: {
                             //restschuld: 0
                             prozentStart: 4.489
                         },
                         sollzins: 5.00,
                     }
                 }
             },
             {
                 name: 'anschlussExpectedUngetilgt',
                 label: "Erwartete Anschlussfinanzierung *UNGETILGT* (5%) => 30++ Jahre",
                 kredite: {
                     'hauptkredit': {
                         laufzeit: {jahre: 15},
                         tilgung: {
                             prozentStart: 0
                         },
                         sollzins: 5.00,
                     }
                 }
             },
             {
                 name: 'anschlussSehrSchlecht',
                 label: "Sehr schlechte Anschlussfinanzierung (12%) => 30 Jahre",
                 kredite: {
                     'hauptkredit': {
                         laufzeit: {jahre: 15},
                         tilgung: {
                             //restschuld: 0
                             prozentStart: 2.402
                         },
                         sollzins: 12.00,
                     }
                 }
             },
             {
                 name: 'anschlussSehrSchlechtUngetilgt',
                 label: "Sehr schlechte Anschlussfinanzierung *UNGETILGT* (12%) => 30++ Jahre",
                 kredite: {
                     'hauptkredit': {
                         laufzeit: {jahre: 15},
                         tilgung: {
                             prozentStart: 0
                         },
                         sollzins: 12.00,
                     }
                 }
             },
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
        title: 'Haspa Bauspar - Angebot vom 28.05.2015',
        hide: false,
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
        anschlussSzenarien: [
             {
                 name: 'anschlussEquivalent',
                 label: "Equivalente KFW Anschlussfinanzierung (1.57%) => 30 Jahre",
                 kredite: {
                     'kfw': {
                         laufzeit: {jahre: 20},
                         
                         tilgung: {
                             //restschuld: 0
                             prozentStart: 4.08
                         },
                         sollzins: 1.57,
                     }
                 }
             },
             {
                 name: 'anschlussExpected',
                 label: "Erwartete KFW Anschlussfinanzierung (5%) => 30 Jahre",
                 kredite: {
                     'kfw': {
                         laufzeit: {jahre: 20},
                         tilgung: {
                             //restschuld: 0
                             prozentStart: 2.796
                         },
                         sollzins: 5.00,
                     }
                 }
             },
             {
                 name: 'anschlussExpectedUngetilgt',
                 label: "Erwartete KFW Anschlussfinanzierung *UNGETILGT* (5%) => 30++ Jahre",
                 kredite: {
                     'kfw': {
                         laufzeit: {jahre: 20},
                         tilgung: {
                             prozentStart: 0
                         },
                         sollzins: 5.00,
                     }
                 }
             },
             {
                 name: 'anschlussSehrSchlecht',
                 label: "Sehr schlechte KFW Anschlussfinanzierung (12%) => 30 Jahre",
                 kredite: {
                     'kfw': {
                         laufzeit: {jahre: 20},
                         tilgung: {
                             //restschuld: 0
                             prozentStart: 1.16
                         },
                         sollzins: 12.00,
                     }
                 }
             },
             {
                 name: 'anschlussSehrSchlechtUngetilgt',
                 label: "Sehr schlechte KFW Anschlussfinanzierung *UNGETILGT* (12%) => 30++ Jahre",
                 kredite: {
                     'kfw': {
                         laufzeit: {jahre: 20},
                         tilgung: {
                             prozentStart: 0
                         },
                         sollzins: 12.00,
                     }
                 }
             },
             {
                 name: 'anschlussNichts',
                 label: "Ohne Anschlussfinanzierung (KFW Restschuld nach 10 Jahren)",
                 kredite: {
                     'kfw': null
                 }
             }
        ]
   
    }
];


module.exports = {
    getStoredScenarios: function () {
        return szenarien;
    }
};