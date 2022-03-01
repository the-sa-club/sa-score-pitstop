import {
    getAllFleetsForUserPublicKey, 
    createHarvestInstruction,
    createRearmInstruction,
    createRefeedInstruction,
    createRefuelInstruction,
    createRepairInstruction,
    ShipStakingInfo,
    getScoreVarsShipInfo,
    ScoreVarsShipInfo,
    get
} from "@staratlas/factory";
import {
    Connection,
    PublicKey,
    TransactionInstruction,
    Transaction
} from "@solana/web3.js";
import {
    getAssociatedTokenAddress
} from "./Helpers";

import {
    Token,
} from "@solana/spl-token";
import { Market, DexInstructions } from "@project-serum/serum";
import * as data from './data'





export class ArmadaMaintenanceInstructionFactory {

    
    //public static class getHarvesAllInstructions()
    public static async  getHarvestAllInstructions(connection: Connection, info:data.ArmadaInfo): Promise<TransactionInstruction[]> {
        let atlas_account = await getAssociatedTokenAddress(info.player, data.ATLAS_MINT);
        
        return await Promise.all(info.fleets.map(async (el) => {
            return await createHarvestInstruction(
                connection, 
                info.player,
                atlas_account,
                new PublicKey(el.shipMint),
                data.score
            )
            })
        )
    }

    private static async getMarketPrice(connection: Connection, market:  Market): Promise<number> {
        let asks = await market.loadAsks(connection);
        return asks.getL2(1)[0][0];
    }

    private static async getMarketBuyInstruction(
        connection: Connection, 
        market: Market, 
        size: number,
        owner: PublicKey
        ): Promise<TransactionInstruction> {
        let payer = await getAssociatedTokenAddress(owner, data.ATLAS_MINT)
        return await market.makePlaceOrderInstruction(connection, {
            owner: owner,
            payer: payer,
            side: "buy",
            price: await ArmadaMaintenanceInstructionFactory.getMarketPrice(connection, market),
            size: size,
            orderType: "limit"
        });
    }

    public static async getSettleFundsInstruction(
        connection: Connection,
        market: Market,
        marketCredentials: data.MarketsCredentials,//TODO: Inherit MarketCredentials from Serum.Market  
        owner: PublicKey
        ): Promise<TransactionInstruction> {
        
        return DexInstructions.settleFunds({
            market: market.publicKey,
            openOrders: (await market.findOpenOrdersAccountsForOwner(connection, owner))[0].publicKey,
            owner: owner,
            baseVault: marketCredentials.baseVault,
            quoteVault: marketCredentials.quoteVault,
            baseWallet: await getAssociatedTokenAddress(owner, market.baseMintAddress),
            quoteWallet: await getAssociatedTokenAddress(owner, data.ATLAS_MINT),
            vaultSigner: marketCredentials.vaultSigner,
            programId: data.ATLAS_DEX
        })
    }


    public static async getBuyAllInstructions(connection: Connection, info: data.ArmadaInfo): Promise<TransactionInstruction[]> {
        
        let ixs: TransactionInstruction[] = [];
        if (info.supplies.deficit.food.toBuy>0) ixs.push(await  ArmadaMaintenanceInstructionFactory.getMarketBuyInstruction(
            connection, Armada.FOOD_MARKET, info.supplies.deficit.food.toBuy, info.player));
        if (info.supplies.deficit.arms.toBuy>0) ixs.push(await  ArmadaMaintenanceInstructionFactory.getMarketBuyInstruction(
            connection, Armada.ARMS_MARKET, info.supplies.deficit.arms.toBuy, info.player));
        if (info.supplies.deficit.fuel.toBuy>0) ixs.push(await  ArmadaMaintenanceInstructionFactory.getMarketBuyInstruction(
            connection, Armada.FUEL_MARKET, info.supplies.deficit.fuel.toBuy, info.player));
        if (info.supplies.deficit.tools.toBuy>0) ixs.push(await  ArmadaMaintenanceInstructionFactory.getMarketBuyInstruction(
            connection, Armada.TOOLS_MARKET, info.supplies.deficit.tools.toBuy, info.player));
        return ixs;
    }
    
