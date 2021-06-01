import {
  AccountStorageMutation,
  AccountStorageQuery,
  NerdGraphQuery,
  NerdGraphMutation,
  NrqlQuery
} from 'nr1';

import { ALERT_LEVELS } from './constants';

export const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );

export const createAndTagWorkloads = async (mapId, locations) => {
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

  await Promise.all(workloadPromises);
};

export const getAccounts = () => {
  return NerdGraphQuery.query({
    query: `
        {
          actor {
            accounts {
              accountId:id
              name
            }
          }
        }
      `,
    fetchPolicyType: NerdGraphQuery.FETCH_POLICY_TYPE.NO_CACHE
  }).then(({ data, errors }) => {
    if (errors) return errors;
    return ((data.actor || {}).accounts || []).map(({ accountId, name }) => ({
      accountId,
      name
    }));
  });
};

export const getWorkloadsForMap = async (accountId, mapId) => {
  const doWorkloadQuery = (nextCursor = null, workloads = []) => {
    const query = `
        {
          actor {
            entitySearch(query: "accountId=${accountId} AND tags.geomaps.mapId = '${mapId}' AND type = 'WORKLOAD'") {
              results ${
                nextCursor !== null ? `(cursor: "${nextCursor}")` : ''
              } {
                entities {
                  name
                  guid
                }
                nextCursor
              }
            }
          }
        }
      `;

    return NerdGraphQuery.query({ query }).then(({ data, errors }) => {
      if (errors) {
        console.log('Error:', JSON.stringify(errors)); //eslint-disable-line
        return;
      }
      const { entities, nextCursor } =
        ((data.actor || {}).entitySearch || {}).results || {};
      workloads = [...workloads, ...entities];
      if (nextCursor) {
        return doWorkloadQuery(nextCursor, workloads);
      }
      return workloads;
    });
  };

  const workloads = await doWorkloadQuery();

  const workloadGuids = workloads.map(({ guid }) => guid);

  const entityChunks = chunk([...new Set(workloadGuids)], 25);

  const values = await Promise.all(
    entityChunks.map(chunk =>
      NerdGraphQuery.query({
        query: entitySummaryQuery(`"${chunk.join(`","`)}"`)
      })
    )
  )
    .then(values => values.map(v => v?.data?.actor?.entities || []).flat())
    .then(values => {
      return values.map(value => {
        const location = {};
        value.tags
          .filter(({ key }) => key.includes('geomaps.'))
          .forEach(({ key, values }) => {
            const keyname = key.split('.')[1];
            location[keyname] = values[0];
          });
        return { ...value, location };
      });
    });

  const newValues = [...values];

  newValues.forEach((item, itemIndex) => {
    newValues[itemIndex].alertLevel = ALERT_LEVELS[item.alertSeverity];
    newValues[itemIndex].alertHighest = item.alertSeverity;
    (item?.relationships || []).forEach(r => {
      const alertValue = r?.target?.entity?.alertSeverity || null;
      const nestedAlertSeverity = ALERT_LEVELS[alertValue] || 0;
      if (nestedAlertSeverity > newValues[itemIndex].alertLevel) {
        newValues[itemIndex].alertLevel = nestedAlertSeverity;
        newValues[itemIndex].alertHighest = alertValue;
      }
    });
  });

  return newValues;
};

export const getAccountCollection = (accountId, collection, documentId) => {
  const payload = { accountId, collection, documentId };
  return AccountStorageQuery.query(payload).then(({ data }) => data || []);
};

export const writeAccountCollection = async (
  accountId,
  collection,
  documentId,
  payload
) => {
  const result = await AccountStorageMutation.mutate({
    accountId,
    actionType: AccountStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
    collection,
    documentId,
    document: payload
  });
  return result;
};

export const deleteAccountCollection = async (
  accountId,
  collection,
  documentId
) => {
  const result = await AccountStorageMutation.mutate({
    accountId,
    actionType: AccountStorageMutation.ACTION_TYPE.DELETE_DOCUMENT,
    collection,
    documentId
  });
  return result;
};

export const citiesToGeoJson = async (cities = [], apiKey, timestamp) => {
  const features = await Promise.all(
    cities.map(city => {
      return cityToGeojson(city.name, apiKey)
        .then(r => r.json())
        .then(({ features }) => ({
          ...features[0],
          properties: { ...features[0].properties, ...city }
        }));
    })
  );

  const geojson = {
    type: 'FeatureCollection',
    timestamp: timestamp || new Date().getTime(),
    features
  };

  return geojson;
};

export const docToGeoJson = (
  workloads = [],
  timestamp = new Date().getTime()
) => {
  const geojson = {
    type: 'FeatureCollection',
    timestamp: timestamp,
    features: workloads.map((item, i) => {
      return {
        type: 'Feature',
        index: i,
        geometry: {
          type: 'Point',
          coordinates: [
            parseFloat(item.location.lng),
            parseFloat(item.location.lat)
          ]
        },
        properties: {
          index: i,
          name: item.name,
          ...item
        }
      };
    })
  };

  return geojson;
};

export const buildMapOptions = maps => {
  maps.forEach(map => {
    map.key = map.id;
    map.label = ((map.document || {}).name || '').replace(/\+/g, ' ');
    map.text = ((map.document || {}).name || '').replace(/\+/g, ' ');
    map.value = ((map.document || {}).name || '').replace(/\+/g, ' ');
  });
  return maps;
};

export const calculateZoomLevel = (pointCount, currentZoom) => {
  switch (true) {
    case pointCount >= 150 && currentZoom < 3:
      return 3;
    case pointCount >= 100 && currentZoom < 5:
      return 5;
    case pointCount >= 50 && currentZoom < 7:
      return 7;
    case pointCount >= 25 && currentZoom < 8:
      return 8;
    case pointCount >= 5 && currentZoom < 10:
      return 10;
    default:
      return currentZoom + 3;
  }
};

export const recentAlertsQuery = guids => `{
  actor {
    entities(guids: [${guids}]) {
      name
      guid
      domain
      type
      entityType
      ... on AlertableEntity {
        alertSeverity
        recentAlertViolations(count: 10) {
          violationUrl
          violationId
          level
          openedAt
          label
          closedAt
          agentUrl
          alertSeverity
        }
      }
    }
  }
}`;

export const entitySummaryQuery = guids => `
{
actor {
  entities(guids: [${guids}]) {
    guid
    name
    type
    domain
    tags {
      key
      values
    }
    entityType
    ... on AlertableEntity {
      alertSeverity
      recentAlertViolations {
        alertSeverity
        agentUrl
        closedAt
        label
        level
        openedAt
        violationId
        violationUrl
      }
    }
    ... on WorkloadEntity {
      workloadStatus {
        statusSource
        statusValue
        summary
        description
      }
      relationships {
        target {
          entity {
            guid
            name
            ... on AlertableEntityOutline {
              alertSeverity
            }
            entityType
            domain
            type
          }
        }
      }
    }
  }
}
}`;

export const doNrqlQuery = (accountId, query) => {
  return NrqlQuery.query({
    accountId,
    query,
    formatType: NrqlQuery.FORMAT_TYPE.RAW
  });
};

export const cityToGeojson = (city, apiKey) => {
  return fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${city}.json?access_token=${apiKey}`
  );
};
