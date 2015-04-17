Meetings = new Mongo.Collection("meetings");
//++++++++++++++++++++routing++++++++++++++++++++++
Router.configure({
    layoutTemplate: 'layout'
});

Router.route('/', function () {
    this.render('main');
});

Router.route('/list', function () {
    this.render('list');
});

Router.route('/today', function () {
    this.render('list');
});
//++++++++++++++++++++front end++++++++++++++++++++++
if (Meteor.isClient) {
    Meteor.subscribe("meetings");

    Accounts.ui.config({
        passwordSignupFields: "USERNAME_ONLY"
    });
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
//----------------list-------------------------
    Template.list.helpers({
        meetings: function () {
            return Meetings.find({}, {sort: {start: -1}});
        }
    });
//-----------------list item-------------------------
    Template.listItem.events({
        "click .toggle-checked": function () {
            Meteor.call("setChecked", this._id, !this.checked);
        },
        "click .delete": function () {
            Meteor.call("deleteMeeting", this._id);
        },
        "click .toggle-private": function () {
            Meteor.call("setPrivate", this._id, !this.private);
        }
    });

    Template.listItem.helpers({
        isOwner: function () {
            return this.owner === Meteor.userId();
        }
    });
}
//+++++++++++++++++++++++++Back End++++++++++++++++++++++++++++++++
if (Meteor.isServer) {
    Meteor.publish("meetings", function () {
        return Meetings.find({
            $or: [
                {private: {$ne: true}},
                {owner: this.userId}
            ]
        });
    });
}

Meteor.methods({
    addMeeting: function (meeting) {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }

        meeting.owner = Meteor.userId();
        meeting.username = Meteor.user().username;
        Meetings.insert(meeting);
    },
    deleteMeeting: function (meetingId) {
        var meeting = Meetings.findOne(meetingId);
        if (meeting.private && meeting.owner !== Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
    },
    setChecked: function (meetingId) {
        var meeting = Meetings.findOne(meetingId);
        if (meeting.private && meeting.owner !== Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
    },
    setPrivate: function (meetingId, setToPrivate) {
        var meeting = Meetings.findOne(meetingId);

        if (meeting.owner !== Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }

        Meetings.update(meetingId, {$set: {private: setToPrivate}});
    }
});