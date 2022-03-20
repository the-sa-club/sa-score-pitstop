import * as React from "react";
import styled from "styled-components";
import { PALETTE } from "../constants";
import { Modal } from "./shared/Modal";
import { ReactComponent as CloseIcon } from "../assets/images/close-bold-svgrepo-com.svg";
import { useAppStore } from "../data/store";
import shallow from "zustand/shallow";
import { ErrorModalTypes } from "../data/types";

export const ErrorModal = () => {
  const { content, setOpen } = useAppStore(
    (state) => ({
      content: state.errorModalContent,
      setOpen: state.setErrorModal,
    }),
    shallow
  );

  switch (content?.modalType) {
    case ErrorModalTypes.NORMAL:
      return (
        <Modal onClose={() => setOpen(undefined)}>
          <Wrapper>
            <Header>
              <Title> ERROR</Title>
              <CloseIconWrapper onClick={() => setOpen(undefined)}>
                <CloseIcon />
              </CloseIconWrapper>
            </Header>
            <Sperator />
            <Body>
              <p>{content.message}</p>
            </Body>
          </Wrapper>
        </Modal>
      );

    case ErrorModalTypes.MISSING_OPEN_ORDERS:
      return (
        <Modal onClose={() => setOpen(undefined)}>
          <Wrapper>
            <Header>
              <Title> ERROR</Title>
              <CloseIconWrapper onClick={() => setOpen(undefined)}>
                <CloseIcon />
              </CloseIconWrapper>
            </Header>
            <Sperator />
            <Body maxWidth='600px'>
              <p >Apparently, you have not previously traded at least some of required resources. Before you can use <b>Pitstop</b>, you need to buy the following resources once on the <b>Star Stlas</b> market for at least <b>1 ATLAS</b>:</p>
              <ul style={{padding:'8px 16px'}}>
                {content.message?.split(",").map((resource, indx) => <li key={indx}>{resource}</li>)}
              </ul>
              <p >It is important to do it right <Link href="https://play.staratlas.com/market" target="_blank">here</Link>. Having done so, you will be able to continue using <b>Pitstop</b>.</p>
            </Body>
          </Wrapper>
        </Modal>
      );
    default:
      return <></>;
  }

};

const Wrapper = styled.div`
  padding: 20px 0;
  border: 1px solid ${PALETTE.CLUB_RED};
  background: ${PALETTE.CLUB_RED};
  box-shadow: 0 0 2px 1px ${PALETTE.PRIMARY_BG_COLOR};
  border-radius: 4px;
  overflow-y: auto;
  max-height: 100vh;
  color: ${PALETTE.FONT_COLOR};
  @media ${PALETTE.DEVICE.mobileL} {
      max-width: 90%;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid gray;
`;

const CloseIconWrapper = styled.div`
  padding-right: 16px;
  cursor: pointer;
`;

const Title = styled.h2`
  padding: 16px 16px;
  text-align: left;
`;

const Body = styled.div<{maxWidth?: string}>`
  padding: 16px 16px;
  max-width: ${p => p.maxWidth ?? '400px'};
  font-size: ${PALETTE.FONT_MD};
  line-height: 1.5;

  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media ${PALETTE.DEVICE.mobileL} {
      max-width: 100%;
  }
`;

const Sperator = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${PALETTE.FONT_COLOR};
`;

const Link = styled.a`
  color: ${PALETTE.FONT_COLOR};
  &:hover {
    color: ${PALETTE.CLUB_RED_HOVER};
  }
`
