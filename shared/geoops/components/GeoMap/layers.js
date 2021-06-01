export const clusterLayer = {
  id: 'clusters',
  type: 'circle',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': [
      'step',
      ['get', 'maxAlertLevel'],
      '#9adced',
      0,
      '#9adced',
      1,
      '#70e65c',
      2,
      '#fa9a2d',
      3,
      '#d94545'
    ],
    'circle-radius': [
      'step',
      ['get', 'point_count'],
      20,
      100,
      30,
      700,
      40,
      1000,
      50
    ]
  }
};

export const clusterCountLayer = {
  id: 'cluster-count',
  type: 'symbol',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': 12
  }
};

// const alertLevels = {
//   UNCONFIGURED: 0,
//   NOT_ALERTING: 1,
//   WARNING: 2,
//   CRITICAL: 3
// };

export const heatmapCountLayer = {
  id: 'heatmap-count',
  type: 'symbol',
  filter: ['has', 'count'],
  layout: {
    'text-field': '{count}',
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': 12
  }
};

export const heatmapPointLayer = {
  id: 'heatmap-point',
  type: 'circle',
  filter: ['has', 'count'],
  paint: {
    'circle-color': '#33ccff',
    'circle-radius': [
      'case',
      ['<', ['get', 'count'], 5],
      5,
      ['all', ['>=', ['get', 'count'], 5], ['<', ['get', 'count'], 20]],
      10,
      ['all', ['>=', ['get', 'count'], 20], ['<', ['get', 'count'], 50]],
      15,
      ['all', ['>=', ['get', 'count'], 50], ['<', ['get', 'count'], 150]],
      20,
      ['>=', ['get', 'count'], 150],
      30,
      5
    ],
    'circle-stroke-width': 2,
    'circle-stroke-color': '#fff'
  }
};

export const unclusteredPointLayer = {
  id: 'unclustered-point',
  type: 'circle',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': [
      'step',
      ['get', 'alertLevel'],
      '#000',
      0,
      '#000',
      1,
      '#70e65c',
      2,
      '#fa9a2d',
      3,
      '#d94545'
    ],
    'circle-radius': {
      base: 8,
      stops: [
        [12, 8],
        [14, 16],
        [16, 32],
        [18, 64],
        [20, 128]
      ]
    },
    'circle-stroke-width': 2,
    'circle-stroke-color': '#fff'
  }
};

export const threeDLayer = {
  id: '3d-buildings',
  source: 'composite',
  'source-layer': 'building',
  filter: ['==', 'extrude', 'true'],
  type: 'fill-extrusion',
  minzoom: 15,
  paint: {
    'fill-extrusion-color': '#aaa',

    // use an 'interpolate' expression to add a smooth transition effect to the
    // buildings as the user zooms in
    'fill-extrusion-height': [
      'interpolate',
      ['linear'],
      ['zoom'],
      15,
      0,
      15.05,
      ['get', 'height']
    ],
    'fill-extrusion-base': [
      'interpolate',
      ['linear'],
      ['zoom'],
      15,
      0,
      15.05,
      ['get', 'min_height']
    ],
    'fill-extrusion-opacity': 0.6
  }
};
