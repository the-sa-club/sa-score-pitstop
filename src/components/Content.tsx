import { useWallet } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import * as React from "react";
import styled from "styled-components";
import shallow from "zustand/shallow";
import { ATLAS_DECIMAL, CONN, PALETTE } from "../constants";
import { useAppStore, useFleetStore } from "../data/store";
import {
  ErrorModalTypes,
  InfoModalTypes,
  WaitingSignature
} from "../data/types";
import { FleetService } from "../services/fleetService";
import { MarketService } from "../services/marketService";
import { thousandsFormatter } from "../utils";
import { AtlasIcon } from "./Atlas";
import Resources from "./Resources";
import { Container } from "./shared/styled/Styled";

export const Content = () => {
  const fleets = useFleetStore((state) => state.fleets);
  const {
    isAppLoading,
    startAppLoading,
    stopAppLoading,
    setErrorModal,
    setInfoModal,
    setSignaturesToWait,
  } = useAppStore(
    (state) => ({
      isAppLoading: state.appLoading,
      startAppLoading: state.startAppLoading,
      stopAppLoading: state.stopAppLoading,
      setInfoModal: state.setInfoModal,
      setErrorModal: state.setErrorModal,
      setSignaturesToWait: state.setSignaturesToWait,
    }),
    shallow
  );
  const [totalClaim, setTotalClaim] = React.useState(0);
  const { publicKey, signAllTransactions, signTransaction } = useWallet();

  React.useEffect(() => {
    if (fleets.length > 0) {
      setTotalClaim(FleetService.getPendingAtlas());
    }
  }, [fleets]);

  const onClaimAllClick = async () => {
    if (publicKey && signAllTransactions && signTransaction) {
      try {
        const ixs = await MarketService.getHarvestAllInstructions(publicKey);

        const biIxs: [Transaction, Transaction][] = [...ixs].reduce(
          (g: any[], c) => {
            if (g.length > 0) {
              if (g[g.length - 1].length == 2) {
                g.push([c]);
              } else {
                g[g.length - 1].push(c);
              }
            } else {
              g.push([c]);
            }
            return g;
          },
          [] as any[]
        );

        const latestBlockHash = await (
          await CONN.getRecentBlockhash("finalized")
        ).blockhash;

        const txs = biIxs.map((biIx) =>
          new Transaction({
            feePayer: publicKey,
            recentBlockhash: latestBlockHash,
          }).add(...biIx)
        );

        const signedTxs = await signAllTransactions(txs);

        const signatures = await Promise.all(
          signedTxs.map((signedTx) =>
            CONN.sendRawTransaction(signedTx.serialize())
          )
        );

        const waitingSigntaures = signatures.map<WaitingSignature>(
          (signature) => ({ hash: signature, status: "processing" })
        );
        setSignaturesToWait(waitingSigntaures);
        FleetService.checkSignatures(waitingSigntaures);

        setInfoModal({
          modalType: InfoModalTypes.TX_LIST,
          message: `Transactions are Sent. Please track them with Solscan using the following links:`,
          list: signatures,
        });
      } catch (error) {
        console.log(error);
        setErrorModal({
          modalType: ErrorModalTypes.NORMAL,
          message:
            "An error happened while sending transaction. Please try again later.",
        });
      } finally {
        stopAppLoading();
      }
    }
  };

  return (
    <Wrapper>
      <Container>
        <ContentWrapper>
          <PendingSection>
            <Title align="center">PENDING REWARDS</Title>
            <div>
              <AtlasIcon width={"100%"} height={100} />
              <h2 style={{marginTop:16}}>{thousandsFormatter(totalClaim, ATLAS_DECIMAL)}</h2>
            </div>
            <PrimaryBtn onClick={onClaimAllClick}>CLAIM ALL</PrimaryBtn>
          </PendingSection>

          <div style={{width:10}}></div>

          <ResourcesSection>
           
            <Resources />
          </ResourcesSection>
        </ContentWrapper>
      </Container>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
`;

const ContentWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 16px 0;

  @media ${PALETTE.DEVICE.mobileL} {
    flex-direction: column;
    justify-content: space-between;
  }
`;

const PrimaryBtn = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  height: 34px;
  background-color: ${PALETTE.CLUB_RED};
  color: ${PALETTE.FONT_COLOR};
  cursor: pointer;
  &:active {
    background-color: ${PALETTE.CLUB_RED_HOVER};
  }
`;

const ResourcesSection = styled.div`
  color: ${PALETTE.FONT_COLOR};
  flex: 5;
  border-radius: 4px;
  background-color: ${PALETTE.PRIMARY_BG_COLOR};
  padding: 32px 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  @media ${PALETTE.DEVICE.mobileL} {
    flex-direction: column;
    justify-content: space-between;
    margin: 16px 8px;
  }
`;

const Title = styled.h1<{ align?: string }>`
  text-align: ${(p) => p.align ?? "left"};
`;

const PendingSection = styled.div`
  color: ${PALETTE.FONT_COLOR};
  flex: 2;
  border-radius: 4px;
  background-color: ${PALETTE.PRIMARY_BG_COLOR};
  padding: 32px 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: center;

  @media ${PALETTE.DEVICE.mobileL} {
    flex-direction: column;
    justify-content: space-between;
    margin: 16px 8px;
    min-height: 360px;
  }
`;
