var React = require("react/addons");

var ReactIntl = require("react-intl");

var i18n_data = require("../app/i18n/messages-en");
var formats = {
    number: {
        eur: { style: "currency",  currency: "EUR" }
    }
};

var Wrapper = React.createClass({
    mixins: [ReactIntl.IntlMixin],

    render: function () {
        return React.Children.only(this.props.children);
    }
});

function renderWithIntlContext(func) {
    return React.withContext({locales: i18n_data.locales, messages: i18n_data.messages, formats: formats}, function () {
        return React.addons.TestUtils.renderIntoDocument(React.createElement(Wrapper, {locales: i18n_data.locales, messages: i18n_data.messages, formats: formats}, func()));
    });
}

module.exports = renderWithIntlContext;
