import * as React from "react";
import styled from "styled-components";
import { BUY_SUPPLY_MODES, PALLETE } from "../constants";
import { Button } from "./shared/Button";

interface Props {
  text: string;
  mainBtnEnabled?: boolean;
}
export const DropdownButton: React.FC<Props> = ({
  text,
  children,
  mainBtnEnabled,
}) => {
  const [isOpen, setOpen] = React.useState(false);
  React.useEffect(() => {
    setOpen(false);
  }, [text]);

  return (
    <Wrapper>
      <WrapperContent>
        <MainButton
          // className={`${mainBtnEnabled ? "" : "unactive"}`}
          onClick={() => setOpen(!isOpen)}
        >
          <span>{text}</span>
          <svg
              width="20px"
              height="20px"
              viewBox="0 0 1024 1024"
              className="icon"
            >
              <path
                fill="#fff"
                d="M831.872 340.864L512 652.672 192.128 340.864a30.592 30.592 0 00-42.752 0 29.12 29.12 0 000 41.6L489.664 714.24a32 32 0 0044.672 0l340.288-331.712a29.12 29.12 0 000-41.728 30.592 30.592 0 00-42.752 0z"
              />
            </svg>
        </MainButton>
        {/* <IconButton className={`${mainBtnEnabled ? '': 'unactive'}`} onClick={() => setOpen(!isOpen)}>
          <svg
            width="20px"
            height="20px"
            viewBox="0 0 1024 1024"
            className="icon"
          >
            <path
              fill="#fff"
              d="M831.872 340.864L512 652.672 192.128 340.864a30.592 30.592 0 00-42.752 0 29.12 29.12 0 000 41.6L489.664 714.24a32 32 0 0044.672 0l340.288-331.712a29.12 29.12 0 000-41.728 30.592 30.592 0 00-42.752 0z"
            />
          </svg>
        </IconButton> */}
        {isOpen ? <ListWraper>{children}</ListWraper> : null}
        {isOpen ? <DropBg onClick={() => setOpen(!isOpen)} /> : null}
      </WrapperContent>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
`;

const WrapperContent = styled.div`
  position: relative;
  border-radius: 4px;
  display: flex;
  align-items: center;
`;

const DropBg = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  z-index: 9;
`;

const MainButton = styled(Button)`
  display: inline-flex;
  border-radius: 4px 0 0 4px;
  justify-content: space-between;
  width: 100%;
  &.unactive:active {
    background-color: ${PALLETE.CLUB_RED};
  }
`;

const IconButton = styled(Button)`
  display: inline-block;
  padding: 5px 16px;
  border-radius: 0 4px 4px 0;
  &.unactive:active {
    background-color: ${PALLETE.CLUB_RED};
  }
`;

const ListWraper = styled.div`
  position: absolute;
  z-index: 99;
  top: 105%;
  left: 0;
  right: 0;
  height: 139px;
  background-color: ${PALLETE.CLUB_RED_DENSE};
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  justify-content: start;
`;