    public static async getSettleAllInstructions(connection: Connection, info: data.ArmadaInfo): Promise<TransactionInstruction[]> {
        let ixs: TransactionInstruction[] = [];
        if (info.supplies.deficit.food.toBuy>0) ixs.push(await  ArmadaMaintenanceInstructionFactory.getSettleFundsInstruction(
            connection, Armada.FOOD_MARKET, data.FOOD_MARKET_CRED, info.player));
        if (info.supplies.deficit.arms.toBuy>0) ixs.push(await  ArmadaMaintenanceInstructionFactory.getSettleFundsInstruction(
            connection, Armada.ARMS_MARKET, data.ARMS_MARKET_CRED, info.player));
        if (info.supplies.deficit.fuel.toBuy>0) ixs.push(await  ArmadaMaintenanceInstructionFactory.getSettleFundsInstruction(
            connection, Armada.FUEL_MARKET, data.FUEL_MARKET_CRED, info.player));
        if (info.supplies.deficit.tools.toBuy>0) ixs.push(await  ArmadaMaintenanceInstructionFactory.getSettleFundsInstruction(
            connection, Armada.TOOLS_MARKET, data.TOOLS_MARKET_CRED, info.player));
        return ixs;
    }

    public static async getResupplyAllInstructions(connection: Connection, info: data.ArmadaInfo): Promise<TransactionInstruction[]> {
        const createReArmIx = async (qty: number, shipmint: PublicKey) => {
            let arms = Armada.getSupplyTokenByName(data.SuppliesNames.ARMS).publicKey;
            return createRearmInstruction(
                connection, 
                info.player, 
                info.player, 
                qty, 
                shipmint, 
                arms, 
                await getAssociatedTokenAddress(info.player, arms), 
                data.score)
        };
        const createReFeedIx = async (qty: number, shipmint: PublicKey) => {
            let food = Armada.getSupplyTokenByName(data.SuppliesNames.FOOD).publicKey;
            return createRefeedInstruction(
                connection, 
                info.player, 
                info.player, 
                qty, shipmint, 
                food, 
                await getAssociatedTokenAddress(info.player, food), 
                data.score)
        };
        const createRefuelIx = async (qty: number, shipmint: PublicKey) => {
            let fuel = Armada.getSupplyTokenByName(data.SuppliesNames.FUEL).publicKey;
            return createRefuelInstruction(
                connection, 
                info.player, 
                info.player, 
                qty, shipmint, 
                fuel, 
                await getAssociatedTokenAddress(info.player, fuel), 
                data.score)
        };
        const createRepairIx = async (qty: number, shipmint: PublicKey) => {
            let tools = Armada.getSupplyTokenByName(data.SuppliesNames.TOOLS).publicKey;
            return createRepairInstruction(
                connection, 
                info.player, 
                info.player, 
                qty, 
                shipmint, 
                tools, 
                await getAssociatedTokenAddress(info.player, tools), 
                data.score)
        };

        let res = await Promise.all(info.fleets.map(async (el) => {
            let shipPk = new PublicKey(el.shipMint);
            return [
                await createReArmIx(el.supplies.arms.toBuy, shipPk),
                await createReFeedIx(el.supplies.food.toBuy, shipPk),
                await createRefuelIx(el.supplies.fuel.toBuy, shipPk),
                await createRepairIx(el.supplies.tools.toBuy, shipPk)
            ]
        }))
        return res.flat()
    }
}

export class Armada {
    public static FOOD_MARKET : Market;
    public static ARMS_MARKET : Market;
    public static FUEL_MARKET : Market;
    public static TOOLS_MARKET : Market;
    public static SHIP_SCORES : ScoreVarsShipInfo[];
    public static SUPPLIES_TOKENS: data.TOKEN_DATA[];

    public static ping() : string {
        return "ping";
    }

    private static async loadMarkets(connection: Connection) {
        Armada.FOOD_MARKET= await Market.load(connection, data.FOOD_MARKET_CRED.address, {}, data.ATLAS_DEX);
        Armada.ARMS_MARKET= await Market.load(connection, data.ARMS_MARKET_CRED.address, {}, data.ATLAS_DEX);
        Armada.FUEL_MARKET= await Market.load(connection, data.FUEL_MARKET_CRED.address, {}, data.ATLAS_DEX);
        Armada.TOOLS_MARKET= await Market.load(connection, data.TOOLS_MARKET_CRED.address, {}, data.ATLAS_DEX);
    }
    public static async load(connection: Connection, program: PublicKey, ships: PublicKey[], supplies_tokens: data.TOKEN_DATA[]) {
        Armada.SHIP_SCORES = await Promise.all(ships.map((el) => {
            return getScoreVarsShipInfo(connection, program, el)
        }));
        Armada.SUPPLIES_TOKENS = supplies_tokens;
        await this.loadMarkets(connection);
    }
    public static getInfoByShipMint(ship: PublicKey): ScoreVarsShipInfo {
        
        let res = Armada.SHIP_SCORES.filter((el) => el.shipMint.toString() == ship.toString())
        return res[0]
    }

