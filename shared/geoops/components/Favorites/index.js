import React from 'react';

import { Modal, Form, Divider, Header } from 'semantic-ui-react';
import { V3_MAP_COLLECTION_ID } from '../../context/constants';
import { DataConsumer } from '../../context/data';
import { writeAccountCollection } from '../../context/utils';

const defaultState = {
  name: '',
  lng: 0,
  lat: 0,
  zoom: 0,
  favorites: [],
  addingFavorite: false,
  deletingFavorite: false,
  updatingFavorite: false
};

export default class Favorites extends React.PureComponent {
  state = defaultState;

  addFavorite = async (handleSelectMap, map, currentViewport) => {
    const { longitude, latitude, zoom } = currentViewport;

    const newFavorites = map.document?.favorites || [];
    newFavorites.push({
      name: this.state.name,
      lng: this.state.lng || longitude,
      lat: this.state.lat || latitude,
      zoom: this.state.zoom || zoom
    });
    map.document.favorites = newFavorites;

    this.setState({ addingFavorite: true }, async () => {
      await writeAccountCollection(
        map.accountId,
        V3_MAP_COLLECTION_ID,
        map.id,
        map.document
      );

      const stateUpdate = {
        name: '',
        lng: 0,
        lat: 0,
        zoom: 0,
        addingFavorite: false
      };

      Object.keys(this.state).forEach(key => {
        if (/^[0-9].+$/.test(key)) {
          const keyNo = key.split('_')[0];
          stateUpdate[`${keyNo}_name`] = undefined;
          stateUpdate[`${keyNo}_lng`] = undefined;
          stateUpdate[`${keyNo}_lat`] = undefined;
          stateUpdate[`${keyNo}_zoom`] = undefined;
        }
      });

      this.setState(stateUpdate);
    });
  };

  updateFavorite = async (map, i, q) => {
    const newFavorites = map.document?.favorites || [];
    newFavorites[i] = {
      name: this.state[`${i}_name`] || q.name,
      lng: this.state[`${i}_lng`] || q.lng,
      lat: this.state[`${i}_lat`] || q.lat,
      zoom: this.state[`${i}_zoom`] || q.zoom
    };
    map.document.favorites = newFavorites;

    this.setState({ updatingFavorite: true }, async () => {
      await writeAccountCollection(
        map.accountId,
        V3_MAP_COLLECTION_ID,
        map.id,
        map.document
      );

      const stateUpdate = { updatingFavorite: false };
      Object.keys(this.state).forEach(key => {
        if (/^[0-9].+$/.test(key)) {
          const keyNo = key.split('_')[0];
          stateUpdate[`${keyNo}_name`] = undefined;
          stateUpdate[`${keyNo}_lng`] = undefined;
          stateUpdate[`${keyNo}_lat`] = undefined;
          stateUpdate[`${keyNo}_zoom`] = undefined;
        }
      });

      this.setState(stateUpdate);
    });
  };

  deleteFavorite = async (handleSelectMap, map, index) => {
    const newFavorites = map.document?.favorites || [];
    newFavorites.splice(index, 1);
    map.document.favorites = newFavorites;

    this.setState({ deletingFavorite: true }, async () => {
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

      this.setState({ deletingFavorite: false });
    });
  };

  render() {
    const {
      name,
      addingFavorite,
      deletingFavorite,
      updatingFavorite
    } = this.state;

    return (
      <DataConsumer>
        {({
          favoritesModalOpen,
          updateMapContext,
          selectedMap,
          handleSelectMap,
          currentViewport
        }) => {
          const { latitude, longitude, zoom } = currentViewport;
          const favorites = selectedMap?.document?.favorites || [];

          return (
            <>
              <Modal
                dimmer="inverted"
                closeIcon
                size="large"
                open={favoritesModalOpen}
                onClose={() =>
                  updateMapContext({ favoritesModalOpen: !favoritesModalOpen })
                }
              >
                <Modal.Header>Favorites</Modal.Header>
                <Modal.Content>
                  <Header as="h4">Add current location</Header>

                  <Form>
                    <Form.Group>
                      <Form.Input
                        width="4"
                        label="Name"
                        required
                        value={name}
                        id="name"
                        onChange={({ target }) =>
                          this.setState({ name: target.value })
                        }
                      />
                      <Form.Input
                        width="4"
                        label="Latitude"
                        required
                        value={latitude}
                        id="lat"
                      />
                      <Form.Input
                        width="4"
                        label="Longitude"
                        required
                        value={longitude}
                        id="lng"
                      />
                      <Form.Input
                        width="4"
                        label="Zoom"
                        required
                        value={zoom}
                        id="zoom"
                      />
                    </Form.Group>

                    <Form.Group>
                      <Form.Button
                        content="Add favorite"
                        icon="plus"
                        loading={addingFavorite}
                        disabled={
                          !name ||
                          isNaN(latitude) ||
                          isNaN(longitude) ||
                          isNaN(zoom) ||
                          deletingFavorite ||
                          updatingFavorite
                        }
                        onClick={() =>
                          this.addFavorite(
                            handleSelectMap,
                            selectedMap,
                            currentViewport
                          )
                        }
                      />
                    </Form.Group>
                  </Form>

                  <Divider />

                  {favorites.length === 0 ? (
                    <>
                      No favorites configured. <br />
                    </>
                  ) : (
                    <Form>
                      {favorites.map((q, i) => (
                        <React.Fragment key={i}>
                          <Form.Group>
                            <Form.Input
                              width="4"
                              label="Name"
                              required
                              value={this.state[`${i}_name`] || q.name}
                              onChange={e =>
                                this.setState({
                                  [`${i}_name`]: e.target.value
                                })
                              }
                            />
                            <Form.Input
                              width="4"
                              label="Latitude"
                              required
                              value={this.state[`${i}_lat`] || q.lat}
                              onChange={e =>
                                this.setState({
                                  [`${i}_lat`]: e.target.value
                                })
                              }
                            />
                            <Form.Input
                              width="4"
                              label="Longitude"
                              required
                              value={this.state[`${i}_lng`] || q.lng}
                              onChange={e =>
                                this.setState({
                                  [`${i}_lng`]: e.target.value
                                })
                              }
                            />

                            <Form.Input
                              width="4"
                              label="Zoom"
                              required
                              value={this.state[`${i}_zoom`] || q.zoom}
                              onChange={e =>
                                this.setState({
                                  [`${i}_zoom`]: e.target.value
                                })
                              }
                            />
                          </Form.Group>
                          <Form.Group>
                            <Form.Button
                              size="mini"
                              disabled={
                                updatingFavorite ||
                                deletingFavorite ||
                                addingFavorite ||
                                !Object.keys(this.state).find(
                                  key =>
                                    key.startsWith(`${i}_`) &&
                                    this.state[key] !== undefined
                                )
                              }
                              loading={updatingFavorite}
                              onClick={() =>
                                this.updateFavorite(selectedMap, i, q)
                              }
                              content="Update favorite"
                              icon="check"
                              positive
                            />
                            <Form.Button
                              size="mini"
                              disabled={
                                updatingFavorite ||
                                deletingFavorite ||
                                addingFavorite
                              }
                              loading={deletingFavorite}
                              onClick={() =>
                                this.deleteFavorite(
                                  handleSelectMap,
                                  selectedMap,
                                  i
                                )
                              }
                              content="Delete favorite"
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
