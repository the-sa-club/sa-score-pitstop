import React from "react";
import styled from "styled-components";
import {PALETTE} from "../constants";
import {Container} from "./shared/styled/Styled";
import {
    FaTwitter,
    FaDiscord,
    FaYoutube,
    FaReddit,
    FaGithub
} from "react-icons/fa/index";
import {MdOutlineAnchor} from "react-icons/md/index";
import {AtlasIcon} from "./Atlas";

export const Footer = () => {
    return (
        <Wrapper>
            <Container>
                <DonateWrapper>
                    <Donate>
                        <b> Support us (donate):</b>
                        <DonationAddress>
                            9VV4TyRbNXfKcaG7kpxZ4WNax69kq59yNwtLHsPpEhSL
                            <AtlasIconWrapper><AtlasIcon width={15} height={15}/></AtlasIconWrapper>
                            <AtlasIconWrapper>
                                <img
                                    width={15}
                                    height={15}
                                    src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png"
                                />
                            </AtlasIconWrapper>
                            <AtlasIconWrapper>
                                <img
                                    src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
                                    width={15}
                                    height={15}/>
                            </AtlasIconWrapper>
                        </DonationAddress>
                    </Donate>
                </DonateWrapper>
                <ContentWrapper>


                    <ListWrapper>
                        <List>
                            <ListTitle>FOLLOW US</ListTitle>

                            <Item>
                                <LinkWrapper>
                                    <Link
                                        target={"_blank"}
                                        href="https://discord.com/invite/the-sa-club"
                                    >
                                        <FaDiscord color="white" size={30}/>
                                        {/* <LinkText>The Club Discord</LinkText> */}
                                    </Link>
                                </LinkWrapper>
                            </Item>
                            <Item>
                                <LinkWrapper>
                                    <Link target={"_blank"} href="https://twitter.com/TheClubGuild">
                                        <FaTwitter color="white" size={30}/>
                                        {/* <LinkText>The Club Twitter</LinkText> */}
                                    </Link>
                                </LinkWrapper>
                            </Item>
                            <Item>
                                <LinkWrapper>
                                    <Link
                                        target={"_blank"}
                                        href="https://www.youtube.com/channel/UCMTp0p-oOsZB8UETrCr53XA"
                                    >
                                        <FaYoutube color="white" size={30}/>
                                        {/* <LinkText>The Club Twitter</LinkText> */}
                                    </Link>
                                </LinkWrapper>
                            </Item>
                            <Item>
                                <LinkWrapper>
                                    <Link
                                        target={"_blank"}
                                        href="https://www.reddit.com/r/TheClubGuild/"
                                    >
                                        <FaReddit color="white" size={30}/>
                                        {/* <LinkText>The Club Twitter</LinkText> */}
                                    </Link>
                                </LinkWrapper>
                            </Item>
                            <Item>
                                <LinkWrapper>
                                    <Link target={"_blank"} href="https://explorer.staratlas.club/">
                                        <MdOutlineAnchor color="white" size={30}/>
                                        {/* <LinkText>The Club Twitter</LinkText> */}
                                    </Link>
                                </LinkWrapper>
                            </Item>
                            <Item>
                                <LinkWrapper>
                                    <Link target={"_blank"} href="https://github.com/the-sa-club/sa-score-pitstop">
                                        <FaGithub color="white" size={30}/>
                                        {/* <LinkText>The Club Twitter</LinkText> */}
                                    </Link>
                                </LinkWrapper>
                            </Item>
                        </List>
                    </ListWrapper>

                    <VersionIndicator>(Beta Version)</VersionIndicator>
                </ContentWrapper>
            </Container>
        </Wrapper>
    );
};


const Donate = styled.div`
  padding: 8px 16px;
  border-radius: 4px;
  background: ${PALETTE.SECONDARY_BG_COLOR};
  color: ${PALETTE.FONT_COLOR};
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  @media ${PALETTE.DEVICE.mobileL} {
    border-radius: 0;
  }
`

const AtlasIconWrapper = styled.div`
  margin-left: 4px;
  display: inline-block;
  transform: translateY(2px);
`;


const Wrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 75px;
  padding: 8px;
    /* background-color: ${PALETTE.PRIMARY_BG_COLOR}; */
  border-radius: 0 0 4px 4px;

`;

const ContentWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;

`
const DonateWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 20px 0 40px 0;
`

const ListWrapper = styled.div`
  text-align: left;
`;

const List = styled.ul`
  display: inline-flex;
  list-style-type: none;
  text-align: left;
  align-items: center;
`;

const ListTitle = styled.li`
  align-items: center;
  text-align: center;
  font-weight: bold;
  margin-right: 10px;
  font-size: ${PALETTE.FONT_MD};
  color: ${PALETTE.FONT_COLOR};
`;

const Item = styled.li`
  padding: 2px;
  margin-right: 10px;
`;

const LinkWrapper = styled.div`
  transition: all 0.2s ease-in;

  &:hover {
    transform: scale(1.3);
  }
`;

const Link = styled.a`
  color: ${PALETTE.FONT_COLOR};
  display: flex;
  justify-content: start;
  align-items: center;
  text-decoration: none;
`;

const LinkText = styled.b`
  margin-left: 4px;
`;


const VersionIndicator = styled.b`
  display: flex;
  align-items: center;
  font-size: ${PALETTE.FONT_SM} !important;
  font-family: "nasalization";
  margin-right: 16px;
  color: ${PALETTE.FONT_COLOR};
`;

const DonationAddress = styled.span`
  margin-left: 8px;
  font-size: ${PALETTE.FONT_XM};

  @media ${PALETTE.DEVICE.mobileL} {
    margin-left: 0;
    margin-top: 8px;
  }
`;
