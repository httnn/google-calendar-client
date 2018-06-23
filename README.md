# Google Calendar Client

Pure-frontend client for Google Calendar with customisable calendars.

## Get it running

1. Acquire a Google client ID and API key as described here: https://developers.google.com/calendar/quickstart/js
2. Define acquired keys in environment as `GOOGLE_CLIENT_ID` and `GOOGLE_API_KEY`. `.env` file is supported.
3. Create a file at the root level called `calendars.json`. The type of the contents should be `Array<{ id: string, color: string}>` where `id` is the Google Calendar ID and `color` is a hex color prefixed with #.
4. Run `yarn install` and `yarn start`.
