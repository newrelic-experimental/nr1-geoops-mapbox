import React from 'react';

import { DataConsumer } from '../../context/data';
import MapLocationTable from './MapLocationTable';
import GeoMap from '../GeoMap';
import { Grid, Icon, Segment, Sidebar } from 'semantic-ui-react';

export default class ViewMap extends React.Component {
  state = {
    // stateFilter: null,
    // alertFilter: null,
    showSidebar: false
  };

  componentDidMount = () => {
    setInterval(
      () =>
        this.setState(prevState => ({ showSidebar: !prevState.showSidebar })),
      5000
    );
  };

  handleFilterChange = ({ filter }) => {
    const { name, value } = filter;
    this.setState({ [name]: value });
  };

  applyFilters = ({ workloads, alertFilter, filters }) => {
    let filtered = [...workloads];

    console.log({ workloads, alertFilter, filters }); //eslint-disable-line

    if (filters) {
      filters.forEach(filter => {
        if (filter.value) {
          const locationLevels = filter.location.split('.');
          filtered = filtered.filter(item => {
            let check = { ...item };
            locationLevels.forEach(l => {
              check = check[l];
            });
            return check === filter.value.value;
          });
        }
      });
    }

    if ((alertFilter || []).length) {
      console.log({ alertFilter, filtered }); //eslint-disable-line
      const alertFilters = alertFilter.map(({ value }) => value);
      filtered = filtered.filter(w => {
        if (!w.alertHighest) {
          return false;
        }

        if ((alertFilters || []).indexOf(w.alertHighest) > -1) {
          console.log({ alertFilters, w }); //eslint-disable-line
          return true;
        }

        return false;
      });
    }

    return filtered;
  };

  filterSelectedMap = (features, alertFilters) => {
    return features.filter(
      ({ properties }) =>
        properties.alertHighest &&
        alertFilters
          .map(({ value }) => value)
          .indexOf(properties.alertHighest) > -1
    );
  };

  render() {
    return (
      <DataConsumer>
        {({
          selectedMap,
          updateMapContext,
          workloads,
          selectedLocation,
          fullscreen,
          fetchData,
          alertFilter
        }) => {
          const mapLoaded = selectedMap?.mapLoaded || false;

          if (!mapLoaded) {
            return (
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon name="spinner" size="huge" loading />
              </div>
            );
          }

          const { filters } = (selectedMap.document || {}).filters;
          const filteredLocations = this.applyFilters({
            workloads,
            filters,
            alertFilter
          });

          const newSelectedMap = { ...selectedMap };

          if ((alertFilter || []).length) {
            const filteredFeatures = this.filterSelectedMap(
              newSelectedMap.geojson.features,
              alertFilter
            );
            newSelectedMap.geojson = {
              ...newSelectedMap.geojson,
              features: filteredFeatures
            };
          }

          return (
            <Grid stretched style={{ margin: '-1.25em 0 0 0' }}>
              <Grid.Row>
                <Grid.Column width={16} style={{ padding: 0 }}>
                  <Sidebar.Pushable as={Segment}>
                    <Sidebar
                      animation="push"
                      direction="left"
                      visible={!fullscreen}
                      width="wide"
                    >
                      <MapLocationTable
                        data={filteredLocations}
                        rowClickHandler={selectedLocation =>
                          updateMapContext({
                            selectedLocation,
                            fullscreen: true
                          })
                        }
                      />
                    </Sidebar>
                    <Sidebar.Pusher>
                      <Segment basic>
                        <GeoMap
                          selectedMap={newSelectedMap}
                          fetchData={fetchData}
                          selectedLocation={selectedLocation}
                          updateMapContext={updateMapContext}
                          fullscreen={fullscreen}
                        />
                      </Segment>
                    </Sidebar.Pusher>
                  </Sidebar.Pushable>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          );
        }}
      </DataConsumer>
    );
  }
}
