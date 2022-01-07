import React from 'react';

import { Icon } from 'semantic-ui-react';

import {
  navigation,
  Table,
  TableHeaderCell,
  TableHeader,
  TableRow,
  TableRowCell
} from 'nr1';

const getAlertColor = alertHighest => {
  switch (alertHighest) {
    case 'NOT_ALERTING': {
      return 'green';
    }
    case 'WARNING': {
      return 'orange';
    }
    case 'CRITICAL': {
      return 'red';
    }
  }

  return 'grey';
};

export default class EntityTable extends React.PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      column: 0,
      sortingType: TableHeaderCell.SORTING_TYPE.NONE
    };
  }

  onClickTableHeaderCell = (column, { nextSortingType }) => {
    if (column === this.state.column) {
      this.setState({ sortingType: nextSortingType });
    } else {
      this.setState({ column, sortingType: nextSortingType });
    }
  };

  render() {
    const { popupData, updateMapState } = this.props;
    const { properties } = popupData;
    const { column, sortingType } = this.state;

    const entities = [
      { ...properties },
      ...(properties.relatedEntities?.results || []).map(
        ({ target }) => target.entity
      )
    ].filter(e => e);

    return (
      <Table
        items={entities || []}
        onSelect={(e, { item }) => (item.selected = e.target.checked)}
      >
        <TableHeader>
          <TableHeaderCell
            value={({ item }) => item.alertSeverity || 'UNCONFIGURED'}
            width="fit-content"
            alignmentType={TableRowCell.ALIGNMENT_TYPE.LEFT}
            sortable
            sortingType={
              column === 0 ? sortingType : TableHeaderCell.SORTING_TYPE.NONE
            }
            onClick={(event, data) => this.onClickTableHeaderCell(0, data)}
          />
          <TableHeaderCell
            value={({ item }) => item.name}
            alignmentType={TableRowCell.ALIGNMENT_TYPE.LEFT}
            sortable
            sortingType={
              column === 1 ? sortingType : TableHeaderCell.SORTING_TYPE.NONE
            }
            onClick={(event, data) => this.onClickTableHeaderCell(1, data)}
          >
            Name
          </TableHeaderCell>
          <TableHeaderCell
            value={({ item }) => item.entityType}
            sortable
            sortingType={
              column === 2 ? sortingType : TableHeaderCell.SORTING_TYPE.NONE
            }
            onClick={(event, data) => this.onClickTableHeaderCell(2, data)}
          >
            Type
          </TableHeaderCell>
        </TableHeader>

        {({ item }) => {
          return (
            <TableRow
              onClick={() => {
                updateMapState({ modalHidden: true });
                navigation.openStackedEntity(item.guid);
              }}
            >
              <TableRowCell>
                <Icon color={getAlertColor(item.alertSeverity)} name="circle" />
              </TableRowCell>
              <TableRowCell>{item.name}</TableRowCell>
              <TableRowCell>{item.entityType}</TableRowCell>
            </TableRow>
          );
        }}
      </Table>
    );
  }
}
