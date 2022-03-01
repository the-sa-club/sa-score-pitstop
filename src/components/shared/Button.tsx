import styled from "styled-components";
import { PALLETE } from "../../constants";

export const Button = styled.div`
  padding: 8px 16px;
  border-radius: 4px;
  height: 34px;
  background-color: ${PALLETE.CLUB_RED};
  color: ${PALLETE.FONT_COLOR};
  cursor: pointer;
  &:active {
    background-color: ${PALLETE.CLUB_RED_HOVER};
  }
`;
