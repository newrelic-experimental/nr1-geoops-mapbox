import React from 'react';
import { Menu, Icon } from 'semantic-ui-react';
import { HeadingText, LineChart, BillboardChart } from 'nr1';
import EntityTable from './entity-table';
import MetadataTable from './metadata-table';
import RecentViolations from './recent-violations';

function groupBy(objectArray, property) {
  return (objectArray || []).reduce((acc, obj) => {
    const key = obj[property];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {});
}

export default class ModalContent extends React.PureComponent {
  state = { activeItem: 'Entity Summary' };

  handleItemClick = (e, { name: activeItem }) => this.setState({ activeItem });

  renderChart = (accountId, guids, q, name) => {
    let finalNrql = q.nrql;

    if (q.filterEntities && guids.length > 0) {
      finalNrql += ` WHERE entityGuid IN ('${guids.join("','")}')`;
    }

    finalNrql.replaceAll('${name}', name); //eslint-disable-line

    switch (q.chart) {
      case 'billboard': {
        return <BillboardChart accountId={accountId} query={finalNrql} />;
      }
      case 'line': {
        return <LineChart accountId={accountId} query={finalNrql} />;
      }
      default: {
        return 'Unsupported chart type';
      }
    }
  };

  render() {
    const { activeItem } = this.state;
    const { popupData, updateMapState, queries, accountId } = this.props;
    const { properties } = popupData;

    if (!properties) {
      return <div>No Content</div>;
    }

    const guids = [
      properties.guid,
      ...(properties?.relationships || []).map(t => t.target.guid)
    ];

    const { alertHighest } = properties;
    let alertColor = '';

    switch (alertHighest) {
      case 'NOT_ALERTING':
        alertColor = 'green';
        break;
      case 'WARNING':
        alertColor = 'orange';
        break;
      case 'CRITICAL':
        alertColor = 'red';
        break;
      default:
        alertColor = 'grey';
    }

    const groupedQueries = groupBy(queries, 'category');
    const topQueries = [...(groupedQueries.top || [])];
    // const bottomQueries = [...(groupedQueries.bottom || [])];

    delete groupedQueries.top;
    delete groupedQueries.bottom;

    const initialQueries = {};
    const remainingQueries = {};

    Object.keys(groupedQueries).forEach(key => {
      if (key.startsWith('0.')) {
        initialQueries[key.replace('0.', '')] = groupedQueries[key];
        groupedQueries[key.replace('0.', '')] = groupedQueries[key];
      } else {
        remainingQueries[key] = groupedQueries[key];
      }
    });

    return (
      <>
        <HeadingText type={HeadingText.TYPE.HEADING_3}>
          <Icon color={alertColor} name="circle" /> &nbsp;
          {properties.name}
        </HeadingText>

        {topQueries.map((q, i) => {
          return (
            <div key={i} style={{ padding: '5px' }}>
              {!q.hideTitle && (
                <HeadingText type={HeadingText.TYPE.HEADING_4}>
                  {q.name}
                </HeadingText>
              )}
              {this.renderChart(accountId, guids, q, properties.name)}
            </div>
          );
        })}

        <Menu pointing secondary style={{ marginBottom: '3px' }}>
          <Menu.Item
            name="Entity Summary"
            active={activeItem === 'Entity Summary'}
            onClick={this.handleItemClick}
          />
          <Menu.Item
            name="Recent Incidents"
            active={activeItem === 'Recent Incidents'}
            onClick={this.handleItemClick}
          />
          <Menu.Item
            name="Metadata"
            active={activeItem === 'Metadata'}
            onClick={this.handleItemClick}
          />
        </Menu>

        {Object.keys(groupedQueries).length > 0 && (
          <Menu
            pointing
            secondary
            style={{ marginTop: '0px', marginBottom: '5px' }}
          >
            {Object.keys(initialQueries).map(key => (
              <Menu.Item
                key={key}
                name={key}
                active={activeItem === key}
                onClick={this.handleItemClick}
              />
            ))}

            {Object.keys(remainingQueries).map(key => (
              <Menu.Item
                key={key}
                name={key}
                active={activeItem === key}
                onClick={this.handleItemClick}
              />
            ))}
          </Menu>
        )}

        {activeItem === 'Entity Summary' && (
          <EntityTable popupData={popupData} updateMapState={updateMapState} />
        )}

        {activeItem === 'Metadata' && (
          <MetadataTable
            popupData={popupData}
            updateMapState={updateMapState}
          />
        )}

        {activeItem === 'Recent Incidents' && (
          <RecentViolations
            popupData={popupData}
            updateMapState={updateMapState}
          />
        )}

        {!['Entity Summary', 'Metadata', 'Recent Incidents'].includes(
          activeItem
        ) && (
          <>
            {groupedQueries[activeItem].map((q, i) => {
              return (
                <div key={i} style={{ padding: '5px' }}>
                  {!q.hideTitle && (
                    <HeadingText type={HeadingText.TYPE.HEADING_4}>
                      {q.name}
                    </HeadingText>
                  )}
                  {this.renderChart(accountId, guids, q, properties.name)}
                </div>
              );
            })}
          </>
        )}
      </>
    );
  }
}
