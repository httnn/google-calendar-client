import * as React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Collapse from '@material-ui/core/Collapse';
import { CalendarType, CalendarPermissions } from './types';
import * as storage from './storage';

type Props = {
  calendars: Array<CalendarType>;
  onHiddenCalendarIdsChange(calendarIds: Array<string>): void;
  hiddenCalendarIds: Array<string>;
  groupDelimiter: string;
};

type State = {
  collapsedGroups: Array<string>;
};

type CalendarGroup = {
  title: string;
  group: true;
  collapsed: boolean;
  items: Array<CalendarType | CalendarGroup>;
};

export default class CalendarSelector extends React.PureComponent<
  Props,
  State
> {
  state = {
    collapsedGroups: storage.get('collapsedGroups', [])
  };

  toggle = (calendar: CalendarType) => {
    const { onHiddenCalendarIdsChange, hiddenCalendarIds } = this.props;
    if (hiddenCalendarIds.indexOf(calendar.id) === -1) {
      onHiddenCalendarIdsChange([...hiddenCalendarIds, calendar.id]);
    } else {
      onHiddenCalendarIdsChange(
        hiddenCalendarIds.filter(id => id !== calendar.id)
      );
    }
  };

  groupCalendars = () => {
    const output: Array<CalendarType | CalendarGroup> = [];
    const splitRegExp = new RegExp(this.props.groupDelimiter, 'g');
    const calendars = this.props.calendars.filter(
      c => c.permissions !== CalendarPermissions.NONE
    );
    for (const calendar of calendars) {
      const groupTitles = calendar.title.split(splitRegExp);
      const calendarTitle = groupTitles.pop();
      let group = output;
      for (const groupTitle of groupTitles) {
        const existingGroup = group.find(
          g => 'group' in g && g.title === groupTitle
        );
        if (existingGroup && 'group' in existingGroup) {
          group = existingGroup.items;
        } else {
          const newGroup: CalendarGroup = {
            title: groupTitle,
            group: true,
            items: [],
            collapsed: this.state.collapsedGroups.indexOf(groupTitle) > -1
          };
          group.push(newGroup);
          group = newGroup.items;
        }
      }
      group.push({ ...calendar, title: calendarTitle });
    }
    return output;
  };

  toggleGroupCollapsed = (groupTitle: string) => {
    this.setState(state => {
      const index = state.collapsedGroups.indexOf(groupTitle);
      const collapsedGroups = [...state.collapsedGroups];
      if (index > -1) {
        collapsedGroups.splice(index, 1);
      } else {
        collapsedGroups.push(groupTitle);
      }
      storage.set('collapsedGroups', collapsedGroups);
      return { collapsedGroups };
    });
  };

  getGroupCalendars = (group: CalendarGroup): Array<CalendarType> => {
    let calendars = [];
    for (const item of group.items) {
      if ('group' in item) {
        calendars = calendars.concat(this.getGroupCalendars(item));
      } else {
        calendars.push(item);
      }
    }
    return calendars;
  };

  isCalendarSelected = (calendar: CalendarType) =>
    this.props.hiddenCalendarIds.indexOf(calendar.id) === -1;

  changeGroupSelection = (group: CalendarGroup, selectAll: boolean) => {
    const { onHiddenCalendarIdsChange, hiddenCalendarIds } = this.props;
    const calendarIds = this.getGroupCalendars(group).map(cal => cal.id);
    if (selectAll) {
      onHiddenCalendarIdsChange([]);
    } else {
      onHiddenCalendarIdsChange(
        Array.from(new Set([...hiddenCalendarIds, ...calendarIds]))
      );
    }
  };

  renderItems = (items: Array<CalendarType | CalendarGroup>, indent = 0) => {
    const indentStyle = { paddingLeft: 14 + indent * 14 };
    return items.map(item => {
      if ('group' in item) {
        const calendars = this.getGroupCalendars(item);
        const areAllSelected = calendars.every(this.isCalendarSelected);
        const isOneSelected = calendars.some(this.isCalendarSelected);
        return (
          <React.Fragment key={item.title}>
            <ListItem
              button
              style={indentStyle}
              onClick={() => this.toggleGroupCollapsed(item.title)}
            >
              {!item.collapsed ? <ExpandLess /> : <ExpandMore />}
              <ListItemText primary={item.title} />
              <ListItemSecondaryAction>
                <Checkbox
                  onClick={() =>
                    this.changeGroupSelection(item, !areAllSelected)
                  }
                  checked={areAllSelected}
                  indeterminate={!areAllSelected && isOneSelected}
                  tabIndex={-1}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Collapse in={!item.collapsed} timeout="auto" unmountOnExit>
              {this.renderItems(item.items, indent + 1)}
            </Collapse>
          </React.Fragment>
        );
      } else {
        return (
          <ListItem
            style={indentStyle}
            onClick={() => this.toggle(item)}
            button
            key={item.id}
          >
            <ListItemText>
              <span
                className="color-badge"
                style={{ backgroundColor: item.color }}
              />
              {item.title}
            </ListItemText>
            <ListItemSecondaryAction>
              <Checkbox
                checked={this.isCalendarSelected(item)}
                onClick={() => this.toggle(item)}
                tabIndex={-1}
              />
            </ListItemSecondaryAction>
          </ListItem>
        );
      }
    });
  };

  render() {
    return <List>{this.renderItems(this.groupCalendars())}</List>;
  }
}
