import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Popper from 'popper.js';

interface Props {
  children?: React.ReactNode;
  content?: React.ReactNode;
}

interface State {
  visible: boolean;
  ref?: HTMLElement;
}

const container = document.createElement('div');
container.classList.add('tooltip');
document.body.appendChild(container);

export default class Tooltip extends React.PureComponent<Props, State> {
  state: State = { visible: false };
  popper: any;

  onMouseOver = () => {
    if (this.state.ref) {
      this.popper = new Popper(this.state.ref, container);
      this.setState({ visible: true });
    }
  };

  onMouseLeave = () => {
    this.popper.destroy();
    this.setState({ visible: false });
  };

  setRef = ref => this.setState({ ref });

  render() {
    return (
      <div
        ref={this.setRef}
        onMouseOver={this.onMouseOver}
        onMouseLeave={this.onMouseLeave}
      >
        {this.props.children}
        {this.state.visible &&
          ReactDOM.createPortal(this.props.content, container)}
      </div>
    );
  }
}
