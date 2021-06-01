import React from 'react';

import {
  Table,
  TableHeaderCell,
  TableHeader,
  TableRow,
  TableRowCell
} from 'nr1';

export default class MetadataTable extends React.PureComponent {
  render() {
    const { popupData } = this.props;
    const { properties } = popupData;

    const metadata = [];

    const excludeKeys = [
      'index',
      'entities',
      'workloadStatus',
      'alertHighest',
      'recentAlertViolations',
      'alertLevel',
      'name'
    ];

    // console.log({ properties });

    JSON.stringify({ properties });

    Object.keys(properties).forEach(key => {
      if (!excludeKeys.includes(key)) {
        if (key === 'location') {
          Object.keys(properties[key]).forEach(l => {
            metadata.push({ name: l, value: properties[key][l] });
          });
        } else if (key === 'tags') {
          properties[key].forEach(tag => {
            metadata.push({
              name: `tags.${tag.key}`,
              value: (tag.values || []).join(' ;')
            });
          });
        } else {
          const value = JSON.stringify(properties[key]);

          metadata.push({ name: key, value });
        }
      }
    });

    return (
      <Table
        items={metadata || []}
        onSelect={({ target }, { item }) => (item.selected = target.checked)}
      >
        <TableHeader>
          <TableHeaderCell
            value={({ item }) => item.name}
            width="fit-content"
            alignmentType={TableRowCell.ALIGNMENT_TYPE.LEFT}
          >
            Name
          </TableHeaderCell>
          <TableHeaderCell value={({ item }) => item.value}>
            Value
          </TableHeaderCell>
        </TableHeader>

        {({ item }) => (
          <TableRow>
            <TableRowCell>{item.name}</TableRowCell>
            <TableRowCell>{item.value}</TableRowCell>
          </TableRow>
        )}
      </Table>
    );
  }
}
