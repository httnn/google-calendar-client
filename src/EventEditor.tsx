import * as React from 'react';
import * as moment from 'moment';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import { CalendarEvent, CalendarType, NewCalendarEvent } from './types';
import { Formik, FormikProps } from 'formik';
import { updateEvent, createEvent, deleteEvent } from './google';

export type EditorProps = {
  open: boolean;
  onClose(
    action?: 'created' | 'updated' | 'deleted',
    event?: CalendarEvent
  ): void;
  event?: NewCalendarEvent | CalendarEvent;
  calendars: Array<CalendarType>;
};

const formatDate = (date: Date, allDay: boolean) =>
  moment(date).format(
    allDay ? moment.HTML5_FMT.DATE : moment.HTML5_FMT.DATETIME_LOCAL
  );

export default class EventEditor extends React.PureComponent<EditorProps> {
  submit = async (values, { setSubmitting, setStatus }) => {
    try {
      if ('id' in this.props.event) {
        const event = await updateEvent(
          { ...this.props.event, ...values },
          this.props.calendars
        );
        this.props.onClose('updated', event);
      } else {
        const event = await createEvent(values, this.props.calendars);
        this.props.onClose('created', event);
      }
      setSubmitting(false);
    } catch (e) {
      console.error(e);
      setSubmitting(false);
      setStatus(e);
    }
  };

  close = () => this.props.onClose();

  delete = async () => {
    if ('id' in this.props.event && confirm('Are you sure?')) {
      await deleteEvent(this.props.event);
      this.props.onClose('deleted', this.props.event);
    }
  };

  renderForm = ({
    values,
    handleChange,
    handleBlur,
    handleSubmit,
    handleReset,
    isSubmitting,
    dirty,
    status
  }: FormikProps<CalendarEvent>) => {
    const { open, event, calendars } = this.props;
    const editing = 'id' in event;
    return (
      <Dialog open={open} maxWidth="sm" fullWidth onClose={this.close}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editing ? 'Edit event' : 'Create event'}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="normal"
              label="Title"
              type="text"
              name="title"
              value={values.title}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              fullWidth
            />
            <TextField
              margin="normal"
              label="Description"
              name="description"
              value={values.description}
              onChange={handleChange}
              onBlur={handleBlur}
              multiline
              fullWidth
            />
            <Grid container spacing={16}>
              <Grid item md>
                <TextField
                  margin="normal"
                  label="Start time"
                  name="start"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={formatDate(values.start, values.allDay)}
                  type={values.allDay ? 'date' : 'datetime-local'}
                  fullWidth
                />
              </Grid>
              <Grid item md>
                <TextField
                  margin="normal"
                  label="End time"
                  name="end"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={formatDate(values.end, values.allDay)}
                  type={values.allDay ? 'date' : 'datetime-local'}
                  fullWidth
                />
              </Grid>
            </Grid>
            <FormControlLabel
              control={
                <Checkbox
                  name="allDay"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  checked={values.allDay}
                  type="checkbox"
                />
              }
              label="All day"
            />
            <TextField
              margin="normal"
              label="Calendar"
              name="calendar.id"
              onChange={handleChange}
              onBlur={handleBlur}
              select
              fullWidth
              value={values.calendar.id}
            >
              {calendars.map(calendar => (
                <MenuItem key={calendar.id} value={calendar.id}>
                  {calendar.title}
                </MenuItem>
              ))}
            </TextField>
            {status && (
              <Typography color="error">
                Error: {status.result.error.message}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Grid container>
              <Grid item>
                {editing && (
                  <Button
                    onClick={this.delete}
                    color="secondary"
                    variant="raised"
                  >
                    Delete
                  </Button>
                )}
                <Button
                  disabled={isSubmitting || !dirty}
                  onClick={handleReset}
                  type="reset"
                >
                  Reset
                </Button>
              </Grid>
              <Grid item md />
              <Grid item>
                <Button onClick={this.close}>Cancel</Button>
                <Button
                  color="primary"
                  variant="raised"
                  disabled={isSubmitting || !dirty}
                  type="submit"
                >
                  {editing ? 'Save' : 'Create'}
                </Button>
              </Grid>
            </Grid>
          </DialogActions>
        </form>
      </Dialog>
    );
  };

  render() {
    if (!this.props.event) {
      return null;
    }
    return (
      <Formik
        enableReinitialize
        initialValues={this.props.event}
        onSubmit={this.submit}
        render={this.renderForm}
      />
    );
  }
}
