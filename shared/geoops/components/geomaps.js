import React from 'react';
import { DataConsumer } from '../context/data';
import CreateMap from './CreateMap';
import MapList from './MapList';
import ViewMap from './ViewMap';
import MenuBar from './MenuBar';
import { Spinner, Card, CardBody, HeadingText } from 'nr1';
import CustomQuery from './CustomQuery';
import Favorites from './Favorites';

export default class GeoOpsContainer extends React.Component {
  render() {
    return (
      <DataConsumer>
        {({
          isWidget,
          vizConfig,
          selectedMap,
          createMapModalOpen,
          queryModalOpen,
          favoritesModalOpen,
          //   updateMapContext,
          //   fullscreenMode,
          loadingGeomaps,
          availableMaps
        }) => {
          if (isWidget) {
            const mapLoaded = selectedMap?.mapLoaded;
            const mapName = vizConfig?.mapName || '';
            const errors = [];
            const mapDocument = availableMaps.find(
              m =>
                (m?.document?.name || '').toLowerCase() ===
                mapName.toLowerCase()
            );

            if (!mapName) {
              errors.push('Please enter Map Name');
            } else if (!mapDocument) {
              errors.push(`Unable to find map name: ${mapName}`);
            }

            if (!mapLoaded && mapDocument) {
              errors.push('Loading map...');
            }

            return (
              <>
                {(loadingGeomaps || (!mapLoaded && mapDocument)) && <Spinner />}

                {createMapModalOpen && <CreateMap />}
                {queryModalOpen && <CustomQuery />}
                {favoritesModalOpen && <Favorites />}

                <MenuBar />

                {errors.length > 0 ? (
                  EmptyState(errors, availableMaps)
                ) : (
                  <ViewMap />
                )}
              </>
            );
          }

          return (
            <>
              {createMapModalOpen && <CreateMap />}
              {queryModalOpen && <CustomQuery />}
              {favoritesModalOpen && <Favorites />}

              <MenuBar />

              {selectedMap?.document ? <ViewMap /> : <MapList />}
            </>
          );
        }}
      </DataConsumer>
    );
  }
}

const EmptyState = (errors, maps) => (
  <Card className="EmptyState">
    <CardBody className="EmptyState-cardBody">
      <br />
      <HeadingText
        spacingType={[HeadingText.SPACING_TYPE.LARGE]}
        type={HeadingText.TYPE.HEADING_3}
      >
        Please amend any errors and supply the base configuration...
      </HeadingText>
      <div>
        {errors.map((error, i) => {
          return (
            <HeadingText
              key={i}
              spacingType={[HeadingText.SPACING_TYPE.MEDIUM]}
              type={HeadingText.TYPE.HEADING_4}
            >
              {error}
            </HeadingText>
          );
        })}
      </div>

      <br />
      <HeadingText
        spacingType={[HeadingText.SPACING_TYPE.LARGE]}
        type={HeadingText.TYPE.HEADING_3}
      >
        Available Maps
      </HeadingText>
      <div>
        {maps.map((map, i) => {
          return (
            <HeadingText
              key={i}
              spacingType={[HeadingText.SPACING_TYPE.MEDIUM]}
              type={HeadingText.TYPE.HEADING_4}
            >
              {map.document.name}
            </HeadingText>
          );
        })}
      </div>
    </CardBody>
  </Card>
);
