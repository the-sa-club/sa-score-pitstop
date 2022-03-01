import { useWallet } from "@solana/wallet-adapter-react";
import { Transaction, TransactionInstruction } from "@solana/web3.js";
import { floor } from "mathjs";
import * as React from "react";
import styled from "styled-components";
import shallow from "zustand/shallow";
import { BUY_SUPPLY_MODES, CONN, PALLETE } from "../constants";
import { STOP_LOADING_INFO, useLoader } from "../context/LoadingContext";
import { useAppStore, useFleetStore, useResourceStore } from "../data/store";
import {
  ErrorModalTypes,
  InfoModalTypes,
  InvoiceResources, WaitingSignature
} from "../data/types";
import { FleetService } from "../services/fleetService";
import { MarketService } from "../services/marketService";
import { retryAsync } from "../utils";
import { Clock } from "./Clock";
import { DropdownButton } from "./DropdownButton";
import { DropdownItem } from "./DropdownItem";
import Resource from "./Resource";
import { Button } from "./shared/Button";
import { TxModal } from "./TxModal";

interface Props {}




export const Resources: React.FC<Props> = () => {
  const { selectedFleets, inventory, allFleets } = useFleetStore(
    (state) => ({
      selectedFleets: state.selectedFleets,
      inventory: state.inventory,
      allFleets: state.fleets,
    }),
    shallow
  );
  const { resourcesData, setResourcesData } = useResourceStore(
    (state) => ({
      resourcesData: state.resourcesData,
      setResourcesData: state.setResourcesData,
    }),
    shallow
  );
  const { setErrorModal, setInfoModal, setSignaturesToWait } = useAppStore(
    (state) => ({
      setErrorModal: state.setErrorModal,
      setInfoModal: state.setInfoModal,
      setSignaturesToWait: state.setSignaturesToWait
    }),
    shallow
  );
  const [invoiceModal, setInvoiceModal] = React.useState<{
    open: boolean;
    invoiceResources: InvoiceResources | undefined;
    instructions: TransactionInstruction[];
  }>({
    open: false,
    invoiceResources: undefined,
    instructions: [],
  });

  const [tooltipContent, setTooltipContent] = React.useState("")

  const [] = React.useState();

  const { setLoadingInfo } = useLoader();

  const { publicKey, signTransaction, signAllTransactions } = useWallet();

  const [buySupplyMode, setBuySupplyMode] = React.useState(
    BUY_SUPPLY_MODES.OPTIMAL
  );

  const [filter, setFilter] = React.useState('min');


 
  const onBuySupplyClick = async () => {
    if (publicKey && inventory && (selectedFleets.length > 0 || allFleets.length > 0)) {
      try {
        setLoadingInfo({ loading: true, message: "", pct: 1 });

        const invoiceResources = await FleetService.createInvoice(
          inventory,
          resourcesData,
          buySupplyMode,
          selectedFleets,
          setLoadingInfo
        );

        if (!invoiceResources) {
          setLoadingInfo(STOP_LOADING_INFO);
          return setErrorModal({
            modalType: ErrorModalTypes.NORMAL,
            message:
              "An error happened while processing the invoice. Please try again later.",
          });
        }

        console.log(invoiceResources);

        if (
          Math.max(
            floor(invoiceResources.ammo.amount - 20),
            floor(invoiceResources.food.amount - 20),
            floor(invoiceResources.fuel.amount - 20),
            floor(invoiceResources.tools.amount - 20),
            0
          ) == 0
        ) {
          setLoadingInfo(STOP_LOADING_INFO);
          return setInfoModal({
            modalType: InfoModalTypes.NORMAL,
            message:
              "There is nothing to buy. The inventory has enough resources to cover the selected resupply mode.",
          });
        }

        setLoadingInfo({
          loading: true,
          message: "Validating Tokes Accounts",
          pct: 70,
        });
        const canSettle = await MarketService.canInteractWithMarket(publicKey);
        if (!canSettle) {
          return;
        }

        setLoadingInfo({
          loading: true,
          message: "Preparing Transactions",
          pct: 80,
        });
        let buyIxs = (await retryAsync(() =>
          MarketService.getBuyAllInstructions(invoiceResources, publicKey)
        )) as TransactionInstruction[];

        return setInvoiceModal({
          invoiceResources: invoiceResources,
          open: true,
          instructions: buyIxs,
        });
      } catch (error) {
        console.log(error);
        setErrorModal({
          modalType: ErrorModalTypes.NORMAL,
          message:
            "An error happened while sending transaction. Please try again later.",
        });
      } finally {
        setLoadingInfo(STOP_LOADING_INFO);
      }
    }
  };

  const onSettleFundsClick = async () => {
    try {
      if (publicKey && signTransaction) {
        setLoadingInfo({ loading: true, message: "Validating Tokes Accounts", pct: 10 });

        await new Promise((res, rej) => setTimeout(res, 1000)) 

        const canSettle = await MarketService.canInteractWithMarket(publicKey);
        if (!canSettle) {
          return;
        }

        setLoadingInfo({ loading: true, message: "Preparing Settle Transactions", pct: 40 });
        let settleFundsIxs = (await retryAsync(() =>
          MarketService.getSettleAllInstructions(publicKey)
        )) as TransactionInstruction[];


        if (settleFundsIxs.length == 0) {
          return setInfoModal({
            modalType: InfoModalTypes.NORMAL,
            message: "There are no funds to settle.",
          });
        } 

        

        setLoadingInfo({ loading: true, message: "Preparing Transactions", pct: 60 });
        const tx = new Transaction({
          feePayer: publicKey,
          recentBlockhash: await (await retryAsync(() =>
            CONN.getRecentBlockhash("finalized")
          ))!.blockhash,
        }).add(...settleFundsIxs);


        setLoadingInfo({ loading: true, message: "Waiting Transactions For Signing", pct: 90 });
        const signedTx = (await retryAsync(async () => {
          try {
            return await signTransaction(tx);
          } catch (error) {
            if (
              ((error as any).message as string).includes(
                "User rejected the request"
              )
            ) {
              return undefined;
            }
            throw error;
          }
        })) as Transaction;
        if (!signedTx) {
          throw new Error("No Signed Txs");
        }


        let signature = (await retryAsync(() =>
          CONN.sendRawTransaction(signedTx.serialize())
        )) as string;
        
        setSignaturesToWait([{hash: signature, status: 'processing'}])
        FleetService.checkSignatures([{hash: signature, status: 'processing'}]);

        setInfoModal({
          modalType: InfoModalTypes.TX_LIST,
          message: `Transactions are sent. Please track them with Solscan using the following links:`,
          list: [signature],
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
      setLoadingInfo(STOP_LOADING_INFO);
    }
  };

  const onResupplyClick = async () => {
    if (inventory && (selectedFleets.length > 0 || allFleets.length > 0)) {
      try {
        if (publicKey && signTransaction && signAllTransactions) {
          setLoadingInfo({ loading: true, message: "Preparing Resupply Transactions", pct: 20 });

          let resupplyIxs = (await retryAsync(() =>
            MarketService.getResupplyAllInstructions(publicKey, buySupplyMode)
          )) as TransactionInstruction[];
          if (!resupplyIxs) {
            return setErrorModal({
              modalType: ErrorModalTypes.NORMAL,
              message: `There are not enough resources for ${buySupplyMode} resupply mode.`,
            });
          }
          if (resupplyIxs?.length == 0) {
            return setInfoModal({
              modalType: InfoModalTypes.NORMAL,
              message: `Fleet resources are already filled with the required amount of units.`,
            });
          }

          setLoadingInfo({ loading: true, message: "Preparing Resupply Transactions", pct: 60 });


        
          const biIxs: [Transaction, Transaction][] = [...resupplyIxs].reduce(
            (g: any[], c) => {
              if (g.length > 0) {
                if (g[g.length - 1].length == 3) {
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

          const latestBlockHash = await (await retryAsync(() =>
            CONN.getRecentBlockhash("finalized")
          ))!.blockhash;

          const txs = biIxs.map((biIx) =>
            new Transaction({
              feePayer: publicKey,
              recentBlockhash: latestBlockHash,
            }).add(...biIx)
          );


          setLoadingInfo({ loading: true, message: "Waiting Transactions For Signing", pct: 90 });

          const signedTxs = (await retryAsync(async () => {
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
          })) as Transaction[];
          if (signedTxs?.length == 0) {
            throw new Error("No Signed Txs");
          }

          const signatures = (await Promise.all(
            signedTxs.map((signedTx) =>
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
        setLoadingInfo(STOP_LOADING_INFO);
      }
    }
  };

  React.useEffect(() => {
    // ! calculate resources for all fleets on the beginning
    if (selectedFleets.length == 0) {
      setResourcesData(FleetService.calculateResources(allFleets, inventory));
    } else {
      setResourcesData(
        FleetService.calculateResources(selectedFleets, inventory)
      );
    }
  }, [selectedFleets, allFleets]);

  const resorucesFleets = selectedFleets.length > 0 ? selectedFleets : allFleets;
  const minFleet = FleetService.findWhoDeplateFirst(resorucesFleets);
  let resourcesSource = minFleet.stats!;


  if (!minFleet) {
    return <></>
  }

  return (
    <>
      <Title align="center">STATE OF THE SUPPLIES</Title>
      <ResourcesWrapper>
        <ResourceWrapper>
          <Resource
            id={resourcesData.ammo.id}
            imgSrc={resourcesData.ammo.imgSrc}
            pct1Color={resourcesData.ammo.pct1Color}
            pct1={resourcesData.ammo.pct1}
            pct2={resourcesData.ammo.pct2}
            isBlinking={!!resourcesData.ammo.isBlinking}
            isLoading={resourcesData.ammo.isLoading}
            resourceData={resourcesData["ammo"]}
          />
            <Clock
              seconds={
                resourcesSource["ammo"].secondsLeft
                  ? resourcesSource["ammo"].secondsLeft
                  : 0
              }
              color={resourcesSource.ammo.pct1Color}
              tooltip="The time for the first fleet resource to be depleted."
            />
        </ResourceWrapper>

        <ResourceWrapper>
          <Resource
            id={resourcesData.tools.id}
            imgSrc={resourcesData.tools.imgSrc}
            pct1Color={resourcesData.tools.pct1Color}
            pct1={resourcesData.tools.pct1}
            pct2={resourcesData.tools.pct2}
            isBlinking={!!resourcesData.tools.isBlinking}
            isLoading={resourcesData.tools.isLoading}
            resourceData={resourcesData["tools"]}
          />
            <Clock
              seconds={
                resourcesSource["tools"].secondsLeft
                  ? resourcesSource["tools"].secondsLeft
                  : 0
              }
              color={resourcesSource.tools.pct1Color}
              tooltip="The time for the first fleet resource to be depleted."
            />
        </ResourceWrapper>

        <ResourceWrapper>
          <Resource
            id={resourcesData.fuel.id}
            imgSrc={resourcesData.fuel.imgSrc}
            pct1Color={resourcesData.fuel.pct1Color}
            pct1={resourcesData.fuel.pct1}
            pct2={resourcesData.fuel.pct2}
            isBlinking={!!resourcesData.fuel.isBlinking}
            isLoading={resourcesData.fuel.isLoading}
            resourceData={resourcesData["fuel"]}
          />
            <Clock
              seconds={
                resourcesSource["fuel"].secondsLeft
                  ? resourcesSource["fuel"].secondsLeft
                  : 0
              }
              color={resourcesSource.fuel.pct1Color}
              tooltip="The time for the first fleet resource to be depleted."
            />
        </ResourceWrapper>

        <ResourceWrapper>
          <Resource
            id={resourcesData.food.id}
            imgSrc={resourcesData.food.imgSrc}
            pct1Color={resourcesData.food.pct1Color}
            pct1={resourcesData.food.pct1}
            pct2={resourcesData.food.pct2}
            isBlinking={!!resourcesData.food.isBlinking}
            isLoading={resourcesData.food.isLoading}
            resourceData={resourcesData["food"]}
          />
            <Clock
              seconds={
                resourcesSource["food"].secondsLeft
                  ? resourcesSource["food"].secondsLeft
                  : 0
              }
              color={resourcesSource.food.pct1Color}
              tooltip="The time for the first fleet resource to be depleted."
            />
        </ResourceWrapper>
      </ResourcesWrapper>

      <Actions>
        <SupplyButtons>
                <DropdownButton text={buySupplyMode} mainBtnEnabled={false}>
                  {Object.values(BUY_SUPPLY_MODES).map((option, indx) => (
                      <DropdownItem
                        text={option}
                        choosed={option == buySupplyMode}
                        key={indx}
                        onClick={(v: BUY_SUPPLY_MODES) => setBuySupplyMode(v)}
                      />
                  
                  ))}
                </DropdownButton>
        </SupplyButtons>
        <SupplyButtons>
          <SupplyButton onClick={onBuySupplyClick}>
            <span>1.</span>BUY SUPPLIES
          </SupplyButton>
          <SupplyButton onClick={onSettleFundsClick}>
            <span>2.</span>SETTLE FUNDS
          </SupplyButton>
          <SupplyButton onClick={onResupplyClick}>
            <span>3.</span>RESUPPLY
          </SupplyButton>
        </SupplyButtons>
      </Actions>

      <TxModal
        open={invoiceModal.open}
        data={invoiceModal.invoiceResources}
        instructions={invoiceModal.instructions}
        onClose={() =>
          setInvoiceModal({
            invoiceResources: undefined,
            open: false,
            instructions: [],
          })
        }
      />
    </>
  );
};

export default React.memo(Resources);

const ResourcesWrapper = styled.div`
  padding: 32px 0;
  display: flex;
  justify-content: space-evenly;
  flex-wrap: wrap;

  @media ${PALLETE.DEVICE.mobileL} {
    justify-content: space-between;
  }
`;

const ResourceWrapper = styled.div``;

const Actions = styled.div`
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
`;

const SupplyButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 8px 16px;
  min-width: 200px;
  flex: 1;
`;

const SupplyButton = styled(Button)<{ disabled?: boolean }>`
  height: 34px;
  width: 100%;
  margin-bottom: 8px;
  span {
    display: inline-block;
    width: 10%;
  }

  background: ${(p) => (p.disabled ? "gray" : "inhert")};
  cursor: ${(p) => (p.disabled ? "default" : "inhert")};
  &:active {
    background: ${(p) => (p.disabled ? "gray" : "inhert")};
  }
`;

const Title = styled.h1<{ align?: string }>`
  text-align: ${(p) => p.align ?? "left"};
`;

const Toggle = styled.div`
  margin: 8px 0;
  display: inline-flex;
  justify-content: end;
  div {
    border-radius: 4px;
    padding: 2px 8px;
    margin: 0 1px;
    border: 1px solid ${PALLETE.CLUB_RED};
    color: ${PALLETE.CLUB_RED};
    font-size: ${PALLETE.FONT_XM};
    cursor: pointer;
    transition: all 0.3s ease;
    background-color: transparent;
    display: flex;
    align-items: center;
    justify-content: space-between;
    &:hover {
      color: ${PALLETE.CLUB_RED_HOVER};
      border: 1px solid ${PALLETE.CLUB_RED_HOVER};
    }
    &.active {
      background-color: ${PALLETE.CLUB_RED};
      color: ${PALLETE.FONT_COLOR};
    }
  }
  @media ${PALLETE.DEVICE.mobileL} {
    justify-content: center;
    padding-top: 24px;
  }
`