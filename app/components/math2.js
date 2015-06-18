"use strict";
var runden = function (number) {
    return parseFloat(number.toFixed(2))
};
var runden0 = function (number) {
    return parseFloat(number.toFixed(0))
};

module.exports = {runden: runden};
