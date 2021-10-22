# Google Calendar Client

Pure-frontend client for Google Calendar with customisable calendars.

![Screenshot](https://i.imgur.com/NxxFR9R.png)

## Features

- Define calendars that are displayed, with custom colors
- Deeply nested calendar groups
- Create, edit and delete events
- Toggle visibility of calendars (persisted locally)

## Get it running

1.  Acquire a Google client ID and API key as described here: https://developers.google.com/calendar/quickstart/js
2.  Define acquired keys in environment as `GOOGLE_CLIENT_ID` and `GOOGLE_API_KEY`. `.env` file is supported.
3.  Create a file at the root level called `config.json`. The type of the contents should be like [this](https://github.com/bodyflex/google-calendar-client/blob/master/src/types.ts#L36-L39). `config.sample.json` serves as a starting point.
4.  Run `yarn install` and `yarn start`.

## How grouping works

Groups are formed automatically from calendar names with respect to the `groupDelimiter` string defined in config. Groups can be nested without a limit on group depth, although the UI might become a bit cluttered at some point.

## TODO

- [x] more configuration options (branding)
- [x] calendar groups
- [x] optional routing via URL
- [ ] optimise fetching events when toggling calendars without changing the view
- [ ] tests
- [ ] mobile-friendlier layout
- [ ] search for events
