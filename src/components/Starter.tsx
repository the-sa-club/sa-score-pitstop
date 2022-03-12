import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import styled from "styled-components";
import { PALLETE } from "../constants";
import { Align } from "./shared/styled/Styled";

export const Starter = () => {
  return (
    <Wrapper>
      <Logo>
        <svg width="100px" height="100px" viewBox="0 0 256 256">
          <title>Logo-B</title>
          <defs>
            <linearGradient
              x1="50%"
              y1="0%"
              x2="50%"
              y2="100%"
              id="linearGradient-1"
            >
              <stop stopColor="#901539" offset="0%"></stop>
              <stop stopColor="#FF3267" offset="100%"></stop>
            </linearGradient>
          </defs>
          <g
            id="StarAtlas"
            stroke="none"
            strokeWidth="1"
            fill="none"
            fillRule="evenodd"
          >
            <g id="Logo-B">
              <circle
                id="Oval"
                fill="#000000"
                cx="128"
                cy="128"
                r="128"
              ></circle>
              <path
                d="M126.34271,79.2478241 C105.437402,79.2555556 84.1075502,102.679029 84.1075502,127.5 C84.1075502,152.320971 105.159822,174.745459 126.34271,174.745459 L174.875753,174.745459 C176.786687,174.745459 178.211024,175.53675 179.414917,177.918454 C179.763908,178.608874 190.544895,204.413346 191.602691,206.732547 C192.660487,209.051748 191.602691,211 188.469808,211 L123.940178,211 C83.4670376,211 43.998422,171.351599 44,127.5 C44.001578,83.6484012 80.2383658,44 126.442322,44 L188.469808,44 C190.458134,44 192.340989,45.3665394 191.602691,47.564213 L179.414917,75.6913426 C178.368019,78.2021412 176.864079,79.2555556 174.875753,79.2555556"
                id="Fill-9"
                fill="#FFFFFF"
                fillRule="nonzero"
              ></path>
              <polygon
                id="Triangle"
                fill="url(#linearGradient-1)"
                transform="translate(211.000000, 129.000000) rotate(-270.000000) translate(-211.000000, -129.000000) "
                points="211 98 245 160 177 160"
              ></polygon>
            </g>
          </g>
        </svg>
        <Title>SCORE Pitstop</Title>
      </Logo>

      <WalletMultiButton />

      <VersionIndicator>(Beta Version)</VersionIndicator>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: black;
  height: 100vh;
`;

const Title = styled.b``;

const Logo = styled.div`
  display: flex;
  justify-content: start;
  align-items: center;
  margin-bottom: 20px;
  b {
    font-size: 2rem;
    font-family: "nasalization";
    color: ${PALLETE.FONT_COLOR};
  }
  svg {
    margin-right: 8px;
  }
`;

const VersionIndicator = styled.b`
  font-size: ${PALLETE.FONT_SM} !important;
  font-family: "nasalization";
  margin: 20px 16px;
  color: ${PALLETE.FONT_COLOR};
`;
