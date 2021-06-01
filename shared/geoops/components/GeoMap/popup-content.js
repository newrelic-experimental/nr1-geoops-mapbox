import React from 'react';
import { Label } from 'semantic-ui-react';

export default class PopupContent extends React.PureComponent {
  render() {
    const { popupData, updateMapState } = this.props;
    const { properties } = popupData;

    if (!properties) {
      return <div>No Content</div>;
    }

    let alertColor = 'grey';

    switch (properties.alertHighest) {
      case 'NOT_ALERTING':
        alertColor = 'green';
        break;
      case 'WARNING':
        alertColor = 'orange';
        break;
      case 'CRITICAL':
        alertColor = 'red';
        break;
    }

    return (
      <div style={{ fontSize: '14px', display: 'inline' }}>
        <div style={{ paddingTop: '5px' }}>
          <Label
            style={{ width: '100%', cursor: 'pointer' }}
            color={alertColor}
            icon="circle"
            content={properties.name}
            detail={properties.alertHighest}
            onClick={() => updateMapState({ modalHidden: false })}
          />
        </div>
      </div>
    );
  }
}
