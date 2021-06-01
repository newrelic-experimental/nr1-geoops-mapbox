import React from 'react';
import { Form, Icon, Input, Modal, Table } from 'semantic-ui-react';

export default class MapFiltersModal extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      location: ''
    };
  }

  render() {
    const { filters, updateState, mapFiltersModalOpen } = this.props;
    const { name, location } = this.state;

    return (
      <Modal
        dimmer="blurring"
        closeIcon
        onClose={() => updateState({ mapFiltersModalOpen: false })}
        open={mapFiltersModalOpen}
        size="large"
      >
        <Modal.Header>Map Filters</Modal.Header>
        <Modal.Content>
          <Form.Group>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Name</Table.HeaderCell>
                  <Table.HeaderCell>Location</Table.HeaderCell>
                  <Table.HeaderCell>&nbsp;</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {(filters || []).map((filter, i) => (
                  <Table.Row key={filter.name}>
                    <Table.Cell>{filter.name}</Table.Cell>
                    <Table.Cell>{filter.location}</Table.Cell>
                    <Table.Cell>
                      <Icon
                        name="delete"
                        link
                        onClick={() => {
                          updateState({
                            filters: filters.filter((e, f) => f !== i)
                          });
                        }}
                      />
                    </Table.Cell>
                  </Table.Row>
                ))}
                <Table.Row>
                  <Table.Cell>
                    <Form.Input
                      fluid
                      onChange={(e, { value }) =>
                        this.setState({ name: value })
                      }
                      placeholder="Filter name..."
                      value={name}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Input
                      fluid
                      onChange={(e, { value }) =>
                        this.setState({ location: value })
                      }
                      placeholder="Item location.. ie: location.lat"
                      value={location}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Icon
                      name="plus"
                      link
                      onClick={() => {
                        updateState({
                          filters: [...filters, { name, location }]
                        });
                        this.setState({ name: '', location: '' });
                      }}
                    />
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
          </Form.Group>
        </Modal.Content>
      </Modal>
    );
  }
}
