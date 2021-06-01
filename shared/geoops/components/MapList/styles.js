import { Button, StackItem, Icon, Grid } from 'nr1';
import styled from 'styled-components';

export const MapItemContainer = styled.div`
  background: #ffffff;
  box-shadow: 0px 1px 0px rgba(0, 75, 82, 0.11),
    0px 3px 0px rgba(0, 49, 54, 0.04), 0px 1px 3px rgba(0, 134, 148, 0.03),
    0px 4px 4px rgba(70, 107, 111, 0.05);
  border-radius: 3px;
  transition: all 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  :hover {
    cursor: pointer;
    transform: translateY(-3px);
    box-shadow: 0 8px 15px 5px rgba(31, 75, 116, 0.075),
      0 1px 3px 1px rgba(0, 134, 148, 0.05), 0 3px 0 0 rgba(0, 49, 54, 0.05),
      0 1px 0 0 rgba(0, 75, 82, 0.15);
  }
`;

export const MapPreviewContainer = styled.section`
  width: 100%;
  height: 9vw;
  position: relative;
  border-radius: 3px 3px 0 0;
  overflow: hidden;

  .leaflet-wrapper {
    pointer-events: none;
  }

  .leaflet-control-zoom,
  .leaflet-control-attribution {
    display: none;
  }

  & > h1 {
    display: none;
  }
`;

export const MapPreview = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.65);
  opacity: 0;
  transition: opacity 0.1s cubic-bezier(0.075, 0.82, 0.165, 1);

  ${MapItemContainer}:hover & {
    opacity: 1;
  }
`;

export const MapMetaContainer = styled(StackItem)`
  margin-right: auto;

  h4 {
    margin-bottom: 2px;
    margin-top: 0;
  }

  h6 {
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 12px;
    line-height: 16px;
    color: #8e9494;
    font-weight: 400;
  }
`;

export const DropdownContainer = styled.div`
  position: relative;
`;

export const Dropdown = styled.ul`
  display: ${({ isVisible }) => (isVisible ? 'block' : 'none')};
  width: 150px;
  position: absolute;
  top: -67px;
  right: 34px;
  background: #ffffff;
  border: 1px solid #e3e4e4;
  box-sizing: border-box;
  box-shadow: 0px 16px 32px rgba(0, 13, 13, 0.2),
    0px 16px 32px rgba(0, 0, 0, 0.04);
  border-radius: 4px;
  list-style-type: none;
  text-align: left;
  z-index: 10000;
`;

export const DropdownOption = styled.li`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  color: ${({ isDestructive }) => (isDestructive ? '#bf0016' : '#000d0d')};
  padding: 8px 8px;
  line-height: 16px;
  border-bottom: 1px solid #e3e4e4;

  :last-child {
    border: none;
  }

  :hover {
    cursor: pointer;
  }
`;

export const StyledIcon = styled(Icon)`
  margin-right: 8px;
  position: relative;
  bottom: 1px;
`;

export const MapItemBottom = styled(StackItem)`
  display: flex;
  align-items: center;
  height: 70px;
  padding: 0 16px;
`;

export const ViewMapButton = styled(Button)`
  transition: all 0.5s cubic-bezier(0.075, 0.82, 0.165, 1);
  transform: translateY(-5px);
  opacity: 0;

  ${MapItemContainer}:hover & {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const StyledGrid = styled(Grid)`
  padding: 24px;
  background-color: #f4f5f5;
  height: calc(100% - 74px);

  div.map-grid {
    grid-gap: 16px;
  }
`;

export const AddNewMapButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: calc(9vw + 70px);
  border: 3px dashed #d5d7d7;
  border-radius: 4px;
  transition: all 0.05s ease-out;

  &:hover {
    cursor: pointer;
    border-color: #b9bdbd;
    transform: translateY(-2px);

    svg {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(1px);
  }

  svg {
    opacity: 0.75;
    transition: all 0.15s ease-out;
  }
`;
