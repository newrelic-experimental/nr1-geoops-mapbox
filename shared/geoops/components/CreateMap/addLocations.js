import React from 'react';
import { NerdGraphMutation } from 'nr1';
import { Icon, Menu, Message, Modal } from 'semantic-ui-react';
import FileUploader from './file-upload';

export default class MapLocationsModal extends React.PureComponent {
  state = {
    // locations: [],
    // newLocationCsvString: '',
    // jsonError: false,
    // csvError: false,
    newLocationJsonString: '',
    menuItem: 'manual',
    locationsSubmitting: false
  };

  handleJsonSubmit = () => {
    const { newLocationJsonString } = this.state;
    const { updateFormState } = this.props;
    const newState = { mapLocationsModalOpen: false };

    if (newLocationJsonString) {
      try {
        newState.locations = JSON.parse(newLocationJsonString);
      } catch (e) {
        this.setState({ jsonError: e.toString() }); //eslint-disable-line
        return;
      }
    }

    updateFormState(newState);
  };

  handleFileSelect = file => {
    const { mapId, selectedMap } = this.props;

    const id = selectedMap?.id || mapId || null;

    if (id) {
      this.setState({ locationsSubmitting: true }, () => {
        this.tagWorkloads(id, file).then(() =>
          this.setState({ locationsSubmitting: false })
        );
      });
    }
  };

  tagWorkloads = async (mapId, locations) => {
    const lines = locations.split('\n');
    const headers = lines.splice(0, 1)[0].split(',');
    const workloadJson = [];

    lines.forEach(line => {
      const location = line.split(',');
      let lineObj = {};
      headers.forEach((header, hi) => {
        lineObj = { ...lineObj, [header]: location[hi] };
      });
      workloadJson.push(lineObj);
    });

    const workloadPromises = workloadJson.map(workload => {
      const tags = Object.keys(workload)
        .map(key => {
          if (key === 'guid' || key === 'name') {
            return null;
          }

          return { key: `geomaps.${key}`, values: workload[key] };
        })
        .filter(e => e);

      return NerdGraphMutation.mutate({
        mutation: `
              mutation {
                  taggingAddTagsToEntity( guid: "${
                    workload.guid
                  }", tags: [{ key: "geomaps.mapId", values: "${mapId}"},{${tags
          .map(({ key, values }) => `key: "${key}", values: "${values}"`)
          .join('},{')}}]) {
                    errors {
                      message
                      type
                    }
                  }
                }
            `
      });
    });

    while (workloadPromises.length) {
      await Promise.all(workloadPromises.splice(0, 10));
    }
  };

  render() {
    const {
      mapLocationsModalOpen,
      updateFormState,
      mapId,
      selectedMap
    } = this.props;
    const { menuItem, locationsSubmitting } = this.state;
    const id = (selectedMap || {}).id || mapId || null;
    return (
      <Modal
        dimmer="blurring"
        closeIcon
        open={mapLocationsModalOpen}
        onClose={() => updateFormState({ mapLocationsModalOpen: false })}
        size="large"
      >
        <Modal.Header>Map Locations</Modal.Header>
        <Modal.Content>
          <Menu pointing secondary>
            <Menu.Item
              name="Manually add Tags"
              active={menuItem === 'manual'}
              onClick={() => this.setState({ menuItem: 'manual' })}
            />
            <Menu.Item
              name="Automatically add tags"
              active={menuItem === 'auto'}
              onClick={() => this.setState({ menuItem: 'auto' })}
            />
          </Menu>
          {menuItem === 'manual' && (
            <Message>
              <Message.Header>
                Add the following tags to each workload to link it to the map
              </Message.Header>
              <Message.Content>
                <li>geomaps.mapId: {id}</li>
                <li>geomaps.lat:{'<latitude>'}</li>
                <li>geomaps.lng:{'<longitude>'}</li>
                <li>geomaps.state:{'<state>'}</li>
              </Message.Content>
            </Message>
          )}

          {menuItem === 'auto' && locationsSubmitting && (
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
          )}

          {menuItem === 'auto' && !locationsSubmitting && (
            <Message>
              <Message.Header>CSV File format</Message.Header>
              <Message.Content>
                <br />
                - File must include headers (guid, lat, lng, state) <br />
                - Entities will be tagged with lat/lng details <br />
                <FileUploader onFileSelect={this.handleFileSelect} />
              </Message.Content>
            </Message>
          )}
        </Modal.Content>
      </Modal>
    );
  }
}
