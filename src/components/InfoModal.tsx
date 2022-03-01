import styled from "styled-components";
import shallow from "zustand/shallow";
import { ReactComponent as CloseIcon } from "../assets/images/close-bold-svgrepo-com.svg";
import { ReactComponent as Spinner } from "../assets/images/spinner.svg";
import { PALLETE } from "../constants";
import { useAppStore } from "../data/store";
import { InfoModalTypes } from "../data/types";
import { Modal } from "./shared/Modal";

export const InfoModal = () => {
  const { content, setOpen, signaturesToWait, setSignaturesToWait} = useAppStore(
    (state) => ({
      content: state.infoModalContent,
      setOpen: state.setInfoModal,
      signaturesToWait: state.signaturesToWait,
      setSignaturesToWait: state.setSignaturesToWait
    }),
    shallow
  );

  

  switch (content?.modalType) {
    case InfoModalTypes.NORMAL:
      return (
        <Modal onClose={() => setOpen(undefined)}>
          <Wrapper>
            <Header>
              <Title> Info</Title>
              <CloseIconWrapper onClick={() => setOpen(undefined)}>
                <CloseIcon />
              </CloseIconWrapper>
            </Header>
            <Sperator />
            <Body maxWidth="600px">
              <p>{content.message}</p>
            </Body>
          </Wrapper>
        </Modal>
      );

    case InfoModalTypes.LIST:
      return (
        <Modal onClose={() => setOpen(undefined)}>
          <Wrapper>
            <Header>
              <Title> Info</Title>
              <CloseIconWrapper onClick={() => setOpen(undefined)}>
                <CloseIcon />
              </CloseIconWrapper>
            </Header>
            <Sperator />
            <Body maxWidth="600px">
              <p>{content.message}</p>
              <ul style={{ padding: "8px 16px" }}>
                {content.list?.map((text, indx) => (
                  <li key={indx}>{text}</li>
                ))}
              </ul>
            </Body>
          </Wrapper>
        </Modal>
      );

    case InfoModalTypes.TX_LIST:
      return (
        <Modal onClose={() => {
          setSignaturesToWait([])
          return setOpen(undefined);
        }}>
          <Wrapper>
            <Header>
              <Title> Info</Title>
              <CloseIconWrapper onClick={() => setOpen(undefined)}>
                <CloseIcon />
              </CloseIconWrapper>
            </Header>
            <Sperator />
            <Body maxWidth="600px">
              <p>{content.message}</p>
              <ul style={{ padding: "16px 16px" }}>
                {content.list?.map((text, indx) => {
                  let status = signaturesToWait.find(sig => sig.hash == text)?.status?.toLowerCase();

                  return (
                    <li key={indx} style={{ fontSize: 12, width:'100%', marginBottom:'8px',  display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ marginRight: 8 , width: '35%'}}>
                        {text.slice(0, 30) + "****"}
                      </span>{" "}

                      <div style={{
                        marginLeft: 8, marginRight: 8, display: 'inline-flex', alignItems: 'center',

                      }}>
                        <b style={{ color: status == 'finalized' ? 'greenyellow' : 'yellow' }}>
                          {status?.toUpperCase()}
                        </b>
                        {status == 'finalized' || status == 'unknown' ?
                          <></> :
                          <Spinner style={{ marginLeft: 8 }} />}

                      </div>


                      <Link
                        href={`https://solscan.io/tx/${text}`}
                        target="_blank"
                      >
                        track here
                      </Link>

                    </li>
                  );
                })}
              </ul>
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
  border: 1px solid #10141f;
  background: #10141f;
  box-shadow: 0 0 2px 1px ${PALLETE.PRIMARY_BG_COLOR};
  border-radius: 4px;
  overflow-y: auto;
  max-height: 100vh;
  color: ${PALLETE.FONT_COLOR};
  @media ${PALLETE.DEVICE.mobileL} {
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

const Body = styled.div<{ maxWidth?: string }>`
  padding: 16px 16px;
  max-width: ${(p) => p.maxWidth ?? "400px"};
  font-size: ${PALLETE.FONT_MD};
  line-height: 1.5;

  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media ${PALLETE.DEVICE.mobileL} {
    max-width: 100%;
  }
`;

const Sperator = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${PALLETE.FONT_COLOR};
`;

const Link = styled.a`
  color: ${PALLETE.FONT_COLOR};
  &:hover {
    color: ${PALLETE.CLUB_RED_HOVER};
  }
`;
