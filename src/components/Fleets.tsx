import { useWallet } from "@solana/wallet-adapter-react";
import * as React from "react";
import { text } from "stream/consumers";
import styled from "styled-components";
import shallow from "zustand/shallow";
import { PALETTE, ShipsFirePower } from "../constants";
import { useAppStore, useFleetStore, useResourceStore } from "../data/store";
import { IFleet } from "../data/types";
import { FleetService } from "../services/fleetService";
import { MarketService } from "../services/marketService";
import { Fleet } from "./Fleet";
import { RefreshButton } from "./shared/Button";
import { Container } from "./shared/styled/Styled";
import { ReactComponent as InfoIcon } from "../assets/images/info.svg";
import TooltipWrapper from "./shared/TooltipWrapper";

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
  const [firePower, setFirePower] = React.useState<number | null>(null);

  const selectAll = () => {
    selectFleet(undefined, "all");
  };

  const unselectAll = () => {
    unselectFleet(undefined, "none");
  };

  const anySelected = () => selectedFleets.length > 0;

  React.useEffect(() => {
    let _firePower = 0;
    let _fleets = selectedFleets.length == 0 ? fleets : selectedFleets;
    _fleets.forEach((f) => {
      if (!ShipsFirePower[f.name]) {
        _firePower += 0;
      } else {
        _firePower +=
          ShipsFirePower[f.name].missileDPS *
            f.shipQuantityInEscrow.toNumber() +
          ShipsFirePower[f.name].weaponDPS * f.shipQuantityInEscrow.toNumber();
      }
    });
    setFirePower(_firePower);
  }, [selectedFleets]);

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

              <div style={{ display: "flex", alignItems: "center" }}>
                <TooltipWrapper
                  text={
                    "Firepower score is not an official Star Atlas metric. It uses information from the first Star Atlas Economics Report which suggests ship component performance is increased by a factor of 2.721 per ship class. We start at an arbitrary base number and apply this multiplier. In this calculation it is also assumed that missile firepower is double weapon firepower."
                  }
                >
                  <div
                    style={{
                      marginRight: 10,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <InfoIcon width={20} />
                  </div>
                </TooltipWrapper>{" "}
                <Title>
                  FIREPOWER :{" "}
                  <span
                    style={{
                      color: PALETTE.CLUB_RED_DENSE,
                      marginRight: 8,
                      marginLeft: 8,
                    }}
                  >
                    {firePower}
                  </span>
                  {selectedFleets.length == fleets.length ||
                  selectedFleets.length == 0 ? (
                    <span
                      style={{ color: PALETTE.CLUB_RED_DENSE, marginRight: 8 }}
                    >
                      (ALL)
                    </span>
                  ) : (
                    ""
                  )}{" "}
                </Title>
              </div>
            </Header>
          )}
          <div style={{ width: "100%" }}>
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
  overflow-y: inherit;
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
  position: relative;
  width: 100%;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
