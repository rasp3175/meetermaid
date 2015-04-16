Meetings = new Mongo.Collection("meetings");

if (Meteor.isClient) {
    Meteor.subscribe("meetings");

    Accounts.ui.config({
        passwordSignupFields: "USERNAME_ONLY"
    });

    Template.body.helpers({
        meetings: function () {
            return Meetings.find({}, {sort: {start: -1}});
        }
    });

    Template.meeting.helpers({
        isOwner: function () {
            return this.owner === Meteor.userId();
        }
    });

    Template.body.events({
        "submit .new-meeting": function (event) {
            var subject = event.target.subject.value;
            Meteor.call("addMeeting", subject);
            event.target.subject.value = "";
            return false;
        }
    });

    Template.meeting.events({
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
}

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
    addMeeting: function (subject) {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }

        Meetings.insert({
            subject: subject,
            start: new Date(),
            owner: Meteor.userId(),
            username: Meteor.user().username,
            private: true
        });
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