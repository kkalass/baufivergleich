/* @flow */
"use strict";

var React = require("react");
var AppComponent = require("./components/App");
var StartPage = require("./components/StartPage");

var Router = require("react-router");
var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;

var ReactIntl = require("react-intl");

/* global lang */
var i18n_data = require("./i18n/messages-" + lang);
var formats = {
    number: {
        eur: { style: "currency",  currency: "EUR" }
    }
};

var routes = (
  <Route name="app" path="/" handler={AppComponent}>
    <DefaultRoute handler={StartPage} />
    
  </Route>
);

Router.run(routes, function (Handler) {
    React.render(<Handler locales={i18n_data.locales} messages={i18n_data.messages} formats={formats} />,
                 document.getElementById("app"));
});
