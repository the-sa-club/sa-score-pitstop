import { useWallet } from "@solana/wallet-adapter-react";
import * as React from "react";
import styled from "styled-components";
import shallow from "zustand/shallow";
import { PALETTE } from "../constants";
import { useAppStore, useFleetStore, useResourceStore } from "../data/store";
import { IFleet } from "../data/types";
import { FleetService } from "../services/fleetService";
import { MarketService } from "../services/marketService";
import { Fleet } from "./Fleet";
import { Container } from "./shared/styled/Styled";


const Fleets = () => {
  const { publicKey } = useWallet();
  const { fleets, selectFleet, selectedFleets, unselectFleet } = useFleetStore(
    (state) => ({
      fleets: state.fleets,
      selectedFleets: state.selectedFleets,
      selectFleet: state.selectFleet,
      unselectFleet: state.unselectFleet,
    }),
    shallow
  );
  // const [isLoading, setLoading] = React.useState(false);
  const { appLoading } = useAppStore(
    (state) => ({
      appLoading: state.appLoading,
    }),
    shallow
  );
  const onSelectFleet = (fleet: IFleet) => selectFleet(fleet);
  const onUnSelectFleet = (fleet: IFleet) => unselectFleet(fleet);
 

  const selectAll = () => {
    selectFleet(undefined, "all");
  };

  const unselectAll = () => {
    unselectFleet(undefined, "none");
  };

  const anySelected = () => selectedFleets.length > 0;

  return (
    <Wrapper>
      <Container>
        <FleetWrapper>
          {appLoading.loading ? (
            <></>
          ) : (
            <Header>
              <Title>FLEETS</Title>
              {/* <Filters>
                {anySelected() ? (
                  <AllFilter onClick={unselectAll}>UNSELECT ALL</AllFilter>
                ) : (
                  <AllFilter onClick={selectAll}>SELECT ALL</AllFilter>
                )}
              </Filters> */}
              
            </Header>
          )}
          <div style={{width: '100%'}}>
            <FleetItems>
              {fleets.map((fleet, indx) => (
                <Fleet
                  secondsLeft={FleetService.calculateFleetRemainingTime(fleet)}
                  image={fleet.image}
                  size={fleet.shipQuantityInEscrow.toNumber()}
                  name={fleet.name}
                  key={indx}
                  onSelectFleet={() => onSelectFleet(fleet)}
                  onUnSelectFleet={() => onUnSelectFleet(fleet)}
                  selected={
                    !!selectedFleets.find((sf) => sf.name == fleet.name)
                  }
                />
              ))}

            </FleetItems>
            {/* <Spinner isLoading={isLoading} /> */}
          </div>
        </FleetWrapper>
      </Container>
    </Wrapper>
  );
};

export default React.memo(Fleets);

const Wrapper = styled.div`
  width: 100%;
  padding-bottom: 20px;
`;

const FleetWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 32px 16px;
  color: ${PALETTE.FONT_COLOR};
  border-radius: 4px;
  background-color: ${PALETTE.PRIMARY_BG_COLOR};
  min-height: 300px;
  max-height: 900px;
  overflow-y: auto;
`;

const FleetItems = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;

`;

const Filters = styled.div`
  display: inline-flex;
`;

const AllFilter = styled.div`
  border: 1px solid ${PALETTE.CLUB_RED};
  color: ${PALETTE.CLUB_RED};
  font-size: ${PALETTE.FONT_XM};
  padding: 4px 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    color: ${PALETTE.CLUB_RED_HOVER};
    border: 1px solid ${PALETTE.CLUB_RED_HOVER};
  }
`;

const SelectedFilter = styled.div`
  color: ${PALETTE.CLUB_RED};
  font-size: ${PALETTE.FONT_XM};
`;

const Title = styled.h1`
  display: inline-block;
  margin-right: 20px;
  margin-left: 8px;
`;

const Header = styled.div`
  width: 100%;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

