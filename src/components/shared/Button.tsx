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
