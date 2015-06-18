"use strict";

var React = require("react");
var _ = require("underscore");
var ReactIntl = require("react-intl");
var FormattedMessage = ReactIntl.FormattedMessage;
var Math2 = require("./math2");

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
                memo[i] = Math2.runden(memo[i] + monatsrate.value);
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
    return (<table >{combinedMonatsraten.map(function(monatsrate) {
        return (<tr><td>{monatsrate.monthStart}</td><td>&nbsp;-&nbsp;</td><td>{monatsrate.monthEnd}</td><td>:&nbsp;</td><td><FormattedMessage message="{total, number, eur}" total={monatsrate.value} /></td></tr>);
    })}</table>);
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

<DataRow title="Getilgt" variants={this.props.data} formatter={PriceFormat} value={function(variant) {return variant.result.getilgt;}}/>
 */    
    render: function () {
    return (
            <table className="angebote">
                <DataRow title="Anschlussszenario" className="title" variants={this.props.data} value={function(variant) {return variant.input.terms.label;}}/>
                <DataRow title="Kreditbetrag" variants={this.props.data} formatter={PriceFormat} value={function(variant) {return variant.result.betrag;}}/>
                <DataRow className="emphazise" title="Monatsrate" variants={this.props.data} formatter={MonatsratenFormat} value={function(variant) {return variant.result.monatsraten;}}/>
                <DataRow title="Restschuld" variants={this.props.data} formatter={PriceFormat} value={function(variant) {return variant.result.restschuld;}}/>
                
                
                
                <DataRow title="Kosten (absolut)" variants={this.props.data} formatter={PriceFormat} value={function(variant) {return variant.result.kosten;}}/>
                <DataRow  title="Kosten (% vom getilgten)" variants={this.props.data} value={function(variant) {return variant.result.kostenProzentGetilgt + " %";}}/>
            </table>
          
    );
    }
});
module.exports = Angebotstabelle;
