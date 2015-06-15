"use strict";

var React = require("react");
var Router = require("react-router");

var Link = Router.Link;

var BaufivergleichBackButton = React.createClass({
    mixins: [Router.Navigation],

    handleClick: function (e) {
        this.goBack();
        e.preventDefault();
    },

    render: function () {
        return (
          <div className="navbar-header ">
            <a href="#" onClick={this.handleClick} className="navbar-brand">
              Baufivergleich
            </a>
          </div>
        );
    }
});

var Header = React.createClass({
    
    render: function () {
        return (
          <nav className="navbar navbar-default"><div className="container-fluid">
            <BaufivergleichBackButton />
            <ul className="shoppingCartLink navbar-nav nav navbar-right">
              <li>
                Test
              </li>
            </ul>
          </div></nav>
        );
    }
});

module.exports = Header;