    public static getSupplyTokenByName(name: data.SuppliesNames): Token {
        let res = Armada.SUPPLIES_TOKENS.filter((el) => el.name == name);
        return res[0].token
    }


    public static async  getArmadaInfo(connection: Connection, player: PublicKey) : Promise<data.ArmadaInfo> {
        let fleets = await getAllFleetsDemandsInfo(connection, player);
        let demands = getTotalDemands(fleets);
        let stocks = await getStocksInfo(connection, player);
        let info: data.ArmadaInfo = {
            player: player,
            fleets: fleets,
            supplies:{
                totalDemand: demands,
                stocks: stocks,
                deficit: getDeficit(demands, stocks)
            }
        }
        return info
    }
}

const getPassTimeSinceLastAction = (fleet: ShipStakingInfo) : number => {
    let lastRecordTime = fleet.currentCapacityTimestamp.toNumber();
    let currentTime = (Date.now() / 1000 | 0)
    return currentTime - lastRecordTime;
}

const getFoodDemand = (scoreInfo: ScoreVarsShipInfo, fleet: ShipStakingInfo) : data.DemandInfo => {
    let timePass = getPassTimeSinceLastAction(fleet);
    let remainTime = Math.max(0, fleet.foodCurrentCapacity.toNumber() - timePass);
    let shipQuantity = fleet.shipQuantityInEscrow.toNumber();
    let timeOnFullFood = scoreInfo.foodMaxReserve * scoreInfo.millisecondsToBurnOneFood/1000;
    let demand = (timeOnFullFood - remainTime) /(scoreInfo.millisecondsToBurnOneFood/1000) * shipQuantity;
    return {
        toBuy: demand,
        timeLeft: remainTime
    }
}

const getArmsDemand = (scoreInfo: ScoreVarsShipInfo, fleet: ShipStakingInfo) :data.DemandInfo => {
    let timePass = getPassTimeSinceLastAction(fleet);
    let remainTime = Math.max(0, fleet.armsCurrentCapacity.toNumber() - timePass);
    let shipQuantity = fleet.shipQuantityInEscrow.toNumber();
    let timeOnFullArms = scoreInfo.armsMaxReserve * scoreInfo.millisecondsToBurnOneArms/1000;
    let demand = (timeOnFullArms - remainTime) /(scoreInfo.millisecondsToBurnOneArms/1000) * shipQuantity;
    return {
        toBuy: demand,
        timeLeft: remainTime
    }
}

const getFuelDemand = (scoreInfo: ScoreVarsShipInfo, fleet: ShipStakingInfo) : data.DemandInfo => {
    let timePass = getPassTimeSinceLastAction(fleet);
    let remainTime = Math.max(0, fleet.fuelCurrentCapacity.toNumber() - timePass);
    let shipQuantity = fleet.shipQuantityInEscrow.toNumber();
    let timeOnFullFuel = scoreInfo.armsMaxReserve * scoreInfo.millisecondsToBurnOneFuel/1000;
    let demand = (timeOnFullFuel - remainTime) /(scoreInfo.millisecondsToBurnOneFuel/1000) * shipQuantity;
    return {
        toBuy: demand,
        timeLeft: remainTime
    }
}

const getToolsDemand = (scoreInfo: ScoreVarsShipInfo, fleet: ShipStakingInfo) : data.DemandInfo => {
    let timePass = getPassTimeSinceLastAction(fleet);
    let remainTime = Math.max(0, fleet.healthCurrentCapacity.toNumber() - timePass);
    let shipQuantity = fleet.shipQuantityInEscrow.toNumber();
    let timeOnFullHealth = scoreInfo.toolkitMaxReserve* scoreInfo.millisecondsToBurnOneToolkit/1000;
    let demand = (timeOnFullHealth - remainTime) /(scoreInfo.millisecondsToBurnOneToolkit/1000) * shipQuantity;
    return {
        toBuy: demand,
        timeLeft: remainTime
    }
}

const getSuppliesDemandForFleet = (fleet: ShipStakingInfo) : data.FleetSuppliesStatus => {
    let scoreInfo: ScoreVarsShipInfo = Armada.getInfoByShipMint(fleet.shipMint);
    let info: data.FleetSuppliesStatus = {
        shipMint: fleet.shipMint.toString(),
        supplies: {
            food: getFoodDemand(scoreInfo, fleet),
            arms: getArmsDemand(scoreInfo, fleet),
            fuel: getFuelDemand(scoreInfo, fleet),
            tools: getToolsDemand(scoreInfo, fleet)
        }
    }
    return info;
}

