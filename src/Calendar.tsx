import * as React from 'react';
import * as BigCalendar from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import * as moment from 'moment';
import CircularProgress from '@material-ui/core/CircularProgress';
import Fade from '@material-ui/core/Fade';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import 'moment/locale/en-gb';

import * as storage from './storage';
import { fetchEvents, getUserEmail } from './google';
import CalendarSelector from './CalendarSelector';
import { CalendarEvent, CalendarType, NewCalendarEvent } from './types';
import CalendarEventCell from './CalendarEvent';
import { textContrast } from './utils';
import EventEditor, { EditorProps } from './EventEditor';
import CalendarToolbar from './CalendarToolbar';

moment.locale('en-gb');
BigCalendar.momentLocalizer(moment);

const styles: any = theme => ({
  root: {
    flexGrow: 1,
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    height: '100%'
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1
  },
  drawer: {
    position: 'relative',
    minWidth: 250
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    height: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column'
  },
  toolbar: theme.mixins.toolbar
});

const views = ['month', 'week', 'day'];

type Props = {
  signOut: () => void;
  classes: any;
  calendars: Array<CalendarType>;
  title: string;
  groupDelimiter: string;
};

type State = {
  events: Array<CalendarEvent>;
  filteredEvents: Array<CalendarEvent>;
  date: Date;
  loading: boolean;
  hiddenCalendarIds: Array<string>;
  editorOpen: boolean;
  eventBeingEdited?: NewCalendarEvent;
  error?: Error;
};

class Calendar extends React.PureComponent<Props, State> {
  state: State = {
    events: [],
    filteredEvents: [],
    date: new Date(),
    loading: false,
    hiddenCalendarIds: [],
    editorOpen: false
  };

  components: any = {
    event: CalendarEventCell,
    toolbar: CalendarToolbar
  };

  async fetchEvents() {
    if (!this.props.calendars.length) {
      return;
    }
    try {
      this.setState({ loading: true });
      const now = moment(this.state.date);
      const start = now
        .clone()
        .startOf('month')
        .startOf('week');
      const end = now
        .clone()
        .endOf('month')
        .endOf('week');
      const calendars = this.props.calendars.filter(
        c => this.state.hiddenCalendarIds.indexOf(c.id) === -1
      );
      const events = await fetchEvents(calendars, start, end);
      this.setState({ events, loading: false });
      this.updateFilteredEvents();
    } catch (e) {
      this.setState({ loading: false, error: e });
    }
  }

  onNavigate = date => {
    this.setState({ date }, () => this.fetchEvents());
  };

  titleAccessor = () => '';

  getEventStyle = (event: CalendarEvent) => {
    return {
      className: 'event',
      style: {
        color: textContrast(event.calendar.color),
        backgroundColor: event.calendar.color
      }
    };
  };

  selectSlot = ({ start, end }) => {
    const allDay =
      moment(start).format('HH:mm:ss') === moment(end).format('HH:mm:ss');
    this.setState({
      eventBeingEdited: {
        title: '',
        description: '',
        calendar: this.props.calendars[0],
        start,
        end: allDay
          ? moment(end)
              .add({ days: 1 })
              .toDate()
          : end,
        allDay
      },
      editorOpen: true
    });
  };

  onHiddenCalendarIdsChange = hiddenCalendarIds => {
    this.setState({ hiddenCalendarIds }, () =>
      storage.set('hidden-calendars', hiddenCalendarIds)
    );
  };

  updateFilteredEvents = () => {
    this.setState(state => ({
      filteredEvents: state.events.filter(
        event => state.hiddenCalendarIds.indexOf(event.calendar.id) === -1
      )
    }));
  };

  updateSelectedCalendars = () => {
    this.setState(
      {
        hiddenCalendarIds: storage.get('hidden-calendars', [])
      },
      () => this.fetchEvents()
    );
  };

  closeEditor: EditorProps['onClose'] = (action, event) => {
    this.setState(state => {
      let events = state.events;
      if (event) {
        events = [...events];
        if (action === 'updated' || action === 'deleted') {
          const index = events.findIndex(e => e.id === event.id);
          if (action === 'updated') {
            events[index] = event;
          } else {
            events.splice(index, 1);
          }
        } else if (action === 'created') {
          events.push(event);
        }
      }
      return { editorOpen: false, events };
    });
  };

  editEvent = (event: CalendarEvent) => {
    this.setState({ editorOpen: true, eventBeingEdited: event });
  };

  componentDidUpdate(prevProps, prevState) {
    const { events, hiddenCalendarIds } = this.state;
    if (
      prevState.events !== events ||
      prevState.hiddenCalendarIds !== hiddenCalendarIds
    ) {
      if (prevState.hiddenCalendarIds.length > hiddenCalendarIds.length) {
        this.fetchEvents();
      } else {
        this.updateFilteredEvents();
      }
    }

    if (prevProps.calendars !== this.props.calendars) {
      this.updateSelectedCalendars();
    }
  }

  componentDidMount() {
    this.updateSelectedCalendars();
  }

  render() {
    const { classes, signOut, calendars, title } = this.props;
    const { editorOpen, eventBeingEdited, error } = this.state;

    return (
      <div className={classes.root}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <Typography
              style={{ fontFamily: 'Product Sans' }}
              variant="title"
              color="inherit"
              noWrap
            >
              {title} &nbsp;
            </Typography>
            <Fade in={this.state.loading}>
              <CircularProgress size={24} color="secondary" />
            </Fade>
            <div style={{ flex: 1 }} />
            <Typography color="inherit">{getUserEmail()}</Typography>
            <Button color="inherit" onClick={signOut}>
              Log out
            </Button>
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" classes={{ paper: classes.drawer }}>
          <div className={classes.toolbar} />
          <CalendarSelector
            groupDelimiter={this.props.groupDelimiter}
            calendars={calendars}
            onHiddenCalendarIdsChange={this.onHiddenCalendarIdsChange}
            hiddenCalendarIds={this.state.hiddenCalendarIds}
          />
        </Drawer>
        <div className={classes.content}>
          <div className={classes.toolbar} />
          {error && <Typography color="error">{error.message}</Typography>}
          <BigCalendar
            selectable
            components={this.components}
            eventPropGetter={this.getEventStyle}
            events={this.state.filteredEvents}
            views={views}
            onSelectSlot={this.selectSlot}
            onSelectEvent={this.editEvent}
            step={60}
            showMultiDayTimes
            date={this.state.date}
            onNavigate={this.onNavigate}
            titleAccessor={this.titleAccessor}
          />
        </div>
        <EventEditor
          calendars={calendars}
          open={editorOpen}
          onClose={this.closeEditor}
          event={eventBeingEdited}
        />
      </div>
    );
  }
}

export default withStyles(styles)(Calendar);
