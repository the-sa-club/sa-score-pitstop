import styled from "styled-components";
import { PALETTE } from "../../constants";

export const Button = styled.div`
  padding: 8px 16px;
  border-radius: 4px;
  height: 34px;
  background-color: ${PALETTE.CLUB_RED};
  color: ${PALETTE.FONT_COLOR};
  cursor: pointer;
  &:active {
    background-color: ${PALETTE.CLUB_RED_HOVER};
  }
`;


export const RefreshButton = styled.button`
border: 1px solid ${PALETTE.CLUB_RED};
color: ${PALETTE.CLUB_RED};
font-size: ${PALETTE.FONT_SM};
padding: 12px 20px;
cursor: pointer;
transition: all 0.3s ease;
background-color: transparent;
display: flex;
align-items: center;
justify-content: space-between;
border-radius: 4px;

&:hover {
  color: ${PALETTE.CLUB_RED_HOVER};
  border: 1px solid ${PALETTE.CLUB_RED_HOVER};
}

@media ${PALETTE.DEVICE.mobileL} {
  margin-top: 20px;
  margin-left: 8px;
}
`;