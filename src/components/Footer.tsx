import React from "react";
import styled from "styled-components";
import { PALLETE } from "../constants";
import { Container } from "./shared/styled/Styled";
import {
  FaTwitter,
  FaDiscord,
  FaYoutube,
  FaReddit,
} from "react-icons/fa/index";
import { MdOutlineAnchor } from "react-icons/md/index";

export const Footer = () => {
  return (
    <Wrapper>
      <Container>
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
                  <FaDiscord color="white" size={30} />
                  {/* <LinkText>The Club Discord</LinkText> */}
                </Link>
              </LinkWrapper>
            </Item>
            <Item>
              <LinkWrapper>
                <Link target={"_blank"} href="https://twitter.com/TheClubGuild">
                  <FaTwitter color="white" size={30} />
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
                  <FaYoutube color="white" size={30} />
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
                  <FaReddit color="white" size={30} />
                  {/* <LinkText>The Club Twitter</LinkText> */}
                </Link>
              </LinkWrapper>
            </Item>
            <Item>
              <LinkWrapper>
                <Link target={"_blank"} href="https://explorer.staratlas.club/">
                  <MdOutlineAnchor color="white" size={30} />
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

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 75px;
  padding: 8px;
  /* background-color: ${PALLETE.PRIMARY_BG_COLOR}; */
  border-radius: 0 0 4px 4px;
`;

const ContentWrapper = styled.div`
    display: flex;
    justify-content: space-between;
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
  font-size: ${PALLETE.FONT_MD};
  color: ${PALLETE.FONT_COLOR};
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
  color: ${PALLETE.FONT_COLOR};
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
    font-size: ${PALLETE.FONT_SM} !important;
    font-family: "nasalization";
    margin: 0 16px;
    color: ${PALLETE.FONT_COLOR};
`;