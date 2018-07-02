declare var require: any;

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { BrowserRouter } from 'react-router-dom';
import { MemoryRouter } from 'react-router';

import * as google from './google';
import App from './App';
import { Config } from './types';
const config: Config = require('../config.json');

document.title = config.title;

export default class Root extends React.Component {
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
      this.setState({
        calendars: await google.fetchCalendars(config.calendars)
      });
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

    return (
      <App
        groupDelimiter={config.groupDelimiter}
        title={config.title}
        calendars={calendars}
        signOut={this.signOut}
      />
    );
  }
}

const Router = config.useRouter ? BrowserRouter : MemoryRouter;

ReactDOM.render(
  <Router>
    <Root />
  </Router>,
  document.querySelector('main')
);
