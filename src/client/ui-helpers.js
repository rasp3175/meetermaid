if (Meteor.isClient) {
    UI.registerHelper("formatDate", function (dateTime, dateFormat) {
        return moment(dateTime).format(dateFormat);
    });

    UI.registerHelper("roundNumber", function (number, digits) {
        var coefficient = 1;
        for(var digit = 0; digit < digits; digit++)
            coefficient *= 10;

        return Math.round(number * coefficient) / coefficient;
    });
}