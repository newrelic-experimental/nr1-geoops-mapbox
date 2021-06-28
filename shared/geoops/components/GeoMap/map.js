import React from 'react';
import { Grid, Message } from 'semantic-ui-react';
import ReactMapGL, { FlyToInterpolator } from 'react-map-gl';
import { calculateZoomLevel } from '../../context/utils';

export default class Map extends React.PureComponent {
  constructor(props) {
    super(props);
    const { lat, lng, defaultZoom, apiKey, mapStyle } =
      props.selectedMap?.document || {};

    this.mapRef = React.createRef();

    console.log(props);

    this.state = {
      error: apiKey ? false : 'Error: API Key not found. Check map config',
      apiKey: apiKey,
      mapStyle: mapStyle || 'mapbox://styles/mapbox/light-v10',
      fullscreen: props.fullscreen,
      viewport: {
        latitude: parseFloat(props.lat) || parseFloat(lat) || 0,
        longitude: parseFloat(props.lng) || parseFloat(lng) || 0,
        width: props.width || '100%',
        height: props.height || '95vh',
        zoom: parseFloat(props.zoom) || defaultZoom || 4
      }
    };
  }

  componentDidUpdate = newProps => {
    const { selectedLocation, width, height } = this.props;
    const { viewport } = this.state;

    if (viewport.width !== width || viewport.height !== height) {
      viewport.height = height;
      viewport.width = width;
      // eslint-disable-next-line
      this.setState({ viewport });
    }

    if (selectedLocation && !this.state.selectedLocation) {
      this.updateSelectedLocation(selectedLocation);
    }

    if (newProps.fullscreen && newProps.fullscreen !== this.state.fullscreen) {
      // eslint-disable-next-line
      this.setState({ fullscreen: newProps.fullscreen });
    }
  };

  updateSelectedLocation = selectedLocation => {
    const { selectedMap, updateMapState } = this.props;

    this.setState({ selectedLocation }, () => {
      if (selectedLocation.guid) {
        const { lat, lng } = selectedLocation?.location || {};

        const { properties } = (selectedMap?.geojson?.features || []).find(
          f => f.properties.guid === selectedLocation.guid
        );

        updateMapState({
          showPopup: properties,
          popupData: {
            properties: properties || undefined,
            lat: parseFloat(lat),
            lng: parseFloat(lng)
          }
        }).then(() => this.moveViewport(lat, lng, 14));
      } else {
        const { lat, lng, zoom } = selectedLocation;

        this.moveViewport(lat, lng, zoom || 14);
      }
    });
  };

  moveViewport = async (lat, lng, zoom, duration) => {
    const { updateMapContext } = this.props;
    const cViewport = this.state.viewport;
    const viewport = {
      ...cViewport,
      longitude: parseFloat(lng),
      latitude: parseFloat(lat),
      zoom: zoom || 12,
      transitionDuration: duration || 3000,
      transitionInterpolator: new FlyToInterpolator()
    };

    await updateMapContext({ selectedLocation: null });

    this.setState({ viewport, selectedLocation: null });
  };

  handleMapClick = (map, isHover) => {
    const { updateMapState, updateMapContext } = this.props;

    const filteredFeatures = (map.features || []).filter(
      ({ layer }) => layer.id === 'unclustered-point'
    );

    const filteredClusters = (map.features || []).filter(
      ({ layer }) => layer.id === 'clusters'
    );

    if (filteredFeatures.length) {
      const feature = filteredFeatures[0];

      if (feature.properties && feature.properties.location) {
        const { geojson } = this.props.selectedMap;
        const { properties } = geojson.features.find(
          gFeature => gFeature.properties.name === feature.properties.name
        );

        updateMapState({
          showPopup: true,
          popupData: {
            properties: properties,
            lat: parseFloat(properties.location.lat),
            lng: parseFloat(properties.location.lng)
          }
        });

        if (!isHover) {
          this.moveViewport(
            properties.location.lat,
            properties.location.lng,
            14
          );
          updateMapContext({ fullscreen: true });
        }
      }
    } else if (filteredClusters.length) {
      if (!isHover) {
        const [lng, lat] = map.lngLat;
        const { point_count } = filteredClusters[0].properties;
        const zoomLevel = calculateZoomLevel(
          point_count,
          this.state.viewport.zoom
        );
        this.moveViewport(lat, lng, zoomLevel);
        updateMapContext({ fullscreen: true });
      } else {
        updateMapState({ showPopup: false });
      }
    }

    if (!filteredFeatures.length && !filteredClusters.length) {
      if (!isHover) {
        updateMapContext({ fullscreen: true }).then(() =>
          updateMapState({ showPopup: false, popupData: {} })
        );
      }
    }
  };

  handleViewportChanged = (viewport, updateMapContext) => {
    const { latitude, longitude, zoom } = viewport;
    // eslint-disable-next-line
    this.setState({ viewport: { ...this.state.viewport, ...viewport } }, () =>
      updateMapContext({ currentViewport: { latitude, longitude, zoom } })
    );
  };

  render() {
    const { updateMapContext } = this.props;
    const { error, viewport, apiKey, mapStyle } = this.state;

    if (error) {
      return (
        <Grid.Row stretched={false}>
          <Message negative>{error}</Message>
        </Grid.Row>
      );
    }

    return (
      <ReactMapGL
        {...viewport}
        ref={this.mapRef}
        mapboxApiAccessToken={apiKey}
        mapStyle={mapStyle}
        onViewportChange={viewport =>
          this.handleViewportChanged(viewport, updateMapContext)
        }
        onClick={this.handleMapClick}
        onHover={map => this.handleMapClick(map, true)}
      >
        {this.props.children}
      </ReactMapGL>
    );
  }
}
