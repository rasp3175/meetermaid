if (Meteor.isClient) {
    Meteor.subscribe("meetings");

    Template.form.events({
        "submit form": function (event) {
            var title = event.target['meeting-title'].value.trim();
            var datetime = $('#meeting-datetime-picker').data("DateTimePicker").date();
            var datetimeEnd = $('#meeting-datetime-end-picker').data("DateTimePicker").date();

            $('#error-block').removeClass('error-detected empty-title empty-datetime');
            if( (title.length > 0) && datetime && datetimeEnd && (datetimeEnd.toDate() >= datetime.toDate()) ) {
                Meteor.call("saveMeeting", {
                    _id: event.target['meeting-id'].value,
                    attendants: event.target['meeting-attendants'].value,
                    datetime: datetime.toDate(),
                    datetimeEnd: datetimeEnd ? datetimeEnd.toDate() : null,
                    description: event.target['meeting-description'].value,
                    private: parseInt(event.target['meeting-private'].value),
                    priority: $('#meeting-priority').rateit('value'),
                    title: title
                });

                Router.go('/timeline');
            } else {
                $('#error-block').addClass('error-detected');
                if(title.length === 0) $('#error-block').addClass('empty-title');
                if(!datetime) $('#error-block').addClass('empty-datetime');
                if(!datetimeEnd) $('#error-block').addClass('empty-datetime-end');
                if(datetime && datetimeEnd && (datetimeEnd.toDate() < datetime.toDate()) )
                    $('#error-block').addClass('incorrect-datetime-range');
            }

            return false;
        },
        'click #error-block button.close': function() {
            $('#error-block').removeClass('error-detected');
            return false;
        },
        'click #delete-meeting': function() {
            Meteor.call("deleteMeeting", $('#meeting-id').val());
            Router.go('/timeline');
        },
        'click .meeting-private-title': function(event) {
            var currentValue = $('#meeting-private').val();
            var targetId = event.currentTarget.id;

            var selectPrivacy = function(value, enableElement, disableElement) {
                $('#meeting-private').val(value);
                disableElement.removeClass('btn-primary').addClass('btn-default');
                enableElement.removeClass('btn-default').addClass('btn-primary');
            };

            if((currentValue === '1') && (targetId !== 'meeting-private-enable'))
                selectPrivacy('0', $('#meeting-private-disable'), $('#meeting-private-enable'));
            if((currentValue === '0') && (targetId !== 'meeting-private-disable'))
                selectPrivacy('1', $('#meeting-private-enable'), $('#meeting-private-disable'));

            return false;
        }
    });

    Template.form.rendered = function() {
        $('#meeting-datetime-picker').datetimepicker().data('DateTimePicker').date(this.data.meeting.datetime);
        $('#meeting-datetime-end-picker').datetimepicker().data('DateTimePicker').date(this.data.meeting.datetimeEnd);
        $('.rateit').rateit();
    };

    Template.weeklyReport.helpers({
        getLoadLevel: function(hours) {
            return hours <= 3 ? 'bg-success' : (hours >= 6 ? 'bg-danger' : 'bg-warning');
        },
        getBarWidth: function(hours) {
            return hours / 24 * 40;
        }
    });
}