import React from 'react';
import GeoOpsContainer from './components/geomaps';
import { DataProvider } from './context/data';

export default class GeoOps extends React.Component {
  render() {
    const { isWidget, vizConfig } = this.props;

    return (
      <DataProvider isWidget={isWidget} vizConfig={vizConfig}>
        <GeoOpsContainer />
      </DataProvider>
    );
  }
}
