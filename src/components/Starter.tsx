import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import styled from "styled-components";
import { PALLETE } from "../constants";
import heimLogo from '../assets/images/heimdall_industries.png';

export const Starter = () => {

  return (
    <Wrapper>
      <Logo>
        <img src={heimLogo} alt="Heimdall Industries"/>
        
        <Title>Hangar SCORE Resupply</Title>
      </Logo>
      <WalletMultiButton/>
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
    font-size: 4rem;
    font-family: "norse";
    color: ${PALLETE.FONT_COLOR};
  }
  img {
    margin-right: 8px;
  }
`;
