import React from 'react';

import { Modal, Message, Form, Divider, Header } from 'semantic-ui-react';
import { V3_MAP_COLLECTION_ID } from '../../context/constants';
import { DataConsumer } from '../../context/data';
import { writeAccountCollection } from '../../context/utils';

const defaultState = {
  name: '',
  mapStyle: '',
  lat: 0,
  lng: 0,
  defaultZoom: 4,
  locations: [],
  filters: [],
  accountId: 0,
  formSubmitting: false,
  apiKey: '',
  mapLocationsModalOpen: false,
  mapFiltersModalOpen: false,
  mapPreviewOpen: false,
  refreshInterval: null,
  refreshIntervalError: false,
  lngError: false,
  latError: false,
  queryName: '',
  queryCategory: '',
  queryNrql: '',
  queryFilterEntities: false,
  addingQuery: false,
  deletingQuery: false,
  queryHideTitle: false,
  queryChart: ''
};

export default class CustomQuery extends React.PureComponent {
  state = defaultState;

  addQuery = async (handleSelectMap, map) => {
    const newQueries = map.document?.queries || [];
    newQueries.push({
      name: this.state.queryName,
      nrql: this.state.queryNrql,
      category: this.state.queryCategory,
      filterEntities: this.state.queryFilterEntities,
      chart: this.state.queryChart,
      hideTitle: this.state.queryHideTitle
    });
    map.document.queries = newQueries;

    this.setState({ addingQuery: true }, async () => {
      await writeAccountCollection(
        map.accountId,
        V3_MAP_COLLECTION_ID,
        map.id,
        map.document
      );

      const stateUpdate = {
        queryName: '',
        queryNrql: '',
        queryCategory: '',
        queryChart: '',
        queryHideTitle: false,
        queryFilterEntities: false,
        addingQuery: false,
        updatingQuery: false
      };

      Object.keys(this.state).forEach(key => {
        if (/^[0-9].+$/.test(key)) {
          const keyNo = key.split('_')[0];
          stateUpdate[`${keyNo}_name`] = undefined;
          stateUpdate[`${keyNo}_nrql`] = undefined;
          stateUpdate[`${keyNo}_category`] = undefined;
          stateUpdate[`${keyNo}_filterEntities`] = undefined;
          stateUpdate[`${keyNo}_chart`] = undefined;
          stateUpdate[`${keyNo}_hideTitle`] = undefined;
        }
      });

      this.setState(stateUpdate);
    });
  };

  updateQuery = async (map, i, q) => {
    const newQueries = map.document?.queries || [];
    newQueries[i] = {
      name: this.state[`${i}_name`] || q.name,
      nrql: this.state[`${i}_nrql`] || q.nrql,
      category: this.state[`${i}_category`] || q.category,
      filterEntities: this.state[`${i}_filterEntities`],
      chart: this.state[`${i}_chart`] || q.chart,
      hideTitle: this.state[`${i}_hideTitle`]
    };
    map.document.queries = newQueries;

    this.setState({ updatingQuery: true }, async () => {
      await writeAccountCollection(
        map.accountId,
        V3_MAP_COLLECTION_ID,
        map.id,
        map.document
      );

      const stateUpdate = { updatingQuery: false };
      Object.keys(this.state).forEach(key => {
        if (/^[0-9].+$/.test(key)) {
          const keyNo = key.split('_')[0];
          stateUpdate[`${keyNo}_name`] = undefined;
          stateUpdate[`${keyNo}_nrql`] = undefined;
          stateUpdate[`${keyNo}_category`] = undefined;
          stateUpdate[`${keyNo}_filterEntities`] = undefined;
          stateUpdate[`${keyNo}_chart`] = undefined;
          stateUpdate[`${keyNo}_hideTitle`] = undefined;
        }
      });

      this.setState(stateUpdate);
    });
  };

  deleteQuery = async (handleSelectMap, map, index) => {
    const newQueries = map.document?.queries || [];
    newQueries.splice(index, 1);
    map.document.queries = newQueries;

    this.setState({ deletingQuery: true }, async () => {
      await writeAccountCollection(
        map.accountId,
        V3_MAP_COLLECTION_ID,
        map.id,
        map.document
      );

      // handleSelectMap({
      //   accountId: map.accountId,
      //   document: map.document,
      //   id: map.id
      // });

      this.setState({ deletingQuery: false });
    });
  };

