type Key = 'collapsedGroups' | 'selected-calendars';

export const set = (key: Key, value: Object) =>
  localStorage.setItem(key, JSON.stringify(value));

export const get = (key: Key, defaultValue?: Object) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || defaultValue;
  } catch (e) {
    return defaultValue;
  }
};
