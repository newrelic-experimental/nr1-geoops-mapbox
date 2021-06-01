export const V3_MAP_COLLECTION_ID = 'v3-maps-collection';

export const ALERT_LEVELS = {
  NOT_CONFIGURED: 0,
  NOT_ALERTING: 1,
  WARNING: 2,
  CRITICAL: 3
};

export const MAP_STYLES = [
  'mapbox://styles/mapbox/basic-v9',
  'mapbox://styles/mapbox/streets-v10',
  'mapbox://styles/mapbox/satellite-v9',
  'mapbox://styles/mapbox/bright-v9',
  'mapbox://styles/mapbox/dark-v10',
  'mapbox://styles/mapbox/light-v10'
].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)); //eslint-disable-line

export const DEFAULT_MAP_STYLE = 'mapbox://styles/mapbox/light-v10';
