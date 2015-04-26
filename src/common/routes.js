Router.map(function () {
    this.route('main', {
        path: '/',
        template: 'main',
        data: function () {
            var datetimeEnd = new Date();
            datetimeEnd.setMinutes(datetimeEnd.getMinutes() + 30);

            return {
                meeting: {
                    _id: null,
                    attendants: '',
                    datetime: new Date(),
                    datetimeEnd: datetimeEnd,
                    description: '',
                    private: 1,
                    priority: 0,
                    title: ''
                }
            };
        }
    });

    this.route('edit-meeting', {
        path: '/edit-meeting/:_id',
        template: 'form',
        data: function () {
            return {
                meeting: Meetings.findOne({_id: this.params._id})
            };
        }
    });

    var getMeetings = function (criteria) {
        var currentUserMeetingsCriteria = $.extend(true, {}, criteria);
        currentUserMeetingsCriteria.owner = Meteor.userId();

        var publicMeetingsCriteria = $.extend(true, {}, criteria);
        publicMeetingsCriteria.private = false;

        return Meetings.find({$or: [currentUserMeetingsCriteria, publicMeetingsCriteria]}, {sort: {datetime: -1}}).fetch();
    };

    var getMeetingsByDateRange = function(inputCriteria) {
        var criteria = {};
        if(inputCriteria.begin) criteria.$gte = inputCriteria.begin;
        if(inputCriteria.end) criteria.$lte = inputCriteria.end;
        return getMeetings({datetime: criteria});
    };

    this.route('timeline', {
        path: '/timeline',
        template: 'timeline',
        data: function() {
            return {meetings: getMeetingsByDateRange({})};
        }
    });

    this.route('today', {
        path: '/today',
        template: 'today',
        data: function() {
            var todayBegin = new Date();
            todayBegin.setHours(0, 0, 0, 0);

            var todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            return {meetings: getMeetingsByDateRange({begin: todayBegin, end: todayEnd})};
        }
    });
});