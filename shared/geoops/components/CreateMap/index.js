import React from 'react';

import { Modal, Button } from 'semantic-ui-react';
import { v4 } from 'uuid';
import { V3_MAP_COLLECTION_ID } from '../../context/constants';
import { DataConsumer } from '../../context/data';
import {
  deleteAccountCollection,
  writeAccountCollection
} from '../../context/utils';
import MapLocationsModal from './addLocations';
import MapModalBody from './modal-content';
import MapFiltersModal from './addFilters';

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
  latError: false
};

export default class CreateMap extends React.PureComponent {
  state = defaultState;

  updateFormState = newState => {
    return new Promise(resolve => {
      this.setState(newState, resolve);
    });
  };

  handleMapDelete = (selectedMap, updateMapContext) => {
    this.setState({ formSubmitting: true });

    deleteAccountCollection(
      selectedMap.accountId,
      V3_MAP_COLLECTION_ID,
      selectedMap.id
    ).then(() => {
      this.setState({ formSubmitting: false, ...defaultState }, () =>
        updateMapContext({
          createMapModalOpen: false,
          selectedMap: null
        })
      );
    });
  };

  handleFormSubmit = async (formData, updateMapContext, handleSelectMap) => {
    const { filters } = this.state || { filters: [] };
    await this.updateFormState({ formSubmitting: true });

    const newMapConfig = {
      ...formData,
      id: formData.id || v4(),
      filters: formData.filters || filters
    };

    await writeAccountCollection(
      newMapConfig.accountId,
      V3_MAP_COLLECTION_ID,
      newMapConfig.id,
      newMapConfig
    );

    this.setState({ formSubmitting: false, mapId: newMapConfig.id }, () => {
      return updateMapContext({ createMapModalOpen: false }).then(() =>
        handleSelectMap({
          accountId: newMapConfig.accountId,
          document: newMapConfig,
          id: newMapConfig.id
        })
      );
    });
  };

  render() {
    const {
      mapLocationsModalOpen,
      locations,
      mapId,
      formSubmitting,
      filters,
      mapFiltersModalOpen
    } = this.state;
    return (
      <DataConsumer>
        {({
          createMapModalOpen,
          updateMapContext,
          selectedMap,
          availableAccounts,
          handleSelectMap
        }) => {
          return (
            <>
              <MapLocationsModal
                mapLocationsModalOpen={mapLocationsModalOpen}
                onClose={locations =>
                  this.setState({ locations, mapLocationsModalOpen: false })
                }
                updateFormState={this.updateFormState}
                locations={locations}
                selectedMap={selectedMap}
                mapId={mapId}
              />

              <MapFiltersModal
                mapFiltersModalOpen={mapFiltersModalOpen}
                updateState={this.updateFormState}
                filters={filters}
              />

              <Modal
                dimmer="inverted"
                closeIcon
                size="large"
                open={createMapModalOpen}
                onClose={() =>
                  updateMapContext({ createMapModalOpen: !createMapModalOpen })
                }
              >
                <Modal.Header>
                  {selectedMap
                    ? `Update Map (id: ${selectedMap.id})`
                    : 'Create Map'}

                  <div style={{ float: 'right' }}>
                    {(selectedMap || {}).id && (
                      <Button
                        basic
                        color="black"
                        onClick={() =>
                          this.setState({
                            mapLocationsModalOpen: !mapLocationsModalOpen
                          })
                        }
                      >
                        Locations
                      </Button>
                    )}
                  </div>
                </Modal.Header>
                <Modal.Content>
                  <MapModalBody
                    selectedMap={selectedMap}
                    updateFormState={this.updateFormState}
                    updateMapContext={updateMapContext}
                    formSubmitting={formSubmitting}
                    handleFormSubmit={formData =>
                      this.handleFormSubmit(
                        formData,
                        updateMapContext,
                        handleSelectMap
                      )
                    }
                    handleMapDelete={selectedMap =>
                      this.handleMapDelete(selectedMap, updateMapContext)
                    }
                    availableAccounts={availableAccounts}
                  />
                </Modal.Content>
              </Modal>
            </>
          );
        }}
      </DataConsumer>
    );
  }
}
