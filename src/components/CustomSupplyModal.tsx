import * as React from "react";
import styled from "styled-components";
import {ReactComponent as CloseIcon} from "../assets/images/close-bold-svgrepo-com.svg";
import {PALETTE, RESOURCE_DECIMAL, USDC_DECIMAL} from "../constants";
import {IInventory, InvoiceResources, IResourceData} from "../data/types";
import {FleetService} from "../services/fleetService";
import MySlider from "./MySlider";
import {Button} from "./shared/Button";
import {Modal} from "./shared/Modal";
import AmmoImg from "../assets/images/ammo.png";
import foodImg from "../assets/images/food.png";
import fuelImg from "../assets/images/fuel.png";
import toolImg from "../assets/images/tool.png";
import {thousandsFormatter} from "../utils";
import {round} from "mathjs";

interface Props {
    data: { inventory: IInventory, resourcesData: { [p: string]: IResourceData } }
    open: boolean;
    onClose: (resourcesToBuy?: InvoiceResources) => void
}

const CustomSupplyModal: React.FC<Props> = ({open, onClose, data}) => {

    const [state, setState] = React.useState<{
        days: number;
        resourcesToBuy: undefined | InvoiceResources;
    }>(() => ({
        days: 1,
        resourcesToBuy: FleetService.getResourcesRequiredFor(24 * 60 * 60, data.resourcesData)
    }))


    const onDaysChange = (days: number) => {
        setState({
            ...state,
            days: days,
            resourcesToBuy: FleetService.getResourcesRequiredFor(days * 24 * 60 * 60, data.resourcesData)
        });

    }

    return open ? (
        <Modal onClose={onClose}>
            <Wrapper>
                <Header>
                    <Title>How Many Days ?</Title>
                    <CloseIconWrapper onClick={() => onClose()}>
                        <CloseIcon/>
                    </CloseIconWrapper>
                </Header>
                <Sperator/>
                <Body>
                    <MySlider onDaysChange={onDaysChange}/>
                    <Summary>

                        <div>
                            <b>Days: <span>{state.days}</span> <span
                                style={{
                                    color: PALETTE.CLUB_RED,
                                    marginLeft: 4
                                }}>{state.days > 100 ? "that's alot" : ""}</span></b>
                        </div>

                        {state.resourcesToBuy ?
                            <>
                                <div style={{width: "100%"}}>
                                    <Row style={{
                                        padding: '20px 0',
                                        fontSize: PALETTE.FONT_MD,
                                        borderBottom: '1px solid #d024526b'
                                    }}>
                                        <div style={{flex: 1}}/>
                                        <div style={{flex: 2}}><b>Asset</b></div>
                                        <div style={{
                                            flex: 3, display: 'flex', justifyContent: 'end',
                                            padding: '0 20px'
                                        }}><b>Amount</b>
                                        </div>
                                    </Row>
                                    <Row style={{padding: '10px 0'}}>
                                        <div style={{flex: 1}}><ResourceIcon src={AmmoImg}/></div>
                                        <div style={{flex: 2, display: 'flex', alignItems: 'center'}}><b>AMMO</b></div>
                                        <div style={{
                                            flex: 3,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'end',
                                            padding: '0 20px'
                                        }}>{thousandsFormatter(Math.round(state.resourcesToBuy.ammo.amount), RESOURCE_DECIMAL)}</div>
                                    </Row>
                                    <Row style={{padding: '10px 0'}}>
                                        <div style={{flex: 1}}><ResourceIcon src={foodImg}/></div>
                                        <div style={{flex: 2, display: 'flex', alignItems: 'center'}}><b>FOOD</b></div>
                                        <div style={{
                                            flex: 3,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'end',
                                            padding: '0 20px'
                                        }}>{thousandsFormatter(Math.round(state.resourcesToBuy.food.amount), RESOURCE_DECIMAL)}</div>
                                    </Row>

                                    <Row style={{padding: '10px 0'}}>
                                        <div style={{flex: 1}}><ResourceIcon src={fuelImg}/></div>
                                        <div style={{flex: 2, display: 'flex', alignItems: 'center'}}><b>FUEL</b></div>
                                        <div style={{
                                            flex: 3,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'end',
                                            padding: '0 20px'
                                        }}>{thousandsFormatter(Math.round(state.resourcesToBuy.fuel.amount), RESOURCE_DECIMAL)}</div>
                                    </Row>
                                    <Row style={{padding: '10px 0'}}>
                                        <div style={{flex: 1}}><ResourceIcon src={toolImg}/></div>
                                        <div style={{flex: 2, display: 'flex', alignItems: 'center'}}><b>TOOLS</b></div>
                                        <div style={{
                                            flex: 3,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'end',
                                            padding: '0 20px'
                                        }}>{thousandsFormatter(Math.round(state.resourcesToBuy.tools.amount), RESOURCE_DECIMAL)}</div>
                                    </Row>
                                </div>
                            </>
                            : <></>}

                    </Summary>

                    <Actions>
                        <Action onClick={() => {
                            setState({
                                days: 1,
                                resourcesToBuy: FleetService.getResourcesRequiredFor(24 * 60 * 60, data.resourcesData)
                            })
                            onClose(state.resourcesToBuy);
                        }}>CREATE INVOICE</Action>
                    </Actions>
                </Body>
            </Wrapper>
        </Modal>
    ) : (
        <></>
    );
};

export default React.memo(CustomSupplyModal);


const Row = styled.div`
  display: flex;

`;

const Summary = styled.div`
  min-width: 400px;
  @media ${PALETTE.DEVICE.mobileL} {
    min-width: auto;
  }
`

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

const Sperator = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${PALETTE.FONT_COLOR};
    /* box-shadow: 0 0 4px 1px ${PALETTE.FONT_COLOR}; */
`;

const Body = styled.div`
  padding: 8px 16px;
`;

const ResourceIcon = styled.div<{ src: string }>`
  display: inline-block;
  width: 40px;
  height: 40px;
  margin-right: 10px;
  background: url(${(p) => p.src});
  background-size: cover;
`;


const Actions = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 10px;
`;

const Action = styled(Button)`
  width: 50%;
  text-align: center;
`;

