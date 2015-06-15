"use strict";

var React = require("react");
var Router = require("react-router");
var Header = require("./Header");

var ReactIntl = require("react-intl");

var App = React.createClass({
    mixins: [ReactIntl.IntlMixin],

    render: function () {
        return (
          <div>
            <Header />
            <Router.RouteHandler />
          </div>
        );
    }
});

module.exports = App;
