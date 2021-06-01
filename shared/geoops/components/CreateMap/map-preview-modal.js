import React from 'react';
import ReactMapGL from 'react-map-gl';
import { Button, Form, Modal } from 'semantic-ui-react';

export default class MapPreviewModal extends React.PureComponent {
  state = {
    viewport: {
      latitude: parseFloat(this.props.lat) || -26.39734,
      longitude: parseFloat(this.props.lng) || 109.455475,
      width: 'auto',
      height: '80vh',
      zoom: this.props.zoom || 4
    }
  };

  mapRef = React.createRef(); //eslint-disable-line

  componentDidMount = () => {
    const { lat, lng, zoom } = this.props;

    this.setState({
      latitude: parseFloat(lat) || -26.39734,
      longitude: parseFloat(lng) || 109.455475,
      zoom: defaultZoom || 4
    });
  };

  componentDidUpdate = () => {
    const { lat, lng, zoom } = this.props;

    this.setState({
      latitude: parseFloat(lat) || -26.39734,
      longitude: parseFloat(lng) || 109.455475,
      zoom: defaultZoom || 4
    });
  };

  render() {
    const { viewport } = this.state;

    const { mapPreviewOpen, apiKey, onClose, mapStyle } = this.props;

    return (
      <>
        <Modal
          dimmer="blurring"
          closeIcon
          open={mapPreviewOpen}
          onClose={() => onClose(viewport)}
          size="fullscreen"
          style={{ left: 0, right: 0 }}
        >
          <Modal.Header>Map Preview</Modal.Header>
          <Modal.Content style={{ height: '100%', width: '100%' }}>
            <ReactMapGL
              {...viewport}
              onViewportChange={viewport => this.setState({ viewport })}
              mapboxApiAccessToken={apiKey}
              ref={this.mapRef}
              mapStyle={mapStyle || 'mapbox://styles/mapbox/light-v8'}
            />
            <Form.Group style={{ float: 'right', padding: '10px 0' }}>
              <Button positive primary onClick={() => onClose(viewport)}>
                Select
              </Button>
            </Form.Group>
          </Modal.Content>
        </Modal>
      </>
    );
  }
}
