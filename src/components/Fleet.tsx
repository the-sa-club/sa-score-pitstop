import * as React from "react";
import styled from "styled-components";
import { COLORS, PALLETE } from "../constants";
import { getHours } from "../utils";
import { Clock } from "./Clock";

interface Props {
  name: string;
  secondsLeft: number;
  image: string;
  size: number;
  onSelectFleet: () => void;
  onUnSelectFleet: () => void;
  selected: boolean
}

export const Fleet: React.FC<Props> = ({
  image,
  size,
  name,
  secondsLeft,
  onSelectFleet,
  onUnSelectFleet,
  selected
}) => {
  const fleetRef = React.useRef<HTMLDivElement>(null);

  let color = COLORS.THICK_BLUE;
  if (secondsLeft == 0) {
    color = COLORS.THICK_RED;
  }
  if (getHours(secondsLeft) < 12 && color != COLORS.THICK_RED) {
    color = COLORS.THICK_YELLOW;
  }

  const onClick = () => {
    if (selected) {
      onUnSelectFleet();
    } else {
      onSelectFleet();
    }
  };
  return (
    <Wrapper onClick={onClick} ref={fleetRef}>
      <ContentWrapper>
        <Header imgUrl={image} />
        <Body>
          <Title>{name}</Title>
          <Count>{size}</Count>
          <RemainingTime>
            <Clock seconds={secondsLeft} color={color} />
          </RemainingTime>
        </Body>
        <Mask color={color} selected={selected} />
      </ContentWrapper>
    </Wrapper>
  );
};

interface HeaderProps {
  imgUrl: string;
}

const Wrapper = styled.div`
  height: 200px;
  /* min-width: 233px; */
  width: 20%;
  padding: 8px;
  border-radius: 8px;
  box-shadow: inset;
  @media ${PALLETE.DEVICE.mobileL} {
    width: 50%;
    min-width: 0;
  }
`;

const ContentWrapper = styled.div`
  height: 100%;
  width: 100%;
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
  /* box-shadow: 0 0 10px 10px black; */
  &:hover {
    transform: scale(1.1);
  }
`;

const Blur = styled.div`
  position: absolute;
  border-radius: 8px;
  box-shadow: 0 -20px 30px 19px #161616;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
`

const Mask = styled.div<{ selected: boolean }>`
  background: ${(p) => (p.selected ? "#ffffff5c" : "none")};
  /* box-shadow: 0px 0px 7px 1px ${(p) => p.color} inset; */
  position: absolute;
  border-radius: 8px;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none; /* to make clicks pass through */
`;

const Header = styled.div<HeaderProps>`
  background-image: url(${(p) => p.imgUrl});
  background-size: cover;
  background-position: center;
  height: 60%;
  border-radius: 8px 8px 1px 1px;
`;

const Body = styled.div`
  position: relative;
  height: 40%;
  padding: 8px 8px;
  display: flex;
  flex-wrap: wrap;
  /* border: 2px solid #252525; */
  border-top: 0;
  border-radius: 0 0 8px 8px;
  /* box-shadow: 0 -20px 30px 19px #161616; */
  background: #161616;

  ::before {
    content: '';
    height: 40px;
    background: linear-gradient(to top,#161616,#00000005);
    position: absolute;
    top: -38px;
    left: 0;
    right: 0;
  }
`;

const Count = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  border: 1px solid #dbdbdb9b;
  position: absolute;
  background: #080808c2;
  border-radius: 15px;
  top: -25.5%;
  right: 5px;
  height: 20px;
  width: 40px;
`;

const IconWrapper = styled.svg`
  width: 15px;
  height: 15px;
  margin-right: 4px;
  fill: white;
`;

const RemainingTime = styled.data`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const Title = styled.div`
  width: 100%;
  text-align: center;
  font-size: 14px;
  font-weight: bold;
`;
