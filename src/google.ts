import * as moment from 'moment';
import {
  CalendarConfig,
  CalendarType,
  CalendarEvent,
  NewCalendarEvent,
  CalendarPermissions
} from './types';

declare const gapi: any;
declare const googleClientId: string;
declare const googleApiKey: string;

class FetchError extends Error {
  response: any;
  constructor(message, response) {
    super(message);
    this.response = response;
  }
}

const discoveryDocs = [
  'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'
];
const scope = 'https://www.googleapis.com/auth/calendar';

export const init = () =>
  new Promise((resolve, reject) => {
    gapi.load('client:auth2', async () => {
      await gapi.client.init({
        apiKey: googleApiKey,
        clientId: googleClientId,
        discoveryDocs,
        scope
      });
      resolve(gapi.auth2.getAuthInstance().isSignedIn.get());
    });
  });

export const signIn = () => gapi.auth2.getAuthInstance().signIn();

export const signOut = () => gapi.auth2.getAuthInstance().signOut();

export const isSignedIn = () => gapi.auth2.getAuthInstance().isSignedIn.get();

export const getUserEmail = () =>
  gapi.auth2
    .getAuthInstance()
    .currentUser.get()
    .getBasicProfile()
    .getEmail();

export const fetchEvents = async (
  calendars: Array<CalendarType>,
  min: moment.Moment,
  max: moment.Moment
): Promise<Array<CalendarEvent>> => {
  let calendarIdsWithPageTokens = calendars
    .filter(c => c.permissions !== CalendarPermissions.NONE)
    .map(c => ({ id: c.id, pageToken: null }));
  let events = [];
  do {
    const batch = gapi.client.newBatch();
    for (const calendar of calendarIdsWithPageTokens) {
      batch.add(
        gapi.client.calendar.events.list({
          calendarId: calendar.id,
          showDeleted: false,
          singleEvents: true,
          timeMin: min.toISOString(),
          timeMax: max.toISOString(),
          maxResults: 2500,
          pageToken: calendar.pageToken
        }),
        { id: calendar.id }
      );
    }
    const response = await batch;
    calendarIdsWithPageTokens = [];
    for (const calendarId in response.result) {
      const { error, result } = response.result[calendarId];
      if (error) {
        throw new FetchError('Error while fetching events', error);
      }
      if (result.nextPageToken) {
        calendarIdsWithPageTokens.push({
          id: calendarId,
          pageToken: result.nextPageToken
        });
      }
      events = events.concat(result.items);
    }
  } while (calendarIdsWithPageTokens.some(calendar => !!calendar.pageToken));

  return events.map(event => fromGoogleFormat(event, calendars));
};

export const fetchCalendars = async (
  calendars: Array<CalendarConfig>
): Promise<Array<CalendarType>> => {
  const batch = gapi.client.newBatch();
  for (const calendar of calendars) {
    batch.add(gapi.client.calendar.calendars.get({ calendarId: calendar.id }));
  }
  const response = await batch;
  return Object.keys(response.result)
    .map((key, i) => {
      const item = response.result[key];
      if (item.status === 200) {
        return {
          ...calendars.find(c => c.id === item.result.id),
          title: item.result.summary,
          permissions: CalendarPermissions.FULL
        };
      }
      return {
        color: '#eee',
        id: String(i),
        title: 'Not found / no access',
        permissions: CalendarPermissions.NONE
      };
    })
    .sort((a, b) => (a.title > b.title ? 1 : -1));
};

export const fromGoogleFormat = (
  event: any,
  calendars: Array<CalendarType>
): CalendarEvent => {
  const calendar = calendars.find(cal => event.organizer.email === cal.id) || {
    title: 'external',
    id: event.organizer.email,
    color: '#444',
    permissions: CalendarPermissions.PARTIAL
  };

  return {
    id: event.id,
    start: moment(event.start.dateTime || event.start.date)
      .utc()
      .toDate(),
    end: moment(event.end.dateTime || event.end.date)
      .utc()
      .toDate(),
    title: event.summary,
    description: event.description,
    allDay: !!event.start.date,
    calendar,
    creator: event.creator,
    created: event.created,
    updated: event.updated
  };
};

export const toGoogleFormat = (event: CalendarEvent | NewCalendarEvent) => ({
  eventId: 'id' in event ? event.id : undefined,
  calendarId: event.calendar.id,
  summary: event.title,
  description: event.description,
  start: event.allDay
    ? { date: moment(event.start).format('YYYY-MM-DD') }
    : { dateTime: event.start },
  end: event.allDay
    ? { date: moment(event.end).format('YYYY-MM-DD') }
    : { dateTime: event.end }
});

export const updateEvent = async (
  event: CalendarEvent,
  calendars: Array<CalendarType>
) => {
  const response = await gapi.client.calendar.events.update(
    toGoogleFormat(event)
  );
  return fromGoogleFormat(response.result, calendars);
};

export const createEvent = async (
  event: NewCalendarEvent,
  calendars: Array<CalendarType>
) => {
  const response = await gapi.client.calendar.events.insert(
    toGoogleFormat(event)
  );
  return fromGoogleFormat(response.result, calendars);
};

export const deleteEvent = async (event: CalendarEvent) => {
  await gapi.client.calendar.events.delete({
    eventId: event.id,
    calendarId: event.calendar.id
  });
};
