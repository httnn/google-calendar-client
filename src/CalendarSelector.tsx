import * as React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import { CalendarType, CalendarPermissions } from './types';

type Props = {
  calendars: Array<CalendarType>;
  onSelectionChange(calendarIds: Array<string>): void;
  selectedIds: Array<string>;
};

export default class CalendarSelector extends React.PureComponent<Props> {
  toggle = (calendar: CalendarType) => {
    const { onSelectionChange, selectedIds } = this.props;
    if (this.props.selectedIds.indexOf(calendar.id) === -1) {
      onSelectionChange([...selectedIds, calendar.id]);
    } else {
      onSelectionChange(selectedIds.filter(id => id !== calendar.id));
    }
  };

  render() {
    const { calendars, selectedIds } = this.props;
    return (
      <List>
        {calendars
          .filter(c => c.permissions !== CalendarPermissions.NONE)
          .map(calendar => (
            <ListItem
              onClick={() => this.toggle(calendar)}
              button
              key={calendar.id}
            >
              <ListItemText>
                <span
                  className="color-badge"
                  style={{ backgroundColor: calendar.color }}
                />
                {calendar.title}
              </ListItemText>
              <ListItemSecondaryAction>
                <Checkbox
                  checked={selectedIds.indexOf(calendar.id) !== -1}
                  tabIndex={-1}
                  disableRipple
                />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
      </List>
    );
  }
}
