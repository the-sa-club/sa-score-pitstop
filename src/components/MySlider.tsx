import React, {ChangeEvent} from "react";
import styled from "styled-components";
import {PALETTE} from "../constants";


const MySlider: React.FC<{
    onDaysChange: (days: number) => void
}> = ({onDaysChange}) => {
    const [value, setValue] = React.useState(1);
    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const days = parseInt(e.target.value);
        onDaysChange(days)
        setValue(days);
    }
    return <Wrapper>
        <Range>
            <SliderValueWrapper>
                <SliderValue style={{
                    left: `${((value / 365) * 100)}%`
                }}>{value}</SliderValue>
            </SliderValueWrapper>
            <Field>
                <LeftValue className="value left">1</LeftValue>
                <RightValue className="value right">365</RightValue>
                <Slider type="range" min={1} max={365} value={value} step={1} onChange={(e) => onChange(e)}/>
            </Field>
        </Range>
    </Wrapper>
}

export default MySlider;

const Wrapper = styled.div`
  height: 120px;
  display: grid;
  text-align: center;
  place-items: end;
`

const Range = styled.div`
  height: 80px;
  padding: 0 65px 0 45px;
  width: 100%;
  display: grid;
  text-align: center;
  place-items: center;
`

const Field = styled.div`
  width: 100%;
  position: relative;
`

const SliderValueWrapper = styled.div`
  position: relative;
  width: 94%;
`;


const SliderValue = styled.span`
  position: absolute;
  height: 45px;
  width: 45px;
  top: -40px;
  transform: translateX(-50%) scale(1);
  transform-origin: bottom;
  line-height: 55px;
  z-index: 2;
  color: #fff;

  &::after {
    position: absolute;
    content: "";
    background: ${PALETTE.CLUB_RED_DENSE};
    transform: translateX(-50%) rotate(45deg);
    height: 45px;
    width: 45px;
    z-index: -1;
    left: 50%;
    border: 3px solid #fff;
    border-top-left-radius: 50%;
    border-top-right-radius: 50%;
    border-bottom-left-radius: 50%;
  }

`;

const Slider = styled.input`
  appearance: none;
  height: 3px;
  width: 100%;
  background: #ddd;
  border-radius: 5px;
  outline: none;
  border: none;

  &::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    background: ${PALETTE.CLUB_RED_DENSE};
    border-radius: 50%;
    cursor: pointer;
    border: 1px solid ${PALETTE.CLUB_RED_HOVER};
  }
`

const LeftValue = styled.div`
  position: absolute;
  font-size: ${PALETTE.FONT_MD};
  font-weight: bold;
  color: ${PALETTE.FONT_COLOR};
  left: -22px;
  top: 2px;
`
const RightValue = styled.div`
  position: absolute;
  font-size: ${PALETTE.FONT_MD};
  font-weight: bold;
  color: ${PALETTE.FONT_COLOR};
  right: -44px;
  top: 2px;
`