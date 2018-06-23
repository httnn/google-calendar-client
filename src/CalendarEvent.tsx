import * as React from 'react';
import * as moment from 'moment';
import Tooltip from './Tooltip';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { withStyles } from '@material-ui/core/styles';

import { CalendarEvent } from './types';
import { textContrast } from './utils';

const styles = theme => ({
  container: {
    margin: theme.spacing.unit,
    minWidth: '200px'
  },
  dimmed: {
    marginTop: theme.spacing.unit
  },
  description: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit,
    maxWidth: '32ch'
  },
  calendarName: {
    padding: '1px 4px',
    borderRadius: '4px'
  }
});

const formatDate = (from, to, allDay) => {
  const fromDate = moment(from);
  const toDate = moment(to);
  if (fromDate.isSame(toDate, 'day')) {
    if (allDay) {
      return fromDate.format('DD/MM/YYYY');
    }
    return fromDate.format('DD/MM/YYYY HH:mm') + ' - ' + toDate.format('HH:mm');
  }
  return (
    fromDate.format(allDay ? 'DD/MM/YYYY' : 'DD/MM/YYYY HH:mm') +
    ' - ' +
    toDate.format(allDay ? 'DD/MM/YYYY' : 'DD/MM/YYYY HH:mm')
  );
};

const EventTooltip = withStyles(styles)(
  (props: { event: CalendarEvent; classes: any }) => (
    <Card className={props.classes.container}>
      <CardContent>
        <Typography variant="subheading" style={{ fontFamily: 'Product Sans' }}>
          {props.event.title.trim() || 'No title'}
        </Typography>
        {props.event.description && (
          <Typography className={props.classes.description} variant="body1">
            {props.event.description
              .trim()
              .split('\n')
              .map((part, i) => (
                <React.Fragment key={i}>
                  {part}
                  <br />
                </React.Fragment>
              ))}
          </Typography>
        )}
        <Typography variant="caption">
          Date:{' '}
          <strong>
            {formatDate(props.event.start, props.event.end, props.event.allDay)}
          </strong>
          <br />
          Created by:&nbsp;
          <strong>
            {props.event.creator.displayName || props.event.creator.email}
          </strong>
          <br />
          Created at:{' '}
          <strong>
            {moment(props.event.created).format('DD/MM/YYYY HH:mm')}
          </strong>
          <br />
          Updated at:{' '}
          <strong>
            {moment(props.event.updated).format('DD/MM/YYYY HH:mm')}
          </strong>
        </Typography>
        <Typography className={props.classes.dimmed}>
          <span
            className={props.classes.calendarName}
            style={{
              backgroundColor: props.event.calendar.color,
              color: textContrast(props.event.calendar.color)
            }}
          >
            {props.event.calendar.title}
          </span>
        </Typography>
      </CardContent>
    </Card>
  )
);

type Props = {
  event: CalendarEvent;
};

export default ({ event }: Props) => (
  <Tooltip content={<EventTooltip event={event} />}>
    {event.title.trim() || 'No title'}
  </Tooltip>
);
