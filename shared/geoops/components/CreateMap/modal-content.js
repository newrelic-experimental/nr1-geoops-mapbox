import React from 'react';
import { Form, Icon } from 'semantic-ui-react';
import { v4 } from 'uuid';
import { DEFAULT_MAP_STYLE, MAP_STYLES } from '../../context/constants';
import MapPreviewModal from './map-preview-modal';

const defaultState = {
  name: '',
  mapStyle: '',
  lat: 0,
  lng: 0,
  latError: false,
  lngError: false,
  defaultZoom: 4,
  filters: [
    {
      name: 'State',
      location: 'location.state'
    }
  ],
  newFilter: {
    name: '',
    location: ''
  },
  id: '',
  accountId: 0,
  apiKey: '',
  mapPreviewOpen: false,
  refreshInterval: '',
  refreshIntervalError: false,
  defaultZoomError: false,
  submitting: false
};

export default class MapModalBody extends React.PureComponent {
  state = defaultState;

  componentDidMount = () => {
    const { selectedMap } = this.props;
    let newState = { id: (selectedMap || {}).id || v4() };

    if ((selectedMap || {}).document) {
      const { document } = selectedMap;
      newState = { ...newState, ...document };
    }

    this.setState(newState);
  };

  handleMapPreviewClosed = viewport => {
    const { latitude, longitude, zoom } = viewport;
    this.setState(
      {
        lat: latitude.toFixed(5),
        lng: longitude.toFixed(5),
        defaultZoom: Math.floor(zoom),
        mapPreviewOpen: false
      },
      this.validateForm
    );
  };

  validateForm = () => {
    const {
      accountId,
      name,
      apiKey,
      refreshInterval,
      lat,
      lng,
      defaultZoom
    } = this.state;

    const newState = {};
    let formIsValid = true;

    if (!accountId) {
      formIsValid = false;
    }

    if (!name || name === '') {
      formIsValid = false;
    }

    if (!apiKey || apiKey === '') {
      formIsValid = false;
    }

    if (refreshInterval && refreshInterval < 5) {
      newState.refreshIntervalError = 'Value must be greater than 5';
      formIsValid = false;
    } else {
      newState.refreshIntervalError = false;
    }

    if ((lat && lat < -90) || lat > 90) {
      newState.latError = 'Value must be between -90 and 90';
      formIsValid = false;
    } else {
      newState.latError = false;
    }

    if ((lng && lng < -180) || lng > 180) {
      newState.lngError = 'Value must be between -180 and 180';
      formIsValid = false;
    } else {
      newState.lngError = false;
    }

    if (defaultZoom && (defaultZoom < 0 || defaultZoom > 24)) {
      newState.defaultZoomError = 'Value must be between 1 and 24';
      formIsValid = false;
    } else {
      newState.defaultZoomError = false;
    }

    this.setState(newState);
    return formIsValid;
  };

  handleCancel = updateMapContext => {
    this.setState(defaultState, () =>
      updateMapContext({ createMapModalOpen: false })
    );
  };

  handleSubmit = async () => {
    const { handleFormSubmit } = this.props;

    if (!this.validateForm()) {
      return;
    }

    const {
      name,
      mapStyle,
      refreshInterval,
      apiKey,
      lat,
      lng,
      defaultZoom,
      accountId,
      id
    } = this.state;

    handleFormSubmit({
      name,
      mapStyle: mapStyle || DEFAULT_MAP_STYLE,
      refreshInterval: refreshInterval || 30,
      apiKey,
      lat,
      id,
      lng,
      defaultZoom,
      accountId
    });
  };

  handleFieldChange = (e, { id, value }) => {
    this.setState({ [id]: value }, this.validateForm);
  };

  render() {
    const {
      name,
      mapStyle,
      lat,
      lng,
      latError,
      lngError,
      defaultZoom,
      refreshInterval,
      refreshIntervalError,
      defaultZoomError,
      apiKey,
      mapPreviewOpen
    } = this.state;

    const {
      updateMapContext,
      //   updateFormState,
      handleMapDelete,
      selectedMap,
      formSubmitting,
      availableAccounts
    } = this.props;

    const mapStyleOptions = MAP_STYLES.map(s => ({
      key: s,
      text: s,
      value: s
    }));

    const accountOptions = (availableAccounts || []).map(
      ({ accountId, name }) => ({
        key: accountId,
        text: `${name} (${accountId})`,
        value: accountId
      })
    );

    const isUpdate = selectedMap?.document;

    return (
      <>
        <MapPreviewModal
          mapPreviewOpen={mapPreviewOpen}
          apiKey={apiKey}
          mapStyle={mapStyle}
          lat={lat}
          lng={lng}
          zoom={defaultZoom}
          onClose={this.handleMapPreviewClosed}
          onSubmit={this.handleMapPreviewClosed}
        />
        <Form loading={formSubmitting}>
          <Form.Group>
            {!isUpdate && (
              <Form.Select
                label="Account"
                width={4}
                required
                placeholder="Choose an account"
                options={accountOptions}
                onChange={this.handleFieldChange}
                id="accountId"
              />
            )}
            <Form.Input
              label="Name"
              width={!isUpdate ? 4 : 6}
              required
              value={name}
              id="name"
              onChange={this.handleFieldChange}
            />
            <Form.Select
              label="Theme"
              width={!isUpdate ? 6 : 8}
              placeholder="Default: light-v8"
              options={mapStyleOptions}
              onChange={this.handleFieldChange}
              id="mapStyle"
              value={mapStyle}
            />
            <Form.Input
              label="Refresh interval (s)"
              width={2}
              error={refreshIntervalError}
              placeholder="Default: 30s"
              type="number"
              min={5}
              value={refreshInterval}
              onChange={this.handleFieldChange}
              id="refreshInterval"
            />
          </Form.Group>
          {!isUpdate && (
            <Form.Group>
              <Form.Input
                width={16}
                label="Mapbox API Key"
                required
                value={apiKey}
                onChange={this.handleFieldChange}
                id="apiKey"
              />
            </Form.Group>
          )}
          <Form.Group widths="equal">
            <Form.Input
              label="Latitude"
              type="number"
              min={-90}
              max={90}
              step="any"
              value={lat}
              error={latError}
              onChange={this.handleFieldChange}
              id="lat"
            />
            <Form.Input
              label="Longitude"
              type="number"
              min={-180}
              max={180}
              step="any"
              value={lng}
              error={lngError}
              onChange={this.handleFieldChange}
              id="lng"
            />
            <Form.Input
              label="Default Zoom"
              type="number"
              min={1}
              max={24}
              error={defaultZoomError}
              value={defaultZoom}
              onChange={(e, { id, value }) =>
                this.handleFieldChange(e, { id, value: parseFloat(value) })
              }
              id="defaultZoom"
            />
            <div>
              <label>&nbsp;</label>
              <Icon
                style={{ lineHeight: '1.5em' }}
                name="globe"
                size="big"
                link
                onClick={() => this.setState({ mapPreviewOpen: true })}
              />
            </div>
          </Form.Group>
          <Form.Group style={{ float: 'right' }}>
            <Form.Button
              negative
              onClick={() => this.handleCancel(updateMapContext)}
            >
              Cancel
            </Form.Button>
            <Form.Button primary positive onClick={this.handleSubmit}>
              Submit
            </Form.Button>
            {isUpdate && (
              <div style={{ margin: 'auto' }}>
                <Form.Field
                  as={Icon}
                  name="trash"
                  link
                  size="big"
                  color="red"
                  onClick={() => handleMapDelete(selectedMap)}
                />
              </div>
            )}
          </Form.Group>
        </Form>
      </>
    );
  }
}
