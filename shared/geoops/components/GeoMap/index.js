import React from 'react';
import { Layer, Popup, Source } from 'react-map-gl';
import { Modal } from 'nr1';
import {
  clusterCountLayer,
  clusterLayer,
  unclusteredPointLayer
} from './layers';
import ModalContent from './modal-content';
import Map from './map';
import PopupContent from './popup-content';

export default class GeoMap extends React.PureComponent {
  sourceRef = React.createRef(); //eslint-disable-line

  state = {
    modalHidden: true,
    showPopup: false,
    popupData: {
      lat: 0,
      lng: 0
    }
  };

  componentDidMount = () => {
    const { selectedMap, fetchData } = this.props;
    const { refreshInterval } = selectedMap?.document || {};

    const ms = refreshInterval ? parseFloat(refreshInterval) * 1000 : 30000;

    this.mapPoll = setInterval(fetchData, ms);
  };

  componentWillUnmount = () => {
    clearInterval(this.mapPoll);
  };

  renderPopup = () => {
    const { popupData } = this.state;
    return (
      <Popup
        latitude={popupData.lat}
        longitude={popupData.lng}
        closeButton={false}
        closeOnClick={false}
        onClose={() => this.setState({ showPopup: false })}
        anchor="top"
      >
        <PopupContent
          updateMapState={newState => this.setState(newState)}
          popupData={popupData}
        />
      </Popup>
    );
  };

  updateMapState = newState => {
    return new Promise(resolve => {
      this.setState(newState, resolve);
    });
  };

  render() {
    const {
      modalHidden,
      showPopup,
      popupData,
      moveViewport,
      fullscreen
    } = this.state;

    const { selectedMap, selectedLocation, updateMapContext } = this.props;

    const { geojson } = selectedMap;

    return (
      <>
        <Modal
          hidden={modalHidden}
          onClose={() => this.setState({ modalHidden: true })}
        >
          <ModalContent
            updateMapState={state => this.setState(state)}
            popupData={popupData}
            accountId={selectedMap.accountId}
            queries={selectedMap.document.queries}
          />
        </Modal>

        <Map
          selectedMap={selectedMap}
          moveViewport={moveViewport}
          updateMapContext={updateMapContext}
          updateMapState={this.updateMapState}
          selectedLocation={selectedLocation}
          fullscreen={fullscreen}
        >
          {showPopup && this.renderPopup()}

          <Source
            type="geojson"
            id="locations"
            data={geojson}
            cluster
            clusterMaxZoom={12}
            clusterRadius={50}
            clusterProperties={{
              maxAlertLevel: ['max', ['get', 'alertLevel']]
            }}
            ref={this.sourceRef}
          >
            <Layer {...clusterLayer} />
            <Layer {...clusterCountLayer} />
            <Layer {...unclusteredPointLayer} />

            {/* <div style={{position: 'absolute', left: 0}}>
                            <FullscreenControl container={document.querySelector('body')} />
                        </div> */}
          </Source>
        </Map>
      </>
    );
  }
}