  render() {
    const {
      queryName,
      queryCategory,
      queryNrql,
      queryFilterEntities,
      addingQuery,
      deletingQuery,
      updatingQuery,
      queryChart,
      queryHideTitle
    } = this.state;

    return (
      <DataConsumer>
        {({
          queryModalOpen,
          updateMapContext,
          selectedMap,
          handleSelectMap
        }) => {
          const queries = selectedMap?.document?.queries || [];

          return (
            <>
              <Modal
                dimmer="inverted"
                closeIcon
                size="large"
                open={queryModalOpen}
                onClose={() =>
                  updateMapContext({ queryModalOpen: !queryModalOpen })
                }
              >
                <Modal.Header>Sidebar Query Configuration</Modal.Header>
                <Modal.Content>
                  <Message>
                    <Message.Content>
                      <li>
                        {'${name}'} can be used as a replacement variable for
                        your NRQL query
                      </li>
                      <li>
                        When Filter Entities is checked a WHERE clause with the
                        entity guids will be automatically added
                      </li>
                      <li>
                        Setting the category to "top" will render the charts
                        under the main header
                      </li>
                      <li>
                        Other categories will be added to a secondary tabbed
                        section
                      </li>
                      <li>Support charts: billboard, line</li>
                    </Message.Content>
                  </Message>

                  <Header as="h4">Add a new query</Header>

                  <Form>
                    <Form.Group>
                      <Form.Input
                        width="3"
                        label="Category"
                        required
                        value={queryCategory}
                        id="queryCategory"
                        onChange={({ target }) =>
                          this.setState({ queryCategory: target.value })
                        }
                      />
                      <Form.Input
                        width="3"
                        label="Name"
                        required
                        value={queryName}
                        id="queryName"
                        onChange={({ target }) =>
                          this.setState({ queryName: target.value })
                        }
                      />
                      <Form.Input
                        width="2"
                        label="Chart Type"
                        required
                        value={queryChart}
                        id="queryChart"
                        onChange={({ target }) =>
                          this.setState({ queryChart: target.value })
                        }
                      />
                      <Form.Input
                        width="8"
                        label="NRQL"
                        required
                        value={queryNrql}
                        id="queryNrql"
                        onChange={({ target }) =>
                          this.setState({ queryNrql: target.value })
                        }
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Checkbox
                        width="3"
                        label="Filter Entities"
                        checked={queryFilterEntities}
                        id="queryFilterEntities"
                        onChange={(e, d) =>
                          this.setState({
                            queryFilterEntities: d.checked
                          })
                        }
                      />

                      <Form.Checkbox
                        width="3"
                        label="Hide Title"
                        checked={queryHideTitle}
                        id="queryHideTitle"
                        onChange={(e, d) =>
                          this.setState({
                            queryHideTitle: d.checked
                          })
                        }
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Button
                        content="Add query"
                        icon="plus"
                        loading={addingQuery}
                        disabled={
                          !queryName ||
                          !queryCategory ||
                          !queryNrql ||
                          deletingQuery ||
                          updatingQuery
                        }
                        onClick={() =>
                          this.addQuery(handleSelectMap, selectedMap)
                        }
                      />
                    </Form.Group>
                  </Form>

                  <Divider />

                  {queries.length === 0 ? (
                    <>
                      No queries configured. <br />
                    </>
                  ) : (
                    <Form>
                      {queries.map((q, i) => (
                        <React.Fragment key={i}>
                          <Form.Group>
                            <Form.Input
                              width="3"
                              label="Category"
                              required
                              value={
                                this.state[`${i}_category`] !== undefined
                                  ? this.state[`${i}_category`]
                                  : q.category
                              }
                              onChange={e =>
                                this.setState({
                                  [`${i}_category`]: e.target.value
                                })
                              }
                            />
                            <Form.Input
                              width="3"
                              label="Name"
                              required
                              value={
                                this.state[`${i}_name`] !== undefined
                                  ? this.state[`${i}_name`]
                                  : q.name
                              }
                              onChange={e =>
                                this.setState({
                                  [`${i}_name`]: e.target.value
                                })
                              }
                            />
                            <Form.Input
                              width="2"
                              label="Chart Type"
                              required
                              value={
                                this.state[`${i}_chart`] !== undefined
                                  ? this.state[`${i}_chart`]
                                  : q.chart
                              }
                              onChange={e =>
                                this.setState({
                                  [`${i}_chart`]: e.target.value
                                })
                              }
                            />
                            <Form.Input
                              width="8"
                              label="NRQL"
                              required
                              value={
                                this.state[`${i}_nrql`] !== undefined
                                  ? this.state[`${i}_nrql`]
                                  : q.nrql
                              }
                              onChange={e =>
                                this.setState({
                                  [`${i}_nrql`]: e.target.value
                                })
                              }
                            />
                          </Form.Group>
                          <Form.Group>
                            <Form.Checkbox
                              width="3"
                              label="Filter Entities"
                              checked={
                                this.state[`${i}_filterEntities`] !== undefined
                                  ? this.state[`${i}_filterEntities`]
                                  : q.filterEntities
                              }
                              onChange={(e, d) =>
                                this.setState({
                                  [`${i}_filterEntities`]: d.checked
                                })
                              }
                            />
                            <Form.Checkbox
                              width="3"
                              label="Hide Title"
                              checked={
                                this.state[`${i}_hideTitle`] !== undefined
                                  ? this.state[`${i}_hideTitle`]
                                  : q.hideTitle
                              }
                              onChange={(e, d) =>
                                this.setState({
                                  [`${i}_hideTitle`]: d.checked
                                })
                              }
                            />
                          </Form.Group>
                          <Form.Group>
                            <Form.Button
                              size="mini"
                              disabled={
                                updatingQuery ||
                                deletingQuery ||
                                addingQuery ||
                                !Object.keys(this.state).find(
                                  key =>
                                    key.startsWith(`${i}_`) &&
                                    this.state[key] !== undefined
                                )
                              }
                              loading={updatingQuery}
                              onClick={() =>
                                this.updateQuery(selectedMap, i, q)
                              }
                              content="Update query"
                              icon="check"
                              positive
                            />
                            <Form.Button
                              size="mini"
                              disabled={
                                updatingQuery || deletingQuery || addingQuery
                              }
                              loading={deletingQuery}
                              onClick={() =>
                                this.deleteQuery(
                                  handleSelectMap,
                                  selectedMap,
                                  i
                                )
                              }
                              content="Delete query"
                              icon="minus"
                              negative
                            />
                          </Form.Group>
                        </React.Fragment>
                      ))}
                    </Form>
                  )}
                </Modal.Content>
              </Modal>
            </>
          );
        }}
      </DataConsumer>
    );
  }
}
