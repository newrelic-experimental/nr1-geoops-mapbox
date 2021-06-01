import React from 'react';
import { NerdGraphQuery } from 'nr1';
import { List } from 'semantic-ui-react';

import { chunk, recentAlertsQuery } from '../../context/utils';

export default class RecentViolations extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      entities: [],
      recentAlertViolations: [],
      isFetching: false
    };
  }

  componentDidMount() {
    this.updateEntities();
  }

  componentDidUpdate() {
    this.updateEntities();
  }

  updateEntities = () => {
    const { popupData } = this.props;
    const { properties } = popupData || {};

    const entities = [
      { ...properties },
      ...(properties.relationships || []).map(({ target }) => target.entity)
    ];

    if (JSON.stringify(entities) !== JSON.stringify(this.state.entities)) {
      this.setState({ entities }, this.getRecentAlertViolations);
    }
  };

  getRecentAlertViolations = () => {
    this.setState({ isFetching: true }, async () => {
      const { entities } = this.state;

      const nestedEntities = [];
      entities.forEach(e => {
        if (e.relationships) {
          e.relationships.forEach(r => {
            if (r.target && r.target.entity) {
              nestedEntities.push(r.target.entity);
            }
          });
        }
      });

      const completeEntities = [...entities, ...nestedEntities];

      console.log({ completeEntities }); //eslint-disable-line

      const guids = completeEntities.map(e => e.guid);
      const entityChunks = chunk([...new Set(guids)], 25);

      const entityPromises = entityChunks.map(chunk => {
        const query = recentAlertsQuery(`"${chunk.join(`","`)}"`);
        return NerdGraphQuery.query({ query });
      });

      const recentAlertViolations = await Promise.all(entityPromises)
        .then(values => {
          return values
            .map(({ data, errors }) => {
              if (errors) {
                // eslint-disable-next-line
                console.log(
                  'Error getting recent alert violations:',
                  JSON.stringify(errors)
                );
                return [];
              }

              return (data.actor || {}).entities || [];
            })
            .flat();
        })
        .then(entities => entities.map(e => e.recentAlertViolations || []))
        .then(e => e.flat());

      this.setState({ recentAlertViolations, isFetching: false });
    });
  };

  render() {
    const { recentAlertViolations, isFetching } = this.state;

    if (!recentAlertViolations.length) {
      return isFetching
        ? 'Fetching recent alert violations'
        : 'No recent alert violations';
    }

    return (
      <List divided relaxed>
        {recentAlertViolations.map((a, i) => {
          const d = new Date(a.openedAt);
          let alertColor = '';

          switch (a.alertSeverity) {
            case 'NOT_ALERTING':
              alertColor = 'green';
              break;
            case 'WARNING':
              alertColor = 'orange';
              break;
            case 'CRITICAL':
              alertColor = 'red';
              break;
          }
          return (
            <List.Item key={i}>
              <List.Icon
                name="circle"
                size="large"
                verticalAlign="middle"
                color={alertColor || 'grey'}
              />
              <List.Content>
                {a.violationUrl ? (
                  <List.Header
                    as="a"
                    onClick={() => window.open(a.violationUrl, '_blank')}
                  >
                    {a.label}
                  </List.Header>
                ) : (
                  <List.Header>{a.label}</List.Header>
                )}
                <List.Description>{d.toLocaleString()}</List.Description>
              </List.Content>
            </List.Item>
          );
        })}
      </List>
    );
  }
}
