if (Meteor.isClient) {
    Template.navigation.isCurrentUri = function (uri) {
        return Iron.Location.get().path === uri;
    };

    Template.navigation.events({
        "click .nav li": function (event) {
            $('.nav li').removeClass('active');
            $(event.currentTarget).addClass('active');
        },
        "click #logout-link": function () {
            Meteor.logout(function () {
                Router.go('/');
            });
        }
    });
}