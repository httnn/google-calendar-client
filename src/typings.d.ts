import { CalendarConfig } from './types';

declare module '*.json' {
  const value: Array<CalendarConfig>;
  export default value;
}
