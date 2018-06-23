export const set = (key: string, value: Object) =>
  localStorage.setItem(key, JSON.stringify(value));

export const get = (key: string, defaultValue?: Object) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || defaultValue;
  } catch (e) {
    return defaultValue;
  }
};
