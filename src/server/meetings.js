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