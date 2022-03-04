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
import heimIcon from "../assets/images/heimIcon.png";

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
            <img src={heimIcon} width="40px" height="40px"  alt="Heimdall Industries"/>
            <Title>Hangar SCORE Resupply</Title>
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
              style={{ display: "flex", alignItems: "center",justifyContent:'center',  width: '25%' }}
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
              style={{ display: "flex", alignItems: "center",justifyContent:'center',  width: '25%' }}
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
              style={{ display: "flex", alignItems: "center",justifyContent:'center',  width: '25%' }}
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
              style={{ display: "flex", alignItems: "center",justifyContent:'center',  width: '25%' }}
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
              style={{ display: "flex", alignItems: "center",justifyContent:'center',  width: '25%', marginTop: 12 }}
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
    font-family: "norse";
    color: ${PALLETE.FONT_COLOR};
    padding-top: 5px;
  }
  img {
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
