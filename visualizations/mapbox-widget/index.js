import React from 'react';
import GeoOps from '../../shared/geoops';

export default class GeoOpsWidget extends React.Component {
  render() {
    return <GeoOps isWidget vizConfig={this.props} />;
  }
}
