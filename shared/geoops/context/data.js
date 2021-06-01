import React from 'react';

import {
  deleteAccountCollection,
  docToGeoJson,
  getAccountCollection,
  getAccounts,
  getWorkloadsForMap,
  doNrqlQuery,
  //   cityToCoordinates,
  //   cityToGeojson,
  citiesToGeoJson
} from './utils';
import { V3_MAP_COLLECTION_ID } from './constants';

const MapDataContext = React.createContext();

export class DataProvider extends React.Component {
  state = {
    availableMaps: [],
    workloads: [],
    selectedMap: null,
    selectedLocation: null,
    createMapModalOpen: false,
    queryModalOpen: false,
    stateFilter: '',
    alertFilter: '',
    fullscreen: false,
    vizMapName: null
  };

  componentDidMount = async () => {
    this.loadGeomaps();
  };

  componentDidUpdate = () => {
    const { isWidget } = this.props;
    const { availableMaps, vizMapName } = this.state;

    if (isWidget) {
      const mapName = this.props?.vizConfig?.mapName || '';

      if (mapName !== vizMapName) {
        const selectedMap = availableMaps.find(
          m => (m?.document?.name || '').toLowerCase() === mapName.toLowerCase()
        );

        // eslint-disable-next-line
        this.setState({ vizMapName: mapName }, () => {
          if (selectedMap) {
            this.handleSelectMap(selectedMap);
          }
        });
      }
    }
  };

  loadGeomaps = () => {
    this.setState({ loadingGeomaps: true }, async () => {
      const availableAccounts = await getAccounts();
      const availableMaps = await Promise.all(
        (availableAccounts || []).map(({ accountId }) => {
          return getAccountCollection(
            accountId,
            V3_MAP_COLLECTION_ID
          ).then(geomaps => geomaps.map(m => ({ ...m, accountId })));
        })
      ).then(m => [].concat(...m));

      const deleteAllMaps = false;

      if (deleteAllMaps) {
        await Promise.all(
          availableMaps.map(m => {
            return deleteAccountCollection(
              m.accountId,
              V3_MAP_COLLECTION_ID,
              m.id
            );
          })
        );

        this.setState({ availableAccounts, availableMaps: [] });

        return;
      }

      const mapName = this.props?.vizConfig?.mapName || '';
      const selectedMap = this.props?.isWidget
        ? availableMaps.find(
            m =>
              (m?.document?.name || '').toLowerCase() === mapName.toLowerCase()
          )
        : null;

      this.setState(
        {
          availableAccounts,
          availableMaps,
          loadingGeomaps: false,
          fullscreen: this.props.isWidget,
          vizMapName: mapName
        },
        () => {
          if (selectedMap) {
            this.handleSelectMap(selectedMap);
          }
        }
      );
    });
  };

  fetchData = async (forced = false) => {
    const { selectedMap, isFetching } = this.state;
    // const { accountId, id } = selectedMap;

    if (isFetching) {
      return;
    }

    if (forced) {
      await this.updateMapContext({
        selectedMap: { ...selectedMap, mapLoaded: false }
      });
    }

    return this.fetchGeomapData();

    // switch (((selectedMap || {}).document || {}).mapType) {
    //   case 'heatmap':
    //     return this.fetchHeatmapData();

    //   default:
    //     return this.fetchGeomapData();
    // }
  };

  fetchHeatmapData = async () => {
    const { selectedMap } = this.state;
    const { accountId, document } = selectedMap;

    await this.updateMapContext({ isFetching: true });

    const results = await doNrqlQuery(accountId, document.query).then(
      ({ data, error }) => {
        if (error) {
          // eslint-disable-next-line
          console.log('nrql error:', JSON.stringify(error));
          return [];
        }

        return (data?.raw?.facets || []).map(({ name, results }) => ({
          name,
          count: (results[0] || {}).uniqueCount || 0
        }));
      }
    );

    const geojson = await citiesToGeoJson(results, document.apiKey);

    selectedMap.geojson = geojson;

    this.setState({ selectedMap, isFetching: false });
  };

  fetchGeomapData = async () => {
    const { selectedMap } = this.state;
    const { accountId, id } = selectedMap;

    await this.updateMapContext({ isFetching: true });
    const workloads = await getWorkloadsForMap(accountId, id);
    selectedMap.geojson = docToGeoJson(workloads);
    selectedMap.mapLoaded = true;
    this.setState({ workloads, isFetching: false, selectedMap });
  };

  updateMapContext = newState => {
    return new Promise(resolve => {
      return this.setState(prevState => {
        if (prevState.createMapModalOpen && !newState.createMapModalOpen) {
          this.loadGeomaps();
        }

        if (prevState.queryModalOpen && !newState.queryModalOpen) {
          this.loadGeomaps();
        }

        return newState;
      }, resolve);
    });
  };

  handleSelectMap = (selectedMap, state = {}) => {
    if (!selectedMap) {
      return this.updateMapContext({
        ...state,
        selectedMap: null,
        workloads: [],
        alertFilter: ''
      });
    }

    this.setState({ ...state, selectedMap }, () => {
      this.fetchData(selectedMap);
    });
  };

  render() {
    const { isWidget, vizConfig } = this.props;

    return (
      <MapDataContext.Provider
        value={{
          ...this.state,
          isWidget,
          vizConfig,
          updateMapContext: this.updateMapContext.bind(this),
          handleSelectMap: this.handleSelectMap.bind(this),
          fetchData: this.fetchData.bind(this)
        }}
      >
        {this.props.children}
      </MapDataContext.Provider>
    );
  }
}

export const DataConsumer = MapDataContext.Consumer;
