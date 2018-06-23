import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Next from '@material-ui/icons/NavigateNext';
import Prev from '@material-ui/icons/NavigateBefore';

type Props = {
  date: Date;
  label: string;
  messages: Object;
  onNavigate(action: any, date?: any): void;
  onViewChange(view: string): void;
  view: string;
  views: Array<string>;
};

const CalendarToolbar = (props: Props) => (
  <Grid container alignItems="center" style={{ marginBottom: '1ch' }}>
    <Grid item md container alignItems="center">
      <IconButton onClick={() => props.onNavigate('PREV')}>
        <Prev />
      </IconButton>
      <Typography style={{ fontFamily: 'Product Sans', fontSize: '1.5em' }}>
        {props.label}
      </Typography>
      <IconButton onClick={() => props.onNavigate('NEXT')}>
        <Next />
      </IconButton>
    </Grid>
    <Grid item>
      <Tabs
        value={props.view}
        onChange={(e, value) => props.onViewChange(value)}
      >
        {props.views.map(view => <Tab key={view} value={view} label={view} />)}
      </Tabs>
    </Grid>
  </Grid>
);

export default CalendarToolbar;
