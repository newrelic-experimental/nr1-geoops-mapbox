import styled from 'styled-components';
import { Stack, StackItem } from 'nr1';

export const MapContainer = styled(Stack)`
  height: calc(100% - 74px) !important;
  position: relative;
  overflow: hidden;
`;

export const LocationsTableContainer = styled(StackItem)`
  width: 340px;
  height: 100%;
  position: relative;
  z-index: 1000;
  background-color: #fff;
  border-top: 1px solid #e3e4e4;

  .react-bootstrap-table {
    overflow: scroll;
  }

  .sortable:first-child {
    padding: 0;
  }
`;

export const PrimaryContentContainer = styled(StackItem)`
  width: 500px;
  height: 100%;
`;
