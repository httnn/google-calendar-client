import * as React from 'react';
import * as moment from 'moment';
import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Next from '@material-ui/icons/NavigateNext';
import Prev from '@material-ui/icons/NavigateBefore';
import Today from '@material-ui/icons/Today';
import CircularProgress from '@material-ui/core/CircularProgress';
import Fade from '@material-ui/core/Fade';
import Create from '@material-ui/icons/Create';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import { Formik } from 'formik';

type Props = {
  date: Date;
  label: string;
  messages: Object;
  onNavigate(action: any, date?: any): void;
  onViewChange(view: string): void;
  view: 'month' | 'week' | 'day';
  views: Array<string>;
  classes: any;
  onCreateEvent: () => void;
  loading: boolean;
};

class CalendarToolbar extends React.PureComponent<Props> {
  state = { dateSelectorOpen: false };

  openDateSelector = () => this.setState({ dateSelectorOpen: true });

  closeDateSelector = () => this.setState({ dateSelectorOpen: false });

  jumpToDate = ({ date }) => {
    this.props.onNavigate('DATE', new Date(date));
    this.closeDateSelector();
  };

  render() {
    const {
      classes,
      date,
      onNavigate,
      label,
      onViewChange,
      views,
      view,
      loading
    } = this.props;

    return (
      <React.Fragment>
        <Grid container alignItems="center" className={classes.container}>
          <Grid item md container alignItems="center">
            <IconButton onClick={() => onNavigate('PREV')}>
              <Prev />
            </IconButton>
            <Typography
              onClick={this.openDateSelector}
              style={{
                fontFamily: 'Product Sans',
                fontSize: '1.5em',
                cursor: 'pointer'
              }}
            >
              {label}
            </Typography>
            <IconButton onClick={() => onNavigate('NEXT')}>
              <Next />
            </IconButton>
            <Tooltip title="Jump to today">
              <IconButton
                disabled={moment().isSame(moment(date), view)}
                onClick={() => onNavigate('TODAY')}
              >
                <Today />
              </IconButton>
            </Tooltip>
            <Tooltip title="Create event">
              <IconButton onClick={this.props.onCreateEvent}>
                <Create />
              </IconButton>
            </Tooltip>
            <Fade in={loading}>
              <CircularProgress size={24} color="secondary" />
            </Fade>
          </Grid>
          <Grid item>
            <Tabs value={view} onChange={(e, value) => onViewChange(value)}>
              {views.map(view => <Tab key={view} value={view} label={view} />)}
            </Tabs>
          </Grid>
        </Grid>
        <Dialog
          open={this.state.dateSelectorOpen}
          onClose={this.closeDateSelector}
        >
          <Formik
            onSubmit={this.jumpToDate}
            initialValues={{ date: date.toISOString().split('T')[0] }}
          >
            {formik => (
              <form onSubmit={formik.handleSubmit}>
                <DialogTitle>Jump to date</DialogTitle>
                <DialogContent>
                  <TextField
                    onChange={formik.handleChange}
                    value={formik.values.date}
                    type="date"
                    name="date"
                  />
                </DialogContent>
                <DialogActions>
                  <Button type="submit" color="primary">
                    Go
                  </Button>
                </DialogActions>
              </form>
            )}
          </Formik>
        </Dialog>
      </React.Fragment>
    );
  }
}

const styles = theme => ({
  container: {
    marginBottom: theme.spacing.unit * 2
  }
});

export default withStyles(styles)(CalendarToolbar);
