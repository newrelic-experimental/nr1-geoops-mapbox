import React from 'react';
import { StackItem } from 'nr1';

import { Icon } from 'semantic-ui-react';

import {
  MapItemBottom,
  MapItemContainer,
  MapMetaContainer,
  MapPreview,
  MapPreviewContainer,
  ViewMapButton
} from './styles';

import PreviewMap from '../GeoMap/map-preview';

export default class MapItem extends React.PureComponent {
  render() {
    const { map, handleSelectMap, updateMapContext } = this.props;

    const mapItemHeader =
      map?.document?.title || map?.document?.name || map?.id;

    const { lat, lng, mapStyle, apiKey } = map?.document || {};

    return (
      <MapItemContainer key={map.guid} onClick={() => handleSelectMap(map)}>
        <MapPreviewContainer>
          <PreviewMap lat={lat} lng={lng} mapStyle={mapStyle} apiKey={apiKey} />
          <MapPreview>
            <ViewMapButton onClick={() => handleSelectMap(map)}>
              View Map
            </ViewMapButton>
          </MapPreview>
        </MapPreviewContainer>
        <MapItemBottom>
          <MapMetaContainer>
            <h4>{mapItemHeader}</h4>
            <h6>{map.description || 'No Description'}</h6>
          </MapMetaContainer>
          <StackItem>
            <Icon
              name="cog"
              link
              onClick={() =>
                updateMapContext({ createMapModalOpen: true, selectedMap: map })
              }
            />
          </StackItem>
        </MapItemBottom>
      </MapItemContainer>
    );
  }
}
