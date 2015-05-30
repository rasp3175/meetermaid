Router.map(function () {
    this.route('welcome', {
        path: '/',
        template: 'welcome'
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
            var todayBegin = new Date();
            todayBegin.setHours(0, 0, 0, 0);

            var todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            var tomorrowBegin = new Date(todayBegin);
            tomorrowBegin.setDate(tomorrowBegin.getDate() + 1);

            var now = new Date();
            var weekBegin = new Date( now.setDate(now.getDate() - now.getDay() + (now.getDay() == 0 ? -6 : 1)) );
            weekBegin.setHours(0, 0, 0, 0);

            var lastWeekEnd = new Date(weekBegin);
            lastWeekEnd.setMilliseconds(lastWeekEnd.getMilliseconds() - 1);

            var yesterdayEnd = new Date(todayEnd);
            yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

            return {
                upcoming: getMeetingsByDateRange({begin: tomorrowBegin}),
                today: getMeetingsByDateRange({begin: todayBegin, end: todayEnd}),
                week: getMeetingsByDateRange({begin: weekBegin, end: yesterdayEnd}),
                older: getMeetingsByDateRange({end: lastWeekEnd})
            };
        }
    });

    this.route('weekly-report', {
        path: '/weekly-report',
        template: 'weeklyReport',
        data: function() {
            var statistics = [];

            var getOwnMeetings = function(dateBegin, dateEnd) {
                var beginMeetingCriteria = {owner: Meteor.userId()};
                var endMeetingCriteria = $.extend(true, {}, beginMeetingCriteria);
                var dateCriteria = {
                    $gte: dateBegin,
                    $lte: dateEnd
                };

                beginMeetingCriteria.datetime = dateCriteria;
                endMeetingCriteria.datetimeEnd = dateCriteria;
                return Meetings.find({$or: [beginMeetingCriteria, endMeetingCriteria]}).fetch();
            };

            var getMeetingDayDuration = function(meetingBegin, meetingEnd, dayBegin, dayEnd) {
                return Math.min(meetingEnd.getTime(), dayEnd.getTime()) - Math.max(meetingBegin.getTime(), dayBegin.getTime());
            };

            var getTotalMeetingHours = function(date) {
                var dateBegin = new Date(date);
                dateBegin.setHours(0, 0, 0, 0);

                var dateEnd = new Date(date);
                dateEnd.setHours(23, 59, 59, 999);

                var meetings = getOwnMeetings(dateBegin, dateEnd);
                var milliseconds = 0;

                for(var meetingIndex in meetings) {
                    var meeting = meetings[meetingIndex];
                    milliseconds += getMeetingDayDuration(meeting.datetime, meeting.datetimeEnd, dateBegin, dateEnd);
                }

                return milliseconds / 1000 / 3600;
            };

            var today = new Date();
            today.setHours(0, 0, 0, 0);

            var firstMeeting = Meetings.findOne({owner: Meteor.userId()}, {sort: {datetime: 1}});
            var firstDay = firstMeeting.datetime ? firstMeeting.datetime : today;

            firstDay.setHours(0, 0, 0, 0);
            var date = new Date(firstDay);

            while(date.getTime() < today.getTime()) {
                statistics.push({
                    hours: getTotalMeetingHours(date),
                    date: new Date(date)
                });
                date.setDate(date.getDate() + 1);
            }

            return {
                statistics: statistics,
                period: {
                    begin: firstDay,
                    end: today
                }
            };
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

Router.onBeforeAction(function() {
    if (!Meteor.user()) {
        this.render('welcome');
    } else {
        this.next();
    }
}, {except: ['welcome']});