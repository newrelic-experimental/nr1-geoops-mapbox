import React from 'react';
import { Grid, Icon } from 'semantic-ui-react';
import { DataConsumer } from '../../context/data';
import MapItem from './map-item';
import { AddNewMapButton } from './styles';

export default class MapList extends React.Component {
  render() {
    return (
      <DataConsumer>
        {({
          availableMaps,
          handleSelectMap,
          updateMapContext,
          loadingGeomaps
        }) => {
          if (loadingGeomaps) {
            return (
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
            );
          }

          const mapGridItems = (availableMaps || []).map(map => (
            <Grid.Column key={map.id}>
              <MapItem
                map={map}
                updateMapContext={updateMapContext}
                handleSelectMap={handleSelectMap}
              />
            </Grid.Column>
          ));

          return (
            <>
              <Grid columns={4} padded>
                {mapGridItems}
                <Grid.Column>
                  <AddNewMapButton
                    onClick={() =>
                      updateMapContext({
                        activePage: 'create-map',
                        createMapModalOpen: true
                      })
                    }
                  >
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 48 48"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M47.75 22.375H26V0.625H22.375V22.375H0.625V26H22.375V47.75H26V26H47.75V22.375Z"
                        fill="#B9BDBD"
                      />
                    </svg>
                  </AddNewMapButton>
                </Grid.Column>
              </Grid>
            </>
          );
        }}
      </DataConsumer>
    );
  }
}
