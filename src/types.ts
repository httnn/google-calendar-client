export type NewCalendarEvent = {
  start: Date;
  end: Date;
  title: string;
  allDay: boolean;
  description: string;
  calendar: CalendarType;
};

export interface CalendarEvent extends NewCalendarEvent {
  id: string;
  creator: {
    displayName: string;
    email: string;
  };
  created: Date;
  updated: Date;
}

export type CalendarConfig = {
  id: string;
  color: string;
};

export enum CalendarPermissions {
  FULL,
  PARTIAL,
  NONE
}

export type CalendarType = CalendarConfig & {
  title: string;
  permissions: CalendarPermissions;
};
