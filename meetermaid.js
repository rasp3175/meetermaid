Meetings = new Mongo.Collection("meetings");

if (Meteor.isClient) {
    Meteor.subscribe("meetings");

    Accounts.ui.config({
        passwordSignupFields: "USERNAME_ONLY"
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

            event.target['meeting-description'].value = "";
            event.target['meeting-datetime'].value = "";
            event.target['meeting-title'].value = "";
            event.target['meeting-private'].value = "1";
            $('#meeting-priority').rateit('reset');

            return false;
        },
        'click #meeting-private-title': function () {
            if ($('#meeting-private').val() === '1') {
                $('#meeting-private').val(0);
                $('#meeting-private-title').removeClass('btn-primary').addClass('btn-default').html('Public');
            } else {
                $('#meeting-private').val(1);
                $('#meeting-private-title').removeClass('btn-default').addClass('btn-primary').html('Private');
            }
        }
    });
    //----------------list-------------------------
    Template.list.helpers({
        meetings: function () {
            return Meetings.find({}, {
                sort: {
                    start: -1
                }
            });
        }
    });
    //-----------------list item-------------------------
    Template.list.events({
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
                {
                    private: {
                        $ne: true
                    }
                },
                {
                    owner: this.userId
                }
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
    setPrivate: function (meetingId, setToPrivate) {
        var meeting = Meetings.findOne(meetingId);

        if (meeting.owner !== Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }

        Meetings.update(meetingId, {
            $set: {
                private: setToPrivate
            }
        });
    }
});