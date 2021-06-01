import React from 'react';
import { StaticMap } from 'react-map-gl';

export default ({ mapStyle, lat, lng, apiKey }) => (
  <StaticMap
    latitude={parseFloat(lat) || 0}
    longitude={parseFloat(lng) || 0}
    width="100vw"
    height="100vh"
    zoom={4}
    mapboxApiAccessToken={apiKey}
    mapStyle={mapStyle}
  />
);