const getTotalSuppliesDemand = (fleets: ShipStakingInfo[]) : data.FleetSuppliesStatus[] => {
    return fleets.map((el)=>{
        let info = getSuppliesDemandForFleet(el);
        return info;
    });
}

const getEmptySupplies = (): data.Supplies => {
    return {
        food: { 
            toBuy: 0,
            timeLeft: 0
        },
        arms: { 
            toBuy: 0,
            timeLeft: 0
        },
        fuel: { 
            toBuy: 0,
            timeLeft: 0
        },
        tools: { 
            toBuy: 0,
            timeLeft: 0
        },
    }
}

export const getAllFleetsDemandsInfo = async (connection: Connection, player: PublicKey): Promise<data.FleetSuppliesStatus[]> => {
    let fleetsInfo = await getAllFleetsForUserPublicKey(connection, player, data.score);
    return getTotalSuppliesDemand(fleetsInfo);
    
    
}

const getSupplyAmount = async (name: data.SuppliesNames, connection: Connection, player: PublicKey) : Promise<data.DemandInfo> => {
    let token = Armada.getSupplyTokenByName(name);
    console.log(name);
    try {
        let account = await token.getOrCreateAssociatedAccountInfo(player);
        let info = await token.getAccountInfo(account.address);
        return {
            toBuy: Number(info.amount),
            timeLeft: 0
        };
    }
    catch {
        return {
            toBuy: 0,
            timeLeft: 0
        }
    }
}

export const getStocksInfo = async (connection: Connection, player: PublicKey) : Promise<data.Supplies> => {
    return {
        food: await getSupplyAmount(data.SuppliesNames.FOOD, connection, player),
        fuel: await getSupplyAmount(data.SuppliesNames.FUEL, connection, player),
        arms: await getSupplyAmount(data.SuppliesNames.ARMS, connection, player),
        tools: await getSupplyAmount(data.SuppliesNames.TOOLS, connection, player),
    }
}

const getDeficit = (demands: data.Supplies, stocks: data.Supplies) : data.Supplies => {
    return {
        food: {
            toBuy: Math.max(0, demands.food.toBuy - stocks.food.toBuy),
            timeLeft: 0
        },
        fuel: {
            toBuy: Math.max(0, demands.fuel.toBuy - stocks.fuel.toBuy),
            timeLeft: 0
        },
        arms: {
            toBuy: Math.max(0, demands.arms.toBuy - stocks.arms.toBuy),
            timeLeft: 0
        },
        tools: {
            toBuy: Math.max(0, demands.tools.toBuy - stocks.tools.toBuy),
            timeLeft: 0
        }
    }
}

const getTotalDemands = (fleets: data.FleetSuppliesStatus[]) : data.Supplies => {
    const reducer = (totalArmadaInfo: data.Supplies, fleetInfo: data.FleetSuppliesStatus) => {
        let res: data.Supplies = {
            food: {
                toBuy: totalArmadaInfo.food.toBuy + fleetInfo.supplies.food.toBuy,
                timeLeft: 0
            },
            arms: {
                toBuy: totalArmadaInfo.arms.toBuy + fleetInfo.supplies.arms.toBuy,
                timeLeft: 0
            },
            fuel: {
                toBuy: totalArmadaInfo.fuel.toBuy + fleetInfo.supplies.fuel.toBuy,
                timeLeft: 0
            },
            tools: {
                toBuy: totalArmadaInfo.tools.toBuy + fleetInfo.supplies.tools.toBuy,
                timeLeft: 0
            }
        }
        return res
    }

    return fleets.reduce(reducer, getEmptySupplies());
}


export const createHarvestAllTransaction = async (connection: Connection, player: PublicKey): Promise<Transaction> => {
    let playerAtlasAccount = await getAssociatedTokenAddress(player, data.ATLAS_MINT);
    let armadaInfo = await getAllFleetsForUserPublicKey(connection, player, data.score);
    let tx = new Transaction();
    await Promise.all(armadaInfo.map(async (el) => {
        let ix =await createHarvestInstruction(
            connection, 
            player,
            playerAtlasAccount,
            el.shipMint,
            data.score
        )
        tx.add(...ix);
        })
    )
    return tx;
    //return new Transaction();
}


