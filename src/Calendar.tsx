import * as React from 'react';
import * as BigCalendar from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import * as moment from 'moment';
import 'moment/locale/en-gb';

import { CalendarEvent } from './types';
import CalendarEventCell from './CalendarEvent';
import { textContrast } from './utils';
import 'moment/locale/en-gb';

moment.locale('en-gb');
BigCalendar.momentLocalizer(moment);

const views = ['month', 'week', 'day'];

type Props = {
  toolbar: any;
  onDateChange(Date): void;
  events: Array<CalendarEvent>;
  onSelect(params: { start: Date; end: Date; allDay: boolean }): void;
  onEventClick(event: CalendarEvent): void;
  date: Date;
  view: string;
  onViewChange(view: string): void;
};

class Calendar extends React.PureComponent<Props> {
  getEventStyle = (event: CalendarEvent) => {
    return {
      className: 'event',
      style: {
        color: textContrast(event.calendar.color),
        backgroundColor: event.calendar.color
      }
    };
  };

  onNavigate = date => {
    this.props.onDateChange(date);
  };

  selectSlot = ({ start, end }) => {
    const allDay =
      moment(start).format('HH:mm:ss') === moment(end).format('HH:mm:ss');
    this.props.onSelect({
      start,
      end: allDay
        ? moment(end)
            .add({ days: 1 })
            .toDate()
        : end,
      allDay
    });
  };

  editEvent = (event: CalendarEvent) => {
    this.props.onEventClick(event);
  };

  titleAccessor = () => '';

  render() {
    return (
      <BigCalendar
        selectable
        components={{
          event: CalendarEventCell,
          toolbar: this.props.toolbar
        }}
        eventPropGetter={this.getEventStyle}
        events={this.props.events}
        views={views}
        onSelectSlot={this.selectSlot}
        onSelectEvent={this.editEvent}
        step={60}
        showMultiDayTimes
        date={this.props.date}
        onView={this.props.onViewChange}
        view={this.props.view || 'month'}
        onNavigate={this.onNavigate}
        titleAccessor={this.titleAccessor}
      />
    );
  }
}

export default Calendar;
