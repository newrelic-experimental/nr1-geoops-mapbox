import React from 'react';
import Select from 'react-select';
import { Icon } from 'semantic-ui-react';
import { ALERT_LEVELS } from '../../context/constants';
import { DataConsumer } from '../../context/data';

export default class MenuBar extends React.PureComponent {
  buildMapOptions = maps =>
    maps
      .map(m => ({
        ...m,
        key: m.id,
        label: ((m.document || {}).name || '').replace(/\+/g, ' '),
        text: ((m.document || {}).name || '').replace(/\+/g, ' '),
        value: m.id
      }))
      .sort((a, b) => (a.label < b.label ? -1 : a.label > b.label ? 1 : 0)); //eslint-disable-line

  buildStateOptions = items => {
    const states = items.map(i => (i.location || {}).state || '');
    return states
      .filter((e, i) => states.indexOf(e) === i)
      .map(s => ({
        key: s,
        label: s,
        text: s,
        value: s
      }));
  };

  buildAlertOptions = () => {
    return Object.keys(ALERT_LEVELS).map(s => ({
      key: s,
      label: s,
      text: s,
      value: s
    }));
  };

  buildFilterOptions = (filter, items) => {
    const { location } = filter;
    const locationLevels = location.split('.');
    const newItems = items.map(item => {
      let nestedItem = item;
      locationLevels.forEach(level => {
        nestedItem = nestedItem[level];
      });
      return {
        key: nestedItem,
        label: nestedItem,
        text: nestedItem,
        value: nestedItem
      };
    });
    return newItems.filter((el, i) => newItems.indexOf(el) === i);
  };

  buildLocationOptions = workloads => {
    return workloads.map(workload => ({
      key: workload.guid,
      label: workload.name,
      text: `${(<Icon name="circle" color="green" />)} ${workload.name}`,
      value: workload
    }));
  };

  buildFavoriteOptions = favorites => {
    return favorites.map(favorite => ({
      key: favorite.name,
      label: favorite.name,
      text: favorite.name,
      value: favorite
    }));
  };

  render() {
    return (
      <DataConsumer>
        {({
          isWidget,
          availableMaps,
          selectedMap,
          fetchData,
          workloads,
          fullscreen,
          isFetching,
          alertFilter,
          handleSelectMap,
          updateMapContext
        }) => {
          const { document, geojson } = selectedMap || {};

          const mapLoaded = geojson && workloads.length ? true : false; //eslint-disable-line

          // const locationOptions = (alertFilter || []).length ? this.buildFilteredLocationOptions(alertFilter, locationOptions)

          const locationOptions = (alertFilter || []).length
            ? (geojson?.features || [])
                .filter(f => {
                  return (
                    alertFilter
                      .map(({ value }) => value)
                      .indexOf((f.properties || {}).alertHighest) > -1
                  );
                })
                .map(({ properties }) => ({
                  key: properties.guid,
                  label: properties.name,
                  text: properties.text,
                  value: properties
                }))
            : mapLoaded
            ? this.buildLocationOptions(workloads)
            : [];

          // console.log({ locationOptions }); //eslint-disable-line

          // const locationOptions =  alertFilter ? (((geojson || {}).features || [])
          //     .filter(f => f.properties.alertHighest === (alertFilter || {}).value)
          //     .map(({properties}) => ({ key: properties.guid, label: properties.name, text: properties.text, value: properties }))
          // ) : (mapLoaded ? this.buildLocationOptions(workloads) : []);

          return (
            <div>
              <div className="utility-bar">
                {mapLoaded && (
                  <Icon
                    name="sidebar"
                    link
                    size="big"
                    onClick={() =>
                      updateMapContext({ fullscreen: !fullscreen })
                    }
                  />
                )}
                {!isWidget && (
                  <div className="react-select-input-group">
                    <label>Maps</label>
                    <Select
                      isDisabled={isWidget}
                      options={this.buildMapOptions(availableMaps)}
                      placeholder="Select a map..."
                      isClearable
                      onChange={selectedMap => handleSelectMap(selectedMap)}
                      value={
                        (document || {}).name
                          ? {
                              text: document.name,
                              value: document.name,
                              label: document.name
                            }
                          : ''
                      }
                      classNamePrefix="react-select"
                    />
                  </div>
                )}
                {mapLoaded && (
                  <>
                    <div className="react-select-input-group">
                      <label>Jump to location</label>
                      <Select
                        options={locationOptions}
                        isSearchable
                        isClearable
                        onChange={selectedLocation =>
                          updateMapContext({
                            selectedLocation: (selectedLocation || {}).value
                          })
                        }
                        classNamePrefix="react-select"
                      />
                    </div>
                    <div className="react-select-input-group">
                      <label>Favorites</label>
                      <Select
                        options={this.buildFavoriteOptions(
                          document.favorites || []
                        )}
                        isSearchable
                        isClearable
                        onChange={selectedLocation =>
                          updateMapContext({
                            selectedLocation: (selectedLocation || {}).value
                          })
                        }
                        classNamePrefix="react-select"
                      />
                    </div>
                    <div className="react-select-input-group-alerts">
                      <label>Alert Status</label>
                      <Select
                        options={this.buildAlertOptions()}
                        placeholder="Filter by alert status..."
                        isClearable
                        isMulti
                        className="alert-filter"
                        onChange={alertFilter =>
                          updateMapContext({ alertFilter })
                        }
                        value={alertFilter}
                        classNamePrefix="react-select"
                      />
                    </div>
                  </>
                )}
                {document ? (
                  <>
                    <Icon
                      name="refresh"
                      link={!isFetching}
                      loading={isFetching}
                      size="big"
                      onClick={() => fetchData(true)}
                    />
                    {((geojson || {}).timestamp || false) &&
                      `Updated @ ${new Date(
                        geojson.timestamp
                      ).toLocaleTimeString()}`}
                    <div style={{ float: 'right', marginLeft: 'auto' }}>
                      <Icon
                        name="cog"
                        size="big"
                        link
                        onClick={() =>
                          updateMapContext({
                            createMapModalOpen: true,
                            selectedMap
                          })
                        }
                      />
                      <Icon
                        name="chart bar outline"
                        size="big"
                        link
                        onClick={() =>
                          updateMapContext({
                            queryModalOpen: true,
                            selectedMap
                          })
                        }
                      />
                      <Icon
                        name="star"
                        size="big"
                        link
                        onClick={() =>
                          updateMapContext({
                            favoritesModalOpen: true,
                            selectedMap
                          })
                        }
                      />
                    </div>
                  </>
                ) : (
                  <Icon
                    name="add"
                    size="big"
                    link
                    onClick={() =>
                      updateMapContext({
                        createMapModalOpen: true,
                        selectedMap: null
                      })
                    }
                  />
                )}
              </div>
            </div>
          );
        }}
      </DataConsumer>
    );
  }
}
