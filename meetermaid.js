Meetings = new Mongo.Collection("Meetings");

if (Meteor.isClient) {

	if(!Session.get('showPage')){
		Session.setDefault('showPage', "today");
	}
	
	Accounts.ui.config({
		// Enables accounts with usernames only
		passwordSignupFields: "USERNAME_ONLY"
	});

	Meteor.subscribe("meetings");
	// This code only runs on the client
	Template.body.helpers({
		meetings: function () {
		    // Show newest tasks first
		    return Meetings.find({}, {sort: {start: -1}});
		}
	});
	
	//helpers start
	Template.meeting.helpers({
		isOwner: function () {
		    return this.owner === Meteor.userId();
		},
		showtimeline : function(){
			if(Session.get("showPage") == 'timeline'){
				return true;
			} else {
				return false;
			}
	
		},
		timelinedata : function(){
			//dummy data for display
			//this would be the list of meetings received from the meeting collection
			var data1 = [{
				title : "some new title",
			  	date_time : moment.utc("2015-02-02").format("LL"),
			  	meeting_notes: "Some meeting notes here",
				is_private: true,
				stars:3
			},
			{
				title : "some new title2",
			  	date_time : moment.utc("2015-02-02").format("LL"),
			  	meeting_notes: "Some meeting notes here2",
				is_private: true,
				stars:3
			},
			{
				title : "some new title3",
			  	date_time : moment.utc("2015-02-02").format("LL"),
			  	meeting_notes: "Some meeting notes here3",
				is_private: false,
				stars:3
			},
		
			];
			/*
			//function filter_meeting(json_data, field, value){
			    for(var i = 0 ; i< data1.length; i++){
				var obj = components[i];
				var arr = obj["is_private"];
				for(var j = 0; j<arr.length;j++ ){
				    if(arr[j] == "true"){
					return obj;
				    }
				}
			    }
			//} */
			console.log(data1);
			return data1;
		}
	});

	Template.MeetingsForm.helpers({
		showtoday : function(){
			if(Session.get("showPage") == 'today'){
				return true;
			} else {
				return false;
			}
		}
	});

	Template.about.helpers({
		showabout : function(){
			if(Session.get("showPage") == 'about'){
				return true;
			} else {
				return false;
			}
		}
	});
	
	//helpers ends
	
	//events starts
	Template.body.events({
	"submit .MeetingsForm": function (event) {
		event.preventDefault();
	    // This function is called when the new task form is submitted
		ins_data = {
		    mt_title : event.target.title.value,
		    mt_stars : event.target.stars.value
		};

	    //steps pending : validate email
	    //console.log("User id is "+Meteor.userId());
	    //Meteor.call("addMeeting", ins_data);



	    // Clear form
	    event.target.subject.value = "";

	    // Prevent default form submit
	    return false;
	},
	"click .today" : function(){
		Session.set("showPage", "today");
	},
	"click .timeline" : function(){
		Session.set("showPage", "timeline");
	},
	"click .about" : function(){
		Session.set("showPage", "about");
	}
	});

    
	
	Template.meeting.events({

	"click .toggle-checked": function () {
	    // Set the checked property to the opposite of its current value
	    Meteor.call("setChecked", this._id, !this.checked);
	},
	"click .delete": function () {
	    Meteor.call("deleteMeeting", this._id);
	},
	"click .toggle-private": function () {
	    Meteor.call("setPrivate", this._id, !this.private);
	}
	});
	
	//events ends
}

if (Meteor.isServer) {

    // Only publish meetings that are public or belong to the current user
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
    addMeeting: function (ins_data) {
        // Make sure the user is logged in before inserting a task
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        } else {
	//Meetings.insert({subject: 'subjuecs to insert'});
        Meetings.insert({
            subject: ins_data.mt_title,
	    stars : ins_data.mt_stars,
            start: new Date(), // current time //change date from form
            owner: Meteor.userId(), // _id of logged in user
            username: Meteor.user().username, // username of logged in user
            private: ins_data.mt_private // set private by default
        });
	console.log(Meetings.find().fetch());
	}	
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

        Meetings.update(meetingId, {$set: {private: setToPrivate}});
    }
});

Meetings.attachSchema(new SimpleSchema({
  title: {
    type: String,
    max: 60
  },
  date_time: {
    type: Date,
    optional: true,
    label: "Date and time of meeting",
    min: new Date(),
    autoform: {
         value: new Date()
      }
  },
  meeting_notes: {
    type: String,
    autoform: {rows: 5},
    label: "Meeting notes"
  },
  is_private: {
    type: Boolean,
    label: "Private",
  },
  stars: {
    type: Number,
    min: 1,
    max: 5
  }
}));



