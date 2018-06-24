export interface NewCalendarEvent {
  start: Date;
  end: Date;
  title: string;
  allDay: boolean;
  description: string;
  calendar: CalendarType;
}

export interface CalendarEvent extends NewCalendarEvent {
  id: string;
  creator: {
    displayName: string;
    email: string;
  };
  created: Date;
  updated: Date;
}

export interface CalendarConfig {
  id: string;
  color: string; // in hex
}

export enum CalendarPermissions {
  FULL,
  PARTIAL,
  NONE
}

export interface CalendarType extends CalendarConfig {
  title: string;
  permissions: CalendarPermissions;
}

export interface Config {
  calendars: Array<CalendarConfig>;
  title: string;
}
