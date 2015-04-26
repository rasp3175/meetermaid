Router.map(function () {
    this.route('main', {
        path: '/',
        template: 'main',
        data: function () {
            return {
                meeting: {
                    _id: null,
                    attendants: '',
                    datetime: new Date(),
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

    this.route('list', {
        path: '/list',
        template: 'list',
        data: function() {
            return {
                meetings: getMeetings({})
            };
        }
    });

    this.route('today', {
        path: '/today',
        template: 'list',
        data: function() {
            var todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            var todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            return {
                meetings: getMeetings({datetime: {
                    $gte: todayStart,
                    $lte: todayEnd
                }})
            };
        }
    });
});