import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import * as React from "react";
import styled, { keyframes } from "styled-components";
import { useFleetStore, useResourceStore } from "../data/store";
import { MarketService } from "../services/marketService";
import { AtlasIcon } from "./Atlas";
import shallow from "zustand/shallow";
import { Container } from "./shared/styled/Styled";
import { ATLAS_DECIMAL, PALLETE, RESOURCE_DECIMAL } from "../constants";
import { thousandsFormatter } from "../utils";
import ammoImg from "../assets/images/ammo.png";
import foodImg from "../assets/images/food.png";
import fuelImg from "../assets/images/fuel.png";
import toolImg from "../assets/images/tool.png";

export const Header = () => {
  const { atlasBalance, setAtlasBalance } = useResourceStore(
    (state) => ({
      atlasBalance: state.atlasBalance,
      setAtlasBalance: state.setAtlasBalance,
    }),
    shallow
  );
  const inventory = useFleetStore((state) => state.inventory);
  const [loading, setLoading] = React.useState(false);
  const { publicKey } = useWallet();

  const refreshBalance = () => {
    if (publicKey) {
      setLoading(true);
      MarketService.getBalanceAtlas(publicKey)
        .then((balance) => setAtlasBalance(balance))
        .finally(() => setLoading(false));
    }
  };

  const RefreshIcon = (
    <Reloader
      width="25px"
      height="25px"
      viewBox="0 0 1024 1024"
      onClick={() => refreshBalance()}
    >
      <path
        fill="currentColor"
        d="M289.088 296.704h92.992a32 32 0 010 64H232.96a32 32 0 01-32-32V179.712a32 32 0 0164 0v50.56a384 384 0 01643.84 282.88 384 384 0 01-383.936 384 384 384 0 01-384-384h64a320 320 0 10640 0 320 320 0 00-555.712-216.448z"
      />
    </Reloader>
  );

  return (
    <Wrapper>
      <Container>
        <Nav>
          <Logo>
            <svg width="40px" height="40px" viewBox="0 0 256 256">
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
          <Menu>
            <Stats>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginRight: 30,
                }}
              >
                {thousandsFormatter(
                  inventory?.supplies.fuel || 0,
                  RESOURCE_DECIMAL
                )}

                <img
                  src={fuelImg}
                  alt=""
                  height={40}
                  style={{ transform: "translateY(-5px)" }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginRight: 30,
                }}
              >
                {thousandsFormatter(
                  inventory?.supplies.food || 0,
                  RESOURCE_DECIMAL
                )}

                <img
                  src={foodImg}
                  alt=""
                  height={40}
                  style={{ transform: "translateY(-5px)" }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginRight: 30,
                }}
              >
                {thousandsFormatter(
                  inventory?.supplies.arms || 0,
                  RESOURCE_DECIMAL
                )}

                <img
                  src={ammoImg}
                  alt=""
                  height={40}
                  style={{ transform: "translateY(-5px)" }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginRight: 30,
                }}
              >
                {thousandsFormatter(
                  inventory?.supplies.tools || 0,
                  RESOURCE_DECIMAL
                )}

                <img
                  src={toolImg}
                  alt=""
                  height={40}
                  style={{ transform: "translateY(-5px)" }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginRight: 30,
                }}
              >
                {/* {loading ? <Rotate>{RefreshIcon}</Rotate> : RefreshIcon} */}
                <span>{thousandsFormatter(atlasBalance, ATLAS_DECIMAL)}</span>
                <AtlasIcon width={20} height={20} />
              </div>
            </Stats>
            <WalletBtnWrapper>
              <WalletMultiButton />
            </WalletBtnWrapper>
          </Menu>
          <StatsMobile>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "25%",
              }}
            >
              {thousandsFormatter(
                inventory?.supplies.fuel || 0,
                RESOURCE_DECIMAL
              )}

              <img
                src={fuelImg}
                alt=""
                height={40}
                style={{ transform: "translateY(-5px)" }}
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "25%",
              }}
            >
              {thousandsFormatter(
                inventory?.supplies.food || 0,
                RESOURCE_DECIMAL
              )}

              <img
                src={foodImg}
                alt=""
                height={40}
                style={{ transform: "translateY(-5px)" }}
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "25%",
              }}
            >
              {thousandsFormatter(
                inventory?.supplies.arms || 0,
                RESOURCE_DECIMAL
              )}

              <img
                src={ammoImg}
                alt=""
                height={40}
                style={{ transform: "translateY(-5px)" }}
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "25%",
              }}
            >
              {thousandsFormatter(
                inventory?.supplies.tools || 0,
                RESOURCE_DECIMAL
              )}

              <img
                src={toolImg}
                alt=""
                height={40}
                style={{ transform: "translateY(-5px)" }}
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "25%",
                marginTop: 12,
              }}
            >
              {/* {loading ? <Rotate>{RefreshIcon}</Rotate> : RefreshIcon} */}
              <span>{thousandsFormatter(atlasBalance, ATLAS_DECIMAL)}</span>
              <AtlasIcon width={20} height={20} />
            </div>
          </StatsMobile>
        </Nav>
      </Container>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 75px;
  padding: 8px;
  background-color: ${PALLETE.SECONDARY_BG_COLOR};
  border-radius: 0 0 4px 4px;
`;

const WalletBtnWrapper = styled.div`
  @media ${PALLETE.DEVICE.mobileL} {
    button {
      height: 30px;
      width: 120px;
      font-size: ${PALLETE.FONT_SM};
      padding: 0;
      display: flex;
      justify-content: center;
    }
    img {
      height: 15px;
      width: 15px;
    }
  }
`;



const Menu = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 100%;
  @media ${PALLETE.DEVICE.mobileL} {
    flex-direction: column-reverse;
    justify-content: center;
    align-items: center;
  }
`;

const Title = styled.b`
  @media ${PALLETE.DEVICE.mobileL} {
    font-size: ${PALLETE.FONT_MD} !important;
  }
`;

const Nav = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  flex-wrap: wrap;
`;

const Logo = styled.div`
  display: flex;
  justify-content: start;
  align-items: center;
  height: 100%;
  b {
    font-size: 2rem;
    font-family: "nasalization";
    color: ${PALLETE.FONT_COLOR};
  }
  svg {
    margin-right: 8px;
  }
`;

const Stats = styled.div`
  margin-right: 1rem;
  height: 60%;
  color: ${PALLETE.FONT_COLOR};
  display: flex;
  align-items: center;
  justify-content: space-between;
  svg {
  }
  span {
    margin-right: 2px;
    padding: 4px;
  }

  @media ${PALLETE.DEVICE.mobileL} {
    display: none;
  }
`;

const StatsMobile = styled(Stats)`
  display: none;
  @media ${PALLETE.DEVICE.mobileL} {
    margin-right: 0;
    padding: 20px 0;
    display: flex;
    justify-content: center;
    width: 100%;
    flex-wrap: wrap;
  }
`;

const Reloader = styled.svg`
  &:hover {
    cursor: pointer;
    path {
      fill: #5f5f5fc2;
    }
  }
`;

const rotateAnim = keyframes`
  from {
    transform: rotate(0deg);
    transform-origin: center;
  }
  to {
    transform: rotate(-360deg);
    transform-origin: center;
  }
`;

const Rotate = styled.div`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  animation: ${rotateAnim} 2s linear infinite;
`;
