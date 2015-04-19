Meetings = new Mongo.Collection("meetings");

Meteor.methods({
    saveMeeting: function(meeting) {
        Meteor.call(meeting._id ? 'updateMeeting' : 'addMeeting', meeting);
    },
    addMeeting: function (meeting) {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }

        delete meeting._id;
        meeting.owner = Meteor.userId();
        meeting.username = Meteor.user().username;

        Meetings.insert(meeting);
    },
    updateMeeting: function (meeting) {
        var foundMeeting = Meetings.findOne(meeting._id);

        if (foundMeeting.owner !== Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }

        Meetings.update(meeting._id, {$set: meeting});
    }
});