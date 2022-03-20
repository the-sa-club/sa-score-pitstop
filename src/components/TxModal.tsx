import { useWallet } from "@solana/wallet-adapter-react";
import { Transaction, TransactionInstruction } from "@solana/web3.js";
import * as React from "react";
import styled from "styled-components";
import AmmoImg from "../assets/images/ammo.png";
import { ReactComponent as CloseIcon } from "../assets/images/close-bold-svgrepo-com.svg";
import foodImg from "../assets/images/food.png";
import fuelImg from "../assets/images/fuel.png";
import toolImg from "../assets/images/tool.png";
import {
  ATLAS_MINT,
  CONN, PALETTE, RESOURCE_DECIMAL, USDC_DECIMAL
} from "../constants";
import { useLoader } from "../context/LoadingContext";
import { useAppStore } from "../data/store";
import {
  ErrorModalTypes,
  InfoModalTypes,
  InvoiceResources,
  WaitingSignature
} from "../data/types";
import { FleetService } from "../services/fleetService";
import { MarketService } from "../services/marketService";
import { retryAsync, thousandsFormatter } from "../utils";
import { AtlasIcon } from "./Atlas";
import { Button } from "./shared/Button";
import { Modal } from "./shared/Modal";

interface Props {
  open: boolean;
  onClose: () => void;
  data: InvoiceResources | undefined;
  instructions: TransactionInstruction[];
}
export const TxModal: React.FC<Props> = ({
  open,
  onClose,
  data,
  instructions: buyInstructions,
}) => {
  const {
    publicKey,
    sendTransaction,
    signAllTransactions,
    signTransaction,
  } = useWallet();
  const setErrorModal = useAppStore((state) => state.setErrorModal);
  const setInfoModal = useAppStore((state) => state.setInfoModal);
  const signaturesToWait = useAppStore((state) => state.signaturesToWait);
  const setSignaturesToWait = useAppStore((state) => state.setSignaturesToWait);
  const tips = [
    { text: "2%", value: 0.02 },
    { text: "5%", value: 0.05 },
    { text: "10%", value: 0.1 },
    { text: "15%", value: 0.15 },
  ];
  const { setLoadingInfo } = useLoader();
  const [tip, setTip] = React.useState(0.1);

  const calculateSubtotal = () => {
    const subtotal =
      (data?.ammo.atlas || 0) +
      (data?.food.atlas || 0) +
      (data?.fuel.atlas || 0) +
      (data?.tools.atlas || 0);

    return subtotal;
  };

  const buyResourcesTx = async () => {
    try {
      if (publicKey && data && signAllTransactions && signTransaction) {
        setLoadingInfo({
          loading: true,
          message: "Waiting Transactions For Signing",
          pct: 100,
        });

        const latestBlockHash = await (await retryAsync(() =>
          CONN.getRecentBlockhash("finalized")
        ))!.blockhash;

        let tipIxs = (await retryAsync(() =>
          MarketService.getTipsInstructions(
            publicKey,
            ATLAS_MINT,
            calculateSubtotal() * tip
          )
        )) as TransactionInstruction[];

        
        const instructions = [...buyInstructions ];
        

        const biIxs: [Transaction, Transaction][] = instructions.reduce(
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

        const txs = biIxs.map((biIx) =>
          new Transaction({
            feePayer: publicKey,
            recentBlockhash: latestBlockHash,
          }).add(...biIx)
        );

        if (tip > 0) {
          txs.push(new Transaction({
            feePayer: publicKey,
            recentBlockhash: latestBlockHash,
          }).add(...tipIxs))
        }

        const signedTxs = await retryAsync(async () => {
          try {
            return await signAllTransactions(txs);
          } catch (error) {
            if (
              ((error as any).message as string).includes(
                "User rejected the request"
              )
            ) {
              return [];
            }
            throw error;
          }
        });

        if (signedTxs?.length == 0) {
          throw new Error("No Signed Txs");
        }

        const signatures = (await Promise.all(
          signedTxs!.map((signedTx) =>
            retryAsync(() => CONN.sendRawTransaction(signedTx.serialize()))
          )
        )) as string[];

        const waitingSigntaures = signatures.map<WaitingSignature>(signature => ({hash: signature, status: 'processing'}));
        setSignaturesToWait(waitingSigntaures)
        FleetService.checkSignatures(waitingSigntaures);

        setInfoModal({
          modalType: InfoModalTypes.TX_LIST,
          message: `Transactions are Sent. Please track them with Solscan using the following links:`,
          list: signatures,
        });
      }
    } catch (error) {
      console.log(error);
      setErrorModal({
        modalType: ErrorModalTypes.NORMAL,
        message:
          "An error happened while sending transaction. Please try again later.",
      });
    } finally {
      setLoadingInfo({ loading: false, message: "", pct: 0 });
      onClose();
    }
  };

  return open ? (
    <Modal onClose={onClose}>
      <Wrapper>
        <Header>
          <Title>INVOICE</Title>{" "}
          <CloseIconWrapper onClick={() => onClose()}>
            <CloseIcon />
          </CloseIconWrapper>
        </Header>
        <Sperator />
        <Body>
          <Table>
            <thead>
              <tr>
                <TH style={{ width: 10 }}></TH>
                <TH>Asset</TH>
                <TH align="right" style={{paddingRight: 40}}>Amount</TH>
                <TH align="right"></TH>
                <TH></TH>
              </tr>
            </thead>
            <tbody>
              {/* AMMO */}
              {data?.ammo && data.ammo.amount > 0 ? (
                <tr>
                  <TD>
                    <ResourceIcon src={AmmoImg} />
                  </TD>
                  <TD>
                    <ResourceName>AMMO</ResourceName>
                  </TD>
                  <TD align="right" style={{paddingRight: 40}}>
                    <Units>
                      {thousandsFormatter(data.ammo.amount, RESOURCE_DECIMAL)}
                    </Units>
                  </TD>
                  <TD align="right">
                    <Cost>{thousandsFormatter(data.ammo.atlas, 4)}</Cost>{" "}
                    <AtlasIconWrapper>
                      <AtlasIcon width={15} height={15} />
                    </AtlasIconWrapper>
                  </TD>
                </tr>
              ) : (
                <></>
              )}

              {/* FOOD */}
              {data?.food && data.food.amount > 0 ? (
                <tr>
                  <TD>
                    <ResourceIcon src={foodImg} />
                  </TD>
                  <TD>
                    <ResourceName>FOOD</ResourceName>
                  </TD>
                  <TD align="right" style={{paddingRight: 40}}>
                    <Units>
                      {thousandsFormatter(data.food.amount, RESOURCE_DECIMAL)}
                    </Units>
                  </TD>
                  <TD align="right">
                    <Cost>{thousandsFormatter(data.food.atlas, 4)}</Cost>{" "}
                    <AtlasIconWrapper>
                      <AtlasIcon width={15} height={15} />
                    </AtlasIconWrapper>
                  </TD>
                </tr>
              ) : (
                <></>
              )}

              {/* FUEL */}
              {data?.fuel && data.fuel.amount > 0 ? (
                <tr>
                  <TD>
                    <ResourceIcon src={fuelImg} />
                  </TD>
                  <TD>
                    <ResourceName>FUEL</ResourceName>
                  </TD>
                  <TD align="right" style={{paddingRight: 40}}>
                    <Units>
                      {thousandsFormatter(data.fuel.amount, RESOURCE_DECIMAL)}
                    </Units>
                  </TD>
                  <TD align="right">
                    <Cost>{thousandsFormatter(data.fuel.atlas, 4)}</Cost>{" "}
                    <AtlasIconWrapper>
                      <AtlasIcon width={15} height={15} />
                    </AtlasIconWrapper>
                  </TD>
                </tr>
              ) : (
                <></>
              )}

              {/* TOOLS */}
              {data?.tools && data.tools.amount > 0 ? (
                <tr>
                  <TD>
                    <ResourceIcon src={toolImg} />
                  </TD>
                  <TD>
                    <ResourceName>TOOLS</ResourceName>
                  </TD>
                  <TD align="right" style={{paddingRight: 40}}>
                    <Units>
                      {thousandsFormatter(data.tools.amount, RESOURCE_DECIMAL)}
                    </Units>
                  </TD>
                  <TD align="right">
                    <Cost>{thousandsFormatter(data.tools.atlas, 4)}</Cost>{" "}
                    <AtlasIconWrapper>
                      <AtlasIcon width={15} height={15} />
                    </AtlasIconWrapper>
                  </TD>
                </tr>
              ) : (
                <></>
              )}

              {/* Result */}
              <TSubtotal>
                <TD></TD>
                <TD>Subtotal:</TD>
                <TD></TD>
                <TD align="right">
                  {thousandsFormatter(calculateSubtotal(), 4)}{" "}
                  <AtlasIconWrapper>
                    <AtlasIcon width={15} height={15} />
                  </AtlasIconWrapper>
                </TD>
                <TD></TD>
              </TSubtotal>

              <TTip>
                <TD></TD>
                <TD>Tip:</TD>
                <TD>
                  <Tips>
                    {tips.map((t, indx) => (
                      <Tip
                        key={indx}
                        onClick={() => {
                          tip == t.value ? setTip(0) : setTip(t.value);
                        }}
                        selected={t.value == tip}
                      >
                        {t.text}
                      </Tip>
                    ))}
                  </Tips>
                </TD>
                <TD align="right">
                  {thousandsFormatter(calculateSubtotal() * tip, 4)}{" "}
                  <AtlasIconWrapper>
                    <AtlasIcon width={15} height={15} />
                  </AtlasIconWrapper>
                </TD>
                <TD></TD>
              </TTip>

              <TResult>
                <TD></TD>
                <TD>Total:</TD>
                <TD></TD>
                <TD align="right">
                  {thousandsFormatter(calculateSubtotal() * (1 + tip), 4)}{" "}
                  <AtlasIconWrapper>
                    <AtlasIcon width={15} height={15} />
                  </AtlasIconWrapper>
                </TD>
                <TD></TD>
              </TResult>

              <TUSDC>
                <TD></TD>
                <TD></TD>
                <TD></TD>
                <TD align="right">
                  {thousandsFormatter(
                    calculateSubtotal() * (1 + tip) * (data?.market.rate || 0),
                    USDC_DECIMAL
                  )}{" "}
                  <AtlasIconWrapper>
                    <img
                      width={15}
                      height={15}
                      src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png"
                    />
                  </AtlasIconWrapper>
                </TD>
                <TD></TD>
              </TUSDC>
            </tbody>
          </Table>
          <Actions>
            <Action onClick={() => buyResourcesTx()}>BUY</Action>
          </Actions>
        </Body>
      </Wrapper>
    </Modal>
  ) : (
    <></>
  );
};

const Wrapper = styled.div`
  padding: 20px 0;
  border: 1px solid ${PALETTE.PRIMARY_BG_COLOR};
  background: #10141f;
  box-shadow: 0 0 2px 1px ${PALETTE.PRIMARY_BG_COLOR};
  border-radius: 4px;
  overflow-y: auto;
  max-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CloseIconWrapper = styled.div`
  padding-right: 16px;
  cursor: pointer;
`;

const Title = styled.h2`
  padding: 16px 16px;
  text-align: left;
`;

const Table = styled.table`
  table-layout: auto;
  border-collapse: collapse;
  width: 100%;
  min-width: 300px;
  
`;

const TH = styled.th`
  padding: 16px 10px;
  text-align: ${(p) => p.align ?? "left"};
  font-size: ${PALETTE.FONT_MD};
  border-bottom: 1px solid #d024526b;
`;

const TD = styled.td`
  padding: 10px 10px;
  text-align: ${(p) => p.align ?? "left"};
`;

const Sperator = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${PALETTE.FONT_COLOR};
  /* box-shadow: 0 0 4px 1px ${PALETTE.FONT_COLOR}; */
`;

const Body = styled.div`
  padding: 8px 16px;
  max-width: 90vw;
  overflow-x: auto;
`;

const ResourceIcon = styled.div<{ src: string }>`
  display: inline-block;
  width: 40px;
  height: 40px;
  margin-right: 10px;
  background: url(${(p) => p.src});
  background-size: cover;
`;

const Cost = styled.div`
  flex: 1;
  font-size: ${PALETTE.FONT_MD};
  display: inline-block;
`;

const Units = styled.div`
  display: inline-block;
  font-size: ${PALETTE.FONT_MD};
`;

const ResourceName = styled.div``;

const TSubtotal = styled.tr`
  border-top: 1px solid #c5c3c36b;
  color: white;
  font-weight: bold;
  td {
    padding: 12px 10px;
  }
`;

const TResult = styled.tr`
  color: white;
  font-weight: bold;
  td {
    padding: 12px 10px 0 10px;
  }
`;

const TUSDC = styled.tr`
  color: #c5c3c394;
  td {
    padding: 8px 10px 12px 10px;
    text-align: right;
  }
`;

const AtlasIconWrapper = styled.div`
  display: inline-block;
  transform: translateY(2px);
`;

const TTip = styled.tr`
  color: white;
  font-weight: bold;
  td {
    padding: 12px 10px;
  }
`;

const Tips = styled.div`
  display: flex;
`;

const Tip = styled.div<{ selected: boolean }>`
  padding: 4px 8px;
  text-align: center;
  margin: 0 2px;
  background: ${(p) =>
    p.selected ? PALETTE.FONT_COLOR_SIGN : PALETTE.CLUB_RED};
  border-radius: 4px;
  color: ${PALETTE.FONT_COLOR};
  cursor: pointer;
`;

const Actions = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 40px;
`;

const Action = styled(Button)`
  width: 50%;
  text-align: center;
`;
