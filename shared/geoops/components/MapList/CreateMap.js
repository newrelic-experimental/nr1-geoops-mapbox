import React from 'react';

import { Modal, Form } from 'semantic-ui-react';
import { DataConsumer } from '../../context/data';

export default class CreateMap extends React.PureComponent {
  state = {
    name: ''
    // mapStyle: '',
    // lat: null,
    // lng: null,
    // defaultZoom: null,
    // accountId: 2564753
  };

  render() {
    const { name } = this.state;

    return (
      <DataConsumer>
        {({ createMapModalOpen, updateMapContext }) => {
          return (
            <>
              <Modal
                dimmer="inverted"
                closeIcon
                size="large"
                open={createMapModalOpen}
                onClose={() =>
                  updateMapContext({ createMapModalOpen: !createMapModalOpen })
                }
              >
                <Modal.Header>Create Map</Modal.Header>
                <Modal.Content>
                  <Form>
                    <Form.Group>
                      <Form.Input
                        width="4"
                        label="Map Name"
                        value={name}
                        onChange={(e, d) => this.setState({ name: d.value })}
                      />
                    </Form.Group>
                  </Form>
                </Modal.Content>
              </Modal>
            </>
          );
        }}
      </DataConsumer>
    );
  }
}
