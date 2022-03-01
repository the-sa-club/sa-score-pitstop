import * as React from "react";
import styled from "styled-components";

interface Props {
  onClose: () => void;
}
export const Modal: React.FC<Props> = ({ children, onClose }) => {
  return (
    <Base>
      <BackDrop onClick={() => onClose()} />
      <Content>{children}</Content>
    </Base>
  );
};

const Base = styled.div`
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  z-index: 99;
`;

const BackDrop = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background: #000000ab;
  z-index: 999;
`;

const Content = styled.div`
  z-index: 9999;
  display: flex;
  justify-content: center;
`;
