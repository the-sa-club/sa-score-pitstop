import React from "react";
import styled from "styled-components";
import { PALLETE } from "../../constants";

const TooltipWrapper: React.FC<{text: string}> = ({ children, text }) => {
  const [opacity, setOpacity] = React.useState(0);

  const onMouseEnter = async () => {
    setOpacity(1);
  };
  const onMouseLeave = async () => {
    setOpacity(0);
  };

  return (
    <Wrapper
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      
    >
      {children}
      <Content opcaity={opacity}>{text}</Content>
    </Wrapper>
  );
};

export default TooltipWrapper;

const Wrapper = styled.div`
  position: relative;
`;

const Content = styled.div<{ opcaity: number }>`
  position: absolute;
  z-index: 99;
  background-color: ${PALLETE.SECONDARY_BG_COLOR};
  height: auto;
  max-width: 214px;
  width: max-content;
  opacity: ${p => p.opcaity};
  visibility: ${p => p.opcaity ?'visible' : 'hidden'};
  transition: opacity 0.5s ease;
  padding: 8px;
  border-radius: 4px;
  bottom: 120%;;
  font-size: ${PALLETE.FONT_XM};
`;
