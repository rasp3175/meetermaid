Meetings = new Mongo.Collection("meetings");

if (Meteor.isClient) {
    Meteor.subscribe("meetings");
    // This code only runs on the client
    Template.body.helpers({
        meetings: function() {
            // Show newest tasks first
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
            // This function is called when the new task form is submitted
            var subject = event.target.subject.value;
            
            Meteor.call("addMeeting", subject);

            // Clear form
            event.target.subject.value = "";
            
            // Prevent default form submit
            return false;
      }
    });
  
    Accounts.ui.config({
        // Enables accounts with usernames only
        passwordSignupFields: "USERNAME_ONLY"
    });

    Template.meeting.events({
  "click .toggle-checked": function () {
    // Set the checked property to the opposite of its current value
    Meteor.call("setChecked", this._id, ! this.checked);
  },
  "click .delete": function () {
    Meteor.call("deleteMeeting", this._id);
  },
  "click .toggle-private": function () {
  Meteor.call("setPrivate", this._id, ! this.private);
}
});
}

if (Meteor.isServer) {
    // Only publish meetings that are public or belong to the current user
    Meteor.publish("meetings", function () {
        return Meetings.find({
            $or: [
            { private: {$ne: true} },
            { owner: this.userId }
            ]
        });
    });
}

Meteor.methods({
  addMeeting: function (subject) {
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

      Meetings.insert({
              subject: subject,
              start: new Date(), // current time
              owner: Meteor.userId(), // _id of logged in user
              username: Meteor.user().username,  // username of logged in user
              private: true // set private by default
      });
  },
  deleteMeeting: function (meetingId) {
      var meeting = Meetings.findOne(meetingId);
        if (meeting.private && meeting.owner !== Meteor.userId()) {
            // If the meeting is private, make sure only the owner can delete it
            throw new Meteor.Error("not-authorized");
        }
  },
  setChecked: function (meetingId, setChecked) {
      var meeting = Meetings.findOne(meetingId);
      if (meeting.private && meeting.owner !== Meteor.userId()) {
          // If the meeting is private, make sure only the owner can check it off
          throw new Meteor.Error("not-authorized");
      }  
  },
  setPrivate: function (meetingId, setToPrivate) {
  var meeting = Meetings.findOne(meetingId);

  // Make sure only the task owner can make a task private
  if (meeting.owner !== Meteor.userId()) {
    throw new Meteor.Error("not-authorized");
  }

  Meetings.update(meetingId, { $set: { private: setToPrivate } });
}
});