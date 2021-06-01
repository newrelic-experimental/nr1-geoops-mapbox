import React from 'react';

import orderBy from 'lodash.orderby';
import { Grid, Icon, Input, Table } from 'semantic-ui-react';

export default class MapLocationTable extends React.PureComponent {
  state = {
    searchTerm: ''
  };

  componentDidMount = () => {
    document
      .getElementById('locations-table')
      .addEventListener('scroll', function() {
        const translate = `translate(0, ${this.scrollTop}px)`;
        this.querySelector('thead').style.transform = translate;
      });
  };

  componentDidUpdate = newProps => {
    if (newProps.data && newProps.data.length !== this.props.data.length) {
      document
        .getElementById('locations-table')
        .scroll({ top: 0, behavior: 'smooth' });
    }
  };

  filterData = data =>
    data.filter(location => {
      const { searchTerm } = this.state;
      if (
        (location.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return true;
      }

      if (
        (location.state || '').toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return true;
      }

      if (
        (location?.location?.description || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      ) {
        return true;
      }

      if (
        (location?.location?.state || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      ) {
        return true;
      }

      return false;
    });

  scrollTableToTop = () => {
    document
      .getElementById('locations-table')
      .scroll({ top: 0, behavior: 'smooth' });
  };

  sortData = data =>
    orderBy(data, [this.state.filterKey], [this.state.filterDirection]);

  sortTable = filterKey => {
    let filterDirection = 'asc';
    if (filterKey === this.state.filterKey) {
      filterDirection = this.state.filterDirection === 'asc' ? 'desc' : 'asc';
    }
    this.setState({ filterKey, filterDirection });
    document
      .getElementById('locations-table')
      .scroll({ top: 0, behavior: 'smooth' });
  };

  getIconStatusColor = alertLevel => {
    let color = 'black';
    switch (alertLevel) {
      case 1: // not alerting
        color = 'green';
        break;
      case 2: // warning
        color = 'orange';
        break;
      case 3: // critical
        color = 'red';
        break;
    }
    return color;
  };

  render = () => {
    const { data, rowClickHandler } = this.props;
    const { searchTerm } = this.state;
    const sortedData = this.sortData(this.filterData(data));

    return (
      <Grid.Row stretched={false} columns={1}>
        <Grid.Column floated="right">
          <Input
            icon={{
              name: searchTerm ? 'close' : 'search',
              circular: true,
              link: true,
              onClick: () =>
                this.setState({ searchTerm: '' }, this.scrollTableToTop)
            }}
            placeholder="Search..."
            value={searchTerm}
            onChange={e =>
              this.setState(
                { searchTerm: e.target.value },
                this.scrollTableToTop
              )
            }
            fluid
            style={{ marginBottom: '-1px' }}
          />
        </Grid.Column>
        <Grid.Column>
          <div
            id="locations-table"
            style={{ maxHeight: '90vh', overflowX: 'auto' }}
          >
            <Table>
              <Table.Header fullWidth>
                <Table.Row>
                  <Table.HeaderCell
                    style={{ cursor: 'pointer' }}
                    onClick={() => this.sortTable('highestAlertLevel')}
                  >
                    &nbsp;
                  </Table.HeaderCell>
                  <Table.HeaderCell
                    style={{ cursor: 'pointer' }}
                    onClick={() => this.sortTable('name')}
                  >
                    Name
                  </Table.HeaderCell>
                  <Table.HeaderCell
                    style={{ cursor: 'pointer' }}
                    onClick={() => this.sortTable('location.state')}
                  >
                    State
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {sortedData.length ? (
                  sortedData.map((location, li) => (
                    <Table.Row
                      style={{ cursor: 'pointer' }}
                      key={li}
                      onClick={() => rowClickHandler(location)}
                    >
                      <Table.Cell>
                        <Icon
                          name="circle"
                          color={this.getIconStatusColor(location.alertLevel)}
                        />
                      </Table.Cell>
                      <Table.Cell>{location.name}</Table.Cell>
                      <Table.Cell>{location.location.state}</Table.Cell>
                    </Table.Row>
                  ))
                ) : (
                  <Table.Row>
                    <Table.Cell>
                      <p>Nothing Found...</p>
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </div>
        </Grid.Column>
      </Grid.Row>
    );
  };
}
