Meetings = new Mongo.Collection("meetings");

Meteor.methods({
    addMeeting: function (meeting) {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }

        meeting.owner = Meteor.userId();
        meeting.username = Meteor.user().username;
        Meetings.insert(meeting);
    },
    setPrivate: function (meetingId, setToPrivate) {
        var meeting = Meetings.findOne(meetingId);

        if (meeting.owner !== Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }

        Meetings.update(meetingId, {$set: {private: setToPrivate}});
    }
});