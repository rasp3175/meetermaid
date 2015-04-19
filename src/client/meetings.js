if (Meteor.isClient) {
    Meteor.subscribe("meetings");
//---------------navigation-----------------------
    Template.navigation.isCurrentUri = function(uri) {
        return Iron.Location.get().path === uri;
    };
    Template.navigation.events({
        "click .nav li": function (event) {
            $('.nav li').removeClass('active');
            $(event.currentTarget).addClass('active');
        },
        "click #logout-link": function () {
            Meteor.logout(function() {
                Router.go('/');
            });
        }
    });
//----------------form-----------------------------
    Template.form.helpers({
        private: true
    });

    Template.form.events({
        "submit form": function (event) {
            Meteor.call("addMeeting", {
                datetime: $('#datetimepicker').data("DateTimePicker").date().toDate(),
                description: event.target['meeting-description'].value,
                private: parseInt(event.target['meeting-private'].value),
                priority: $('#meeting-priority').rateit('value'),
                title: event.target['meeting-title'].value
            });

            Router.go('/list');
            return false;
        },
        'click .meeting-private-title': function(event) {
            var currentValue = $('#meeting-private').val();
            var targetId = event.currentTarget.id;

            var selectPrivacy = function(value, enableElement, disableElement) {
                $('#meeting-private').val(value);
                disableElement.removeClass('btn-primary').addClass('btn-default');
                enableElement.removeClass('btn-default').addClass('btn-primary');
            };

            if((currentValue === '1') && (targetId !== 'meeting-private-enable'))
                selectPrivacy('0', $('#meeting-private-disable'), $('#meeting-private-enable'));
            if((currentValue === '0') && (targetId !== 'meeting-private-disable'))
                selectPrivacy('1', $('#meeting-private-enable'), $('#meeting-private-disable'));

            return false;
        }
    });
}