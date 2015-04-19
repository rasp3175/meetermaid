if (Meteor.isClient) {
    Accounts.ui.config({
        passwordSignupFields: "USERNAME_ONLY"
    });

    UI.registerHelper("formatDate", function (dateTime, dateFormat) {
        return moment(dateTime).format(dateFormat);
    });
}