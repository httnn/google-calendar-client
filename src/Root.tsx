import * as React from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import * as google from './google';
import Calendar from './Calendar';
import * as calendars from '../calendars.json';

export default class Root extends React.PureComponent {
  state = { signedIn: false, loading: false, calendars: [] };

  init = async () => {
    this.setState({ loading: true });
    const signedIn = await google.init();
    this.setState({ signedIn, loading: false });
  };

  signIn = async () => {
    await google.signIn();
    this.setState({ signedIn: google.isSignedIn() });
  };

  signOut = async () => {
    await google.signOut();
    this.setState({ signedIn: google.isSignedIn() });
  };

  async componentDidUpdate(prevProps, prevState) {
    if (!prevState.signedIn && this.state.signedIn) {
      this.setState({ calendars: await google.fetchCalendars(calendars) });
    }
  }

  componentDidMount() {
    this.init();
  }

  render() {
    const { signedIn, loading, calendars } = this.state;
    if (!signedIn) {
      return (
        <Grid
          style={{ height: '100%' }}
          container
          alignItems="center"
          justify="center"
        >
          <Button
            disabled={loading}
            variant="contained"
            color="primary"
            onClick={this.signIn}
          >
            {loading ? 'Loading...' : 'Sign in with Google'}
          </Button>
        </Grid>
      );
    }

    return <Calendar calendars={calendars} signOut={this.signOut} />;
  }
}
