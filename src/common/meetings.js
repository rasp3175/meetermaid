Meetings = new Mongo.Collection("meetings");

Meteor.methods({
    saveMeeting: function(meeting) {
        Meteor.call(meeting._id ? 'updateMeeting' : 'addMeeting', meeting);
    },
    deleteMeeting: function (meetingId) {
        var meeting = Meetings.findOne({_id: meetingId});
        if(meeting.owner !== Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }

        Meetings.remove(meeting);
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
        var id = meeting._id;
        delete meeting._id;
        var foundMeeting = Meetings.findOne(id);

        if (foundMeeting.owner !== Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }

        Meetings.update(id, {$set: meeting});
    }
});