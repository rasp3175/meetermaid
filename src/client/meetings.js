if (Meteor.isClient) {
    Meteor.subscribe("meetings");

    var selectPrivacy = function(value, enableElement, disableElement) {
        $('#meeting-private').val(value);
        disableElement.removeClass('btn-primary').addClass('btn-default');
        enableElement.removeClass('btn-default').addClass('btn-primary');
    };

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
            } else {
                $('#error-block').addClass('error-detected');
                if(title.length === 0) $('#error-block').addClass('empty-title');
                if(!datetime) $('#error-block').addClass('empty-datetime');
                if(!datetimeEnd) $('#error-block').addClass('empty-datetime-end');
                if(datetime && datetimeEnd && (datetimeEnd.toDate() < datetime.toDate()) )
                    $('#error-block').addClass('incorrect-datetime-range');
            }

            $('#save-meeting-dialog').modal('hide');
            $('#rateit-' + event.target['meeting-id'].value).rateit('value', $('#meeting-priority').rateit('value'));
            return false;
        },
        'click #error-block button.close': function() {
            $('#error-block').removeClass('error-detected');
            return false;
        },
        'click #delete-meeting': function() {
            Meteor.call("deleteMeeting", $('#meeting-id').val());
        },
        'click .meeting-private-title': function(event) {
            var currentValue = $('#meeting-private').val();
            var targetId = event.currentTarget.id;

            if((currentValue === '1') && (targetId !== 'meeting-private-enable'))
                selectPrivacy('0', $('#meeting-private-disable'), $('#meeting-private-enable'));
            if((currentValue === '0') && (targetId !== 'meeting-private-disable'))
                selectPrivacy('1', $('#meeting-private-enable'), $('#meeting-private-disable'));

            return false;
        }
    });

    Template.form.rendered = function() {
        $('.rateit').rateit();
    };

    var openMeetingFormDialog = function(event) {
        var getMeeting = function(_id) {
            if(_id) return Meetings.findOne({_id: _id});
            var datetimeEnd = new Date();
            datetimeEnd.setMinutes(datetimeEnd.getMinutes() + 30);

            return {
                _id: null,
                attendants: '',
                datetime: new Date(),//
                datetimeEnd: datetimeEnd,//
                description: '',
                private: 1,
                priority: 0,//
                title: ''
            };
        };

        var fillForm = function(meeting) {
            $('#meeting-id').val(meeting._id);
            $('#meeting-attendants').val(meeting.attendants);
            $('#meeting-description').val(meeting.description);
            $('#meeting-title').val(meeting.title);

            if(!$('#meeting-title').val())
                $('#meeting-title').val($('#default-meeting-title').val());

            if(meeting.private)
                selectPrivacy('0', $('#meeting-private-disable'), $('#meeting-private-enable'));
            else
                selectPrivacy('1', $('#meeting-private-enable'), $('#meeting-private-disable'));

            $('#meeting-datetime-picker').datetimepicker().data('DateTimePicker').date(meeting.datetime);
            $('#meeting-datetime-end-picker').datetimepicker().data('DateTimePicker').date(meeting.datetimeEnd);

            $('#meeting-priority').rateit('value', meeting.priority);

            if(meeting._id) {
                $('#add-meeting-title').hide();
                $('#edit-meeting-title').show();
                $('#delete-meeting').show();
            } else {
                $('#add-meeting-title').show();
                $('#edit-meeting-title').hide();
                $('#delete-meeting').hide();
            }
        };

        fillForm( getMeeting($(event.target).attr('value')) );
    };

    Template.listHeader.events({
        'click #add-meeting': openMeetingFormDialog
    });

    Template.listItem.events({
        'click .edit-meeting': openMeetingFormDialog
    });

    Template.listItem.rendered = function() {
        $('.rateit').rateit();
    };

    Template.report.rendered = function() {
        var chartData = [];

        for(var statisticsIndex in this.data.statistics) {
            var item = this.data.statistics[statisticsIndex];
            chartData.push({
                hours: item.hours.toFixed(2),
                date: moment(item.date).format('MMM DD')
            });
        }

        new Morris.Bar({
            element: 'report-chart',
            data: chartData,
            xkey: 'date',
            ykeys: ['hours'],
            labels: ['Hours']
        });
    };
}