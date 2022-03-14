import { Token } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import {
  getAllFleetsForUserPublicKey,
  getScoreVarsShipInfo,
  ScoreVarsShipInfo,
  ShipStakingInfo
} from "@staratlas/factory";
import axios from "axios";
import { floor } from "mathjs";
import ammoImg from "../assets/images/ammo.png";
import foodImg from "../assets/images/food.png";
import fuelImg from "../assets/images/fuel.png";
import toolImg from "../assets/images/tool.png";
import { ARMS_TOKEN, BUY_SUPPLY_MODES, COLORS, CONN, FLEET_PROGRAM, FOOD_TOKEN, FUEL_TOKEN, TOOLS_TOKEN } from "../constants";
import { useAppStore, useFleetStore, useResourceStore } from "../data/store";
import {
  IFleet,
  IInventory,
  InventorySupplies,
  InvoiceResources,
  IResourceData,
  ResourceRemaining,
  TOKENS,
  WaitingSignature
} from "../data/types";
import { getHours, retryAsync, timeout } from "../utils";
import {
  MarketService
} from "./marketService";



export class FleetService {
  public static refreshInterval: NodeJS.Timer | undefined = undefined
  

 // ! PUBLIC =======================
 public static async getInventorySupplies(pubkey:PublicKey) : Promise<InventorySupplies> {
  
  return {
    food: await FleetService.getTokenAmmount(FOOD_TOKEN, pubkey),
    arms: await FleetService.getTokenAmmount(ARMS_TOKEN, pubkey),
    fuel: await FleetService.getTokenAmmount(FUEL_TOKEN, pubkey),
    tools: await FleetService.getTokenAmmount(TOOLS_TOKEN, pubkey),
  };
 }

 public static async autoRefresh(publicKey: PublicKey) {
  FleetService.refreshInterval = setInterval(() => {
    if (useAppStore.getState().refreshing) return;
    useAppStore.getState().setRefreshing(true)
    Promise.all([  
      FleetService.getInventorySupplies(publicKey).then((inventorySupplies) => useFleetStore.getState().setInventory({ supplies: inventorySupplies }))
        .then(() => FleetService.getAllFleets(publicKey).then((fleets) =>  useFleetStore.getState().setFleets(fleets))),
      MarketService.getBalanceAtlas(publicKey).then((balance) => useResourceStore.getState().setAtlasBalance(balance))
    ]).finally(() =>  useAppStore.getState().setRefreshing(false))
  },20000)
 }

 public static async refresh(publicKey: PublicKey) {
  if (useAppStore.getState().refreshing) return;
  useAppStore.getState().setRefreshing(true)
  Promise.all([ 
    FleetService.getInventorySupplies(publicKey).then((inventorySupplies) => useFleetStore.getState().setInventory({ supplies: inventorySupplies }))
        .then(() => FleetService.getAllFleets(publicKey).then((fleets) =>  useFleetStore.getState().setFleets(fleets))),
    MarketService.getBalanceAtlas(publicKey).then((balance) => useResourceStore.getState().setAtlasBalance(balance))
  ]).finally(() =>  useAppStore.getState().setRefreshing(false))
  
 }

 public static async getAllFleets(pubKey: PublicKey) : Promise<IFleet[]> {
 
  const fleetsRaw =  await retryAsync(() => getAllFleetsForUserPublicKey(CONN, pubKey, FLEET_PROGRAM)) ;
  if (!fleetsRaw) {
    return [];
  }

  const fleets: IFleet[] = [];

  await Promise.all(
    fleetsRaw.map((fleet) => {
      return new Promise(async (res, rej) => {
        const shipMint = fleet.shipMint;
        const shipInfo = await getScoreVarsShipInfo(
          CONN,
          FLEET_PROGRAM,
          shipMint
        );
        const shipNftInfo = await axios.get(
          `https://galaxy.staratlas.com/nfts/${shipMint.toString()}`
        );
        
      
        const urlSplit = shipNftInfo.data.image.slice(0,-4).split("/")
        const imageName = urlSplit[urlSplit.length - 1]
        fleets.push({
          ...fleet,
          name: shipNftInfo.data.name,
          image: `"https://api.staratlas.club/thumb/320x180?url=https://storage.googleapis.com/nft-assets/items/${imageName}.jpg"`,
          resources: FleetService.getFleetRemainingResources(shipInfo, fleet),
          pendingRewardsV2: FleetService.getReward(shipInfo, fleet) / 100000000,
        });

        // End Promise
        res(1);
        
      })
    })
  );

  return fleets;
 
 }

 public static getFleetRemainingResources(shipInfo: ScoreVarsShipInfo, fleet: ShipStakingInfo) : {[key:string]:ResourceRemaining} {
 
  let timePassSinceStart = FleetService.timePassSinceLastAction(fleet);

  return {
    food: FleetService.getRemainFoodDetails(shipInfo, fleet, timePassSinceStart),
    arms: FleetService.getRemainArmsDetails(shipInfo, fleet, timePassSinceStart),
    fuel: FleetService.getRemainFuelDetails(shipInfo, fleet, timePassSinceStart),
    health: FleetService.getRemainHealthDetails(shipInfo, fleet, timePassSinceStart),
  };
 
 }

 public static calculateFleetRemainingTime(fleet: IFleet) : number {
 
  const minTime = Math.min(
    fleet.resources.arms.secondsLeft,
    fleet.resources.food.secondsLeft,
    fleet.resources.fuel.secondsLeft,
    fleet.resources.health.secondsLeft
  );

  return minTime < 0 ? 0 : floor(minTime);
 
 }

 public static async createInvoice(inventory: IInventory, resourcesData: { [key: string]: IResourceData; }, mode: string, selectedFleets: IFleet[], startAppLoading: (...args:any) => void) : Promise<InvoiceResources | undefined> {
  
  

  const resourcesToBuy: InvoiceResources = {
    ammo: {
      amount: 0,
      atlas: 0,
      usdc: 0,
    },
    food: {
      amount: 0,
      atlas: 0,
      usdc: 0,
    },
    fuel: {
      amount: 0,
      atlas: 0,
      usdc: 0,
    },
    tools: {
      amount: 0,
      atlas: 0,
      usdc: 0,
    },
    market: {
      rate: 0,
    },
  };
  
  const [
    ammoPriceDetials,
    foodPriceDetials,
    fuelPriceDetials,
    toolPriceDetials,
  ] = await Promise.all([
    MarketService.getAmmoMarketPriceDetials().then(details => {
      startAppLoading({loading: true, message: 'Getting Market Prices for Resources', pct: useAppStore.getState().appLoading.pct! + 10})
      return details;
    }),
    MarketService.getFoodMarketPriceDetials().then(details => {
      startAppLoading({loading: true, message: 'Getting Market Prices for Resources', pct: useAppStore.getState().appLoading.pct! + 10})
      return details;
    }),
    MarketService.getFuelMarketPriceDetials().then(details => {
      startAppLoading({loading: true, message: 'Getting Market Prices for Resources', pct: useAppStore.getState().appLoading.pct! + 10})
      return details;
    }),
    MarketService.getToolMarketPriceDetials().then(details => {
      startAppLoading({loading: true, message: 'Getting Market Prices for Resources', pct: useAppStore.getState().appLoading.pct! + 10})
      return details;
    }),
  ]);

  if (
    ammoPriceDetials == -1 ||
    foodPriceDetials == -1 ||
    fuelPriceDetials == -1 ||
    toolPriceDetials == -1
  ) {
    return undefined;
  }

  startAppLoading({loading: true, message: 'Calculating Resources for Invoice', pct: useAppStore.getState().appLoading.pct! + 20})
  
  // ! Full Tank
  if (mode == BUY_SUPPLY_MODES.FULL_TANKS) {

    // ? ammo
    resourcesToBuy.ammo.amount = (resourcesData.ammo.untisNeedToBuy + 20);
    resourcesToBuy.ammo.atlas = ammoPriceDetials.atlas * (resourcesData.ammo.untisNeedToBuy + 20);
    resourcesToBuy.ammo.usdc = ammoPriceDetials.usdc * (resourcesData.ammo.untisNeedToBuy + 20);

    // ? food
    resourcesToBuy.food.amount = (resourcesData.food.untisNeedToBuy + 20);
    resourcesToBuy.food.atlas = foodPriceDetials.atlas * (resourcesData.food.untisNeedToBuy + 20);
    resourcesToBuy.food.usdc = foodPriceDetials.usdc * (resourcesData.food.untisNeedToBuy + 20);

    // ? fuel
    resourcesToBuy.fuel.amount = (resourcesData.fuel.untisNeedToBuy + 20);
    resourcesToBuy.fuel.atlas = fuelPriceDetials.atlas * (resourcesData.fuel.untisNeedToBuy + 20);
    resourcesToBuy.fuel.usdc = fuelPriceDetials.usdc * (resourcesData.fuel.untisNeedToBuy + 20);

    //? Tools
    resourcesToBuy.tools.amount =( resourcesData.tools.untisNeedToBuy + 20);
    resourcesToBuy.tools.atlas = toolPriceDetials.atlas *( resourcesData.tools.untisNeedToBuy + 20);
    resourcesToBuy.tools.usdc = toolPriceDetials.usdc *( resourcesData.tools.untisNeedToBuy + 20);

    //? Market
    resourcesToBuy.market.rate = ammoPriceDetials.rate;
  }

  // ! Optimal
  if (mode == BUY_SUPPLY_MODES.OPTIMAL) {

    const unitsTarget = {
      ammo: 0,
      fuel: 0,
      tools: 0
    }

    // ? food
    resourcesToBuy.food.amount = (resourcesData.food.untisNeedToBuy + 20);
    resourcesToBuy.food.atlas = foodPriceDetials.atlas * (resourcesData.food.untisNeedToBuy + 20) ;
    resourcesToBuy.food.usdc = foodPriceDetials.usdc * (resourcesData.food.untisNeedToBuy + 20) ;
    
    const foodMaxSeconds = resourcesData.food.maxSeconds;

    // ? how many units
    selectedFleets.forEach((fleet) => {
      unitsTarget.ammo += (foodMaxSeconds * fleet.resources.arms.burnRate); 
      unitsTarget.fuel += (foodMaxSeconds * fleet.resources.fuel.burnRate); 
      unitsTarget.tools += (foodMaxSeconds * fleet.resources.health.burnRate); 
    });


    // ? ammo
    const ammoUnitsToBuy = Math.max(( unitsTarget.ammo - (resourcesData.ammo.supply + resourcesData.ammo.unitsLeft) + 20), 0);
    resourcesToBuy.ammo.amount = ammoUnitsToBuy;
    resourcesToBuy.ammo.atlas = ammoPriceDetials.atlas * ammoUnitsToBuy;
    resourcesToBuy.ammo.usdc = ammoPriceDetials.usdc * ammoUnitsToBuy;

    // ? fuel
    const fuelUnitsToBuy = Math.max(( unitsTarget.fuel - (resourcesData.fuel.supply + resourcesData.fuel.unitsLeft) + 20), 0);
    resourcesToBuy.fuel.amount = fuelUnitsToBuy;
    resourcesToBuy.fuel.atlas = fuelPriceDetials.atlas * fuelUnitsToBuy;
    resourcesToBuy.fuel.usdc = fuelPriceDetials.usdc * fuelUnitsToBuy;


    //? Tools
    const toolsUnitsToBuy = Math.max(( unitsTarget.tools - (resourcesData.tools.supply + resourcesData.tools.unitsLeft) + 20), 0);
    resourcesToBuy.tools.amount = toolsUnitsToBuy;
    resourcesToBuy.tools.atlas = toolPriceDetials.atlas * toolsUnitsToBuy;
    resourcesToBuy.tools.usdc = toolPriceDetials.usdc * toolsUnitsToBuy;

    //? Market
    resourcesToBuy.market.rate = ammoPriceDetials.rate;
  }

  // ! Urgent
  if (mode == BUY_SUPPLY_MODES.URGENT) {
    const maxSeconds = 12 * 60 * 60;  
    const unitsTarget = {
      food: 0,
      ammo: 0,
      fuel: 0,
      tools: 0
    }

    // ? how many units
    selectedFleets.forEach((fleet) => {
      unitsTarget.food += (maxSeconds * fleet.resources.food.burnRate); 
      unitsTarget.ammo += (maxSeconds * fleet.resources.arms.burnRate); 
      unitsTarget.fuel += (maxSeconds * fleet.resources.fuel.burnRate); 
      unitsTarget.tools += (maxSeconds * fleet.resources.health.burnRate); 
    });

    // ? food
    const foodUnitsToBuy = Math.max(( unitsTarget.food - (resourcesData.food.supply + resourcesData.food.unitsLeft) + 20), 0);
    resourcesToBuy.food.amount = foodUnitsToBuy;
    resourcesToBuy.food.atlas = foodPriceDetials.atlas * foodUnitsToBuy;
    resourcesToBuy.food.usdc = foodPriceDetials.usdc * foodUnitsToBuy;

    // ? ammo
    const ammoUnitsToBuy = Math.max(( unitsTarget.ammo - (resourcesData.ammo.supply + resourcesData.ammo.unitsLeft) + 20), 0);
    resourcesToBuy.ammo.amount = ammoUnitsToBuy;
    resourcesToBuy.ammo.atlas = ammoPriceDetials.atlas * ammoUnitsToBuy;
    resourcesToBuy.ammo.usdc = ammoPriceDetials.usdc * ammoUnitsToBuy;

    // ? fuel
    const fuelUnitsToBuy = Math.max(( unitsTarget.fuel - (resourcesData.fuel.supply + resourcesData.fuel.unitsLeft) + 20), 0);
    resourcesToBuy.fuel.amount = fuelUnitsToBuy;
    resourcesToBuy.fuel.atlas = fuelPriceDetials.atlas * fuelUnitsToBuy;
    resourcesToBuy.fuel.usdc = fuelPriceDetials.usdc * fuelUnitsToBuy;


    //? Tools
    const toolsUnitsToBuy = Math.max(( unitsTarget.tools - (resourcesData.tools.supply + resourcesData.tools.unitsLeft) + 20), 0);
    resourcesToBuy.tools.amount = toolsUnitsToBuy;
    resourcesToBuy.tools.atlas = toolPriceDetials.atlas * toolsUnitsToBuy;
    resourcesToBuy.tools.usdc = toolPriceDetials.usdc * toolsUnitsToBuy;

    //? Market
    resourcesToBuy.market.rate = ammoPriceDetials.rate;
  }

  // ! Critical
  if (mode == BUY_SUPPLY_MODES.CRITICAL) {
    
    const maxSeconds = Math.min(...selectedFleets.map(f => {
        let min = Math.max(
          f.resources.arms.secondsLeft,
          f.resources.food.secondsLeft,
          f.resources.fuel.secondsLeft,
          f.resources.health.secondsLeft);

        if (f.resources.arms.secondsLeft > 0 && f.resources.arms.secondsLeft < min){
          min = f.resources.arms.secondsLeft;
        }

        if (f.resources.food.secondsLeft > 0 && f.resources.food.secondsLeft < min){
          min = f.resources.food.secondsLeft;
        }

        if (f.resources.fuel.secondsLeft > 0 && f.resources.fuel.secondsLeft < min){
          min = f.resources.fuel.secondsLeft;
        }

        if (f.resources.health.secondsLeft > 0 && f.resources.health.secondsLeft < min){
          min = f.resources.health.secondsLeft;
        }
        
        return min;
      })
    ); 
    const unitsTarget = {
      food: 0,
      ammo: 0,
      fuel: 0,
      tools: 0
    }

    // ? how many units
    selectedFleets.forEach((fleet) => {
      unitsTarget.food += (maxSeconds * fleet.resources.food.burnRate * fleet.shipQuantityInEscrow.toNumber()); 
      unitsTarget.ammo += (maxSeconds * fleet.resources.arms.burnRate * fleet.shipQuantityInEscrow.toNumber()); 
      unitsTarget.fuel += (maxSeconds * fleet.resources.fuel.burnRate * fleet.shipQuantityInEscrow.toNumber()); 
      unitsTarget.tools += (maxSeconds * fleet.resources.health.burnRate * fleet.shipQuantityInEscrow.toNumber()); 
    });

    // ? food
    const foodUnitsToBuy = Math.max(( unitsTarget.food - (resourcesData.food.supply + resourcesData.food.unitsLeft) + 20), 0);
    resourcesToBuy.food.amount = foodUnitsToBuy;
    resourcesToBuy.food.atlas = foodPriceDetials.atlas * foodUnitsToBuy;
    resourcesToBuy.food.usdc = foodPriceDetials.usdc * foodUnitsToBuy;

    // ? ammo
    const ammoUnitsToBuy = Math.max(( unitsTarget.ammo - (resourcesData.ammo.supply + resourcesData.ammo.unitsLeft) + 20), 0);
    resourcesToBuy.ammo.amount = ammoUnitsToBuy;
    resourcesToBuy.ammo.atlas = ammoPriceDetials.atlas * ammoUnitsToBuy;
    resourcesToBuy.ammo.usdc = ammoPriceDetials.usdc * ammoUnitsToBuy;

    // ? fuel
    const fuelUnitsToBuy = Math.max(( unitsTarget.fuel - (resourcesData.fuel.supply + resourcesData.fuel.unitsLeft) + 20), 0);
    resourcesToBuy.fuel.amount = fuelUnitsToBuy;
    resourcesToBuy.fuel.atlas = fuelPriceDetials.atlas * fuelUnitsToBuy;
    resourcesToBuy.fuel.usdc = fuelPriceDetials.usdc * fuelUnitsToBuy;


    //? Tools
    const toolsUnitsToBuy = Math.max(( unitsTarget.tools - (resourcesData.tools.supply + resourcesData.tools.unitsLeft) + 20), 0);
    resourcesToBuy.tools.amount = toolsUnitsToBuy;
    resourcesToBuy.tools.atlas = toolPriceDetials.atlas * toolsUnitsToBuy;
    resourcesToBuy.tools.usdc = toolPriceDetials.usdc * toolsUnitsToBuy;

    //? Market
    resourcesToBuy.market.rate = ammoPriceDetials.rate;
  }

  return resourcesToBuy;
 
 }

 public static calculateResources(selectedFleets: IFleet[], inventory: IInventory | undefined) : { [key: string]: IResourceData; } {

  const resourcesData: { [key: string]: IResourceData } = {
    ammo: {
      imgSrc: ammoImg,
      id: TOKENS.ammo,
      pct1Color: COLORS.THICK_GREY,
      maxSeconds: 0,
      maxUnits: 0,
      unitsNeedToMax: 0,
      burnRate: 0,
      secondsLeft: 0,
      unitsLeft: 0,
      secondsNeedToMax: 0,
      untisNeedToBuy: 0,
      supply: 0,
      isBlinking: false,
      pct1: 0,
      pct2: 0,
      isLoading: false,
    },
    food: {
      imgSrc: foodImg,
      id: TOKENS.food,
      pct1Color: COLORS.THICK_GREY,
      maxSeconds: 0,
      maxUnits: 0,
      unitsNeedToMax: 0,
      burnRate: 0,
      untisNeedToBuy: 0,
      supply: 0,
      secondsNeedToMax: 0,
      secondsLeft: 0,
      unitsLeft: 0,
      isBlinking: false,
      pct1: 0,
      pct2: 0,
      isLoading: false,
    },
    fuel: {
      imgSrc: fuelImg,
      id: TOKENS.fuel,
      pct1Color: COLORS.THICK_GREY,
      maxSeconds: 0,
      maxUnits: 0,
      unitsNeedToMax: 0,
      burnRate: 0,
      untisNeedToBuy: 0,
      supply: 0,
      secondsNeedToMax: 0,
      secondsLeft: 0,
      unitsLeft: 0,
      isBlinking: false,
      pct1: 0,
      pct2: 0,
      isLoading: false,
    },
    tools: {
      imgSrc: toolImg,
      id: TOKENS.tools,
      pct1Color: COLORS.THICK_GREY,
      maxSeconds: 0,
      maxUnits: 0,
      unitsNeedToMax: 0,
      burnRate: 0,
      untisNeedToBuy: 0,
      supply: 0,
      secondsNeedToMax: 0,
      secondsLeft: 0,
      unitsLeft: 0,
      isBlinking: false,
      pct1: 0,
      pct2: 0,
      isLoading: false,
    },
  };

  if(!inventory) {
    return resourcesData;
  }

  selectedFleets.forEach((fleet) => {
    // Ammo
    resourcesData.ammo["maxSeconds"] = resourcesData.ammo["maxSeconds"] + fleet.resources.arms.maxSeconds ||
      fleet.resources.arms.maxSeconds;
    resourcesData.ammo["secondsLeft"] = resourcesData.ammo["secondsLeft"] + fleet.resources.arms.secondsLeft || fleet.resources.arms.secondsLeft;
    // resourcesData.food['secondsNeedToMax'] = fleet.resources.arms.maxSeconds - fleet.resources.arms.secondsLeft;
    resourcesData.ammo["unitsNeedToMax"] = resourcesData.ammo["unitsNeedToMax"] + fleet.resources.arms.maxUnits - fleet.resources.arms.unitsLeft || fleet.resources.arms.maxUnits - fleet.resources.arms.unitsLeft;
    resourcesData.ammo["maxUnits"] = resourcesData.ammo["maxUnits"] + fleet.resources.arms.maxUnits || fleet.resources.arms.maxUnits;
    resourcesData.ammo["unitsLeft"] = resourcesData.ammo["unitsLeft"] + fleet.resources.arms.unitsLeft || fleet.resources.arms.unitsLeft;

    if (fleet.resources.arms.unitsLeft > 0 && fleet.resources.arms.secondsLeft > 0 && resourcesData.ammo["pct1Color"] != COLORS.THICK_RED) {
      resourcesData.ammo["pct1Color"] = COLORS.THICK_BLUE;
    }
    if (fleet.resources.arms.unitsLeft == 0 ||  fleet.resources.arms.secondsLeft == 0) {
      resourcesData.ammo["pct1Color"] = COLORS.THICK_RED;
      resourcesData.ammo["isBlinking"] = true;
    }
    if (getHours(fleet.resources.arms.secondsLeft) < 12 && resourcesData.ammo["pct1Color"] != COLORS.THICK_RED) {
      resourcesData.ammo["pct1Color"] = COLORS.THICK_YELLOW;
    }

    // Food
    resourcesData.food["maxSeconds"] = resourcesData.food["maxSeconds"] + fleet.resources.food.maxSeconds || fleet.resources.food.maxSeconds;
    resourcesData.food["secondsLeft"] = resourcesData.food["secondsLeft"] + fleet.resources.food.secondsLeft || fleet.resources.food.secondsLeft;
    resourcesData.food["unitsNeedToMax"] = resourcesData.food["unitsNeedToMax"] + fleet.resources.food.maxUnits - fleet.resources.food.unitsLeft || fleet.resources.food.maxUnits - fleet.resources.food.unitsLeft;
    resourcesData.food["maxUnits"] = resourcesData.food["maxUnits"] + fleet.resources.food.maxUnits || fleet.resources.food.maxUnits;
    resourcesData.food["unitsLeft"] = resourcesData.food["unitsLeft"] + fleet.resources.food.unitsLeft || fleet.resources.food.unitsLeft;

    if (fleet.resources.food.unitsLeft > 0 && fleet.resources.food.secondsLeft > 0 && resourcesData.food["pct1Color"] != COLORS.THICK_RED) {
      resourcesData.food["pct1Color"] = COLORS.THICK_BLUE;
    }
    if (fleet.resources.food.unitsLeft == 0 || fleet.resources.food.secondsLeft == 0) {
      resourcesData.food["pct1Color"] = COLORS.THICK_RED;
      resourcesData.food["isBlinking"] = true;
    }

    if (getHours(fleet.resources.food.secondsLeft) < 12 && resourcesData.food["pct1Color"] != COLORS.THICK_RED) {
      resourcesData.food["pct1Color"] = COLORS.THICK_YELLOW;
    }

    // Fuel
    resourcesData.fuel["maxSeconds"] = resourcesData.fuel["maxSeconds"] + fleet.resources.fuel.maxSeconds || fleet.resources.fuel.maxSeconds;
    resourcesData.fuel["secondsLeft"] = resourcesData.fuel["secondsLeft"] + fleet.resources.fuel.secondsLeft || fleet.resources.fuel.secondsLeft;
    resourcesData.fuel["unitsNeedToMax"] = resourcesData.fuel["unitsNeedToMax"] + fleet.resources.fuel.maxUnits - fleet.resources.fuel.unitsLeft || fleet.resources.fuel.maxUnits - fleet.resources.fuel.unitsLeft;
    resourcesData.fuel["maxUnits"] = resourcesData.fuel["maxUnits"] + fleet.resources.fuel.maxUnits || fleet.resources.fuel.maxUnits;
    resourcesData.fuel["unitsLeft"] = resourcesData.fuel["unitsLeft"] + fleet.resources.fuel.unitsLeft || fleet.resources.fuel.unitsLeft;

    if (fleet.resources.fuel.unitsLeft > 0 && fleet.resources.fuel.secondsLeft > 0 && resourcesData.fuel["pct1Color"] != COLORS.THICK_RED) {
      resourcesData.fuel["pct1Color"] = COLORS.THICK_BLUE;
    }
    if (fleet.resources.fuel.unitsLeft == 0 || fleet.resources.fuel.secondsLeft == 0) {
      resourcesData.fuel["pct1Color"] = COLORS.THICK_RED;
      resourcesData.fuel["isBlinking"] = true;
    }
    if (getHours(fleet.resources.fuel.secondsLeft) < 12 && resourcesData.fuel["pct1Color"] != COLORS.THICK_RED ) {
      resourcesData.fuel["pct1Color"] = COLORS.THICK_YELLOW;
    }

    // Tool
    resourcesData.tools["maxSeconds"] = resourcesData.tools["maxSeconds"] + fleet.resources.health.maxSeconds || fleet.resources.health.maxSeconds;
    resourcesData.tools["secondsLeft"] = resourcesData.tools["secondsLeft"] + fleet.resources.health.secondsLeft || fleet.resources.health.secondsLeft;
    resourcesData.tools["secondsNeedToMax"] = fleet.resources.health.maxSeconds - fleet.resources.health.secondsLeft;
    resourcesData.tools["unitsNeedToMax"] = resourcesData.tools["unitsNeedToMax"] + fleet.resources.health.maxUnits - fleet.resources.health.unitsLeft || fleet.resources.health.maxUnits - fleet.resources.health.unitsLeft;
    resourcesData.tools["maxUnits"] = resourcesData.tools["maxUnits"] + fleet.resources.health.maxUnits || fleet.resources.health.maxUnits;
    resourcesData.tools["unitsLeft"] = resourcesData.tools["unitsLeft"] + fleet.resources.health.unitsLeft || fleet.resources.health.unitsLeft;

    if (fleet.resources.health.unitsLeft > 0 && fleet.resources.health.secondsLeft > 0 && resourcesData.tools["pct1Color"] != COLORS.THICK_RED) {
      resourcesData.tools["pct1Color"] = COLORS.THICK_BLUE;
    }
    if (fleet.resources.health.unitsLeft == 0 || fleet.resources.health.secondsLeft == 0) {
      resourcesData.tools["pct1Color"] = COLORS.THICK_RED;
      resourcesData.tools["isBlinking"] = true;
    }
    if (getHours(fleet.resources.health.secondsLeft) < 12 && resourcesData.tools["pct1Color"] != COLORS.THICK_RED) {
      resourcesData.tools["pct1Color"] = COLORS.THICK_YELLOW;
    }
  });

  resourcesData.ammo.pct1 = Math.min(resourcesData.ammo.unitsLeft / resourcesData.ammo.maxUnits, 1) || 0;
  resourcesData.food.pct1 = Math.min(resourcesData.food.unitsLeft / resourcesData.food.maxUnits, 1) || 0;
  resourcesData.fuel.pct1 = Math.min(resourcesData.fuel.unitsLeft / resourcesData.fuel.maxUnits, 1) || 0;
  resourcesData.tools.pct1 = Math.min(resourcesData.tools.unitsLeft / resourcesData.tools.maxUnits, 1) || 0;

  if (inventory) {
    resourcesData.ammo.pct2 = inventory.supplies.arms - resourcesData.ammo.unitsNeedToMax >= 0  ? 0 : Math.abs(inventory.supplies.arms - resourcesData.ammo.unitsNeedToMax) / resourcesData.ammo.maxUnits;
    resourcesData.food.pct2 = inventory.supplies.food - resourcesData.food.unitsNeedToMax >= 0  ? 0 : Math.abs(inventory.supplies.food - resourcesData.food.unitsNeedToMax) / resourcesData.food.maxUnits;
    resourcesData.fuel.pct2 = inventory.supplies.fuel - resourcesData.fuel.unitsNeedToMax >= 0  ? 0 : Math.abs(inventory.supplies.fuel - resourcesData.fuel.unitsNeedToMax) / resourcesData.fuel.maxUnits;
    resourcesData.tools.pct2 = inventory.supplies.tools - resourcesData.tools.unitsNeedToMax >= 0  ? 0 : Math.abs(inventory.supplies.tools - resourcesData.tools.unitsNeedToMax) / resourcesData.tools.maxUnits;

    resourcesData.ammo.untisNeedToBuy = Math.max(0, resourcesData.ammo.unitsNeedToMax - inventory.supplies.arms);
    resourcesData.food.untisNeedToBuy = Math.max(0, resourcesData.food.unitsNeedToMax - inventory.supplies.food);
    resourcesData.fuel.untisNeedToBuy = Math.max(0, resourcesData.fuel.unitsNeedToMax - inventory.supplies.fuel);
    resourcesData.tools.untisNeedToBuy = Math.max(0, resourcesData.tools.unitsNeedToMax - inventory.supplies.tools);

    resourcesData.ammo.supply = inventory.supplies.arms;
    resourcesData.food.supply = inventory.supplies.food;
    resourcesData.fuel.supply = inventory.supplies.fuel;
    resourcesData.tools.supply = inventory.supplies.tools;
  }

  
  return resourcesData;

 }

 public static getPendingAtlas()  {
   
  return useFleetStore.getState().fleets.reduce((sum, fleet) => {
    return sum + fleet.pendingRewardsV2;
  } ,0)
 }

 public static async checkSignatures(signatures: WaitingSignature[]) {
   
  let _signatures = signatures.map( sig => ({...sig}))
  let count = 20;
  while (1) {
    try {

      // ! signatures not done yet
      const notYet = _signatures.filter(sig => sig.status != 'finalized')

      // ! getting the updates
      const updatesOnes = await Promise.all(
          notYet.map(sig => 
            retryAsync(async () => {
                  return {
                    hash: sig.hash,
                    status:  (await CONN.getSignatureStatus(sig.hash)).value?.confirmationStatus ||  "processing"
                  };
            })
          )
      )

      // ! updating the store with fresh ones
      const newSigs = _signatures.map((existingSig) => {
        const found = updatesOnes.find((sig) => sig!.hash == existingSig.hash);
        if (found) {
          return found
        } else {
          return existingSig;
        }
      }) as WaitingSignature[];

      _signatures = newSigs.map(sig => ({...sig}))
      useAppStore.getState().setSignaturesToWait(_signatures)

      // ! checking if all done
      const isDone = newSigs.filter(sig => sig.status != 'finalized').length == 0;
      if (isDone) {
        return true
      } else {
        count --;
        if (count == 0) {
          useAppStore.getState().setSignaturesToWait( 
            _signatures.map(sig => ({...sig, status: sig.status != 'finalized' ? 'unknown': 'finalized'})) as WaitingSignature[]
          )
          return false
        }
        await timeout(6000)
      }

    } catch (error) {

    } 
  }
 }

 public static findWhoDeplateFirst(fleets:IFleet[]) :  Partial<IFleet>  {

  if (fleets.length == 0) {
    return  {
      stats: {
        ammo: {
          imgSrc: ammoImg,
          id: TOKENS.ammo,
          pct1Color: COLORS.THICK_GREY,
          maxSeconds: 0,
          maxUnits: 0,
          unitsNeedToMax: 0,
          burnRate: 0,
          secondsLeft: 0,
          unitsLeft: 0,
          secondsNeedToMax: 0,
          untisNeedToBuy: 0,
          supply: 0,
          isBlinking: false,
          pct1: 0,
          pct2: 0,
          isLoading: false,
        },
        food: {
          imgSrc: foodImg,
          id: TOKENS.food,
          pct1Color: COLORS.THICK_GREY,
          maxSeconds: 0,
          maxUnits: 0,
          unitsNeedToMax: 0,
          burnRate: 0,
          untisNeedToBuy: 0,
          supply: 0,
          secondsNeedToMax: 0,
          secondsLeft: 0,
          unitsLeft: 0,
          isBlinking: false,
          pct1: 0,
          pct2: 0,
          isLoading: false,
        },
        fuel: {
          imgSrc: fuelImg,
          id: TOKENS.fuel,
          pct1Color: COLORS.THICK_GREY,
          maxSeconds: 0,
          maxUnits: 0,
          unitsNeedToMax: 0,
          burnRate: 0,
          untisNeedToBuy: 0,
          supply: 0,
          secondsNeedToMax: 0,
          secondsLeft: 0,
          unitsLeft: 0,
          isBlinking: false,
          pct1: 0,
          pct2: 0,
          isLoading: false,
        },
        tools: {
          imgSrc: toolImg,
          id: TOKENS.tools,
          pct1Color: COLORS.THICK_GREY,
          maxSeconds: 0,
          maxUnits: 0,
          unitsNeedToMax: 0,
          burnRate: 0,
          untisNeedToBuy: 0,
          supply: 0,
          secondsNeedToMax: 0,
          secondsLeft: 0,
          unitsLeft: 0,
          isBlinking: false,
          pct1: 0,
          pct2: 0,
          isLoading: false,
        },
      } 
    } as Partial<IFleet>;
  }

  let minFleet = fleets[0]
  for (const fleet of fleets) {
    const deplationTime = Math.min(
      fleet!.stats!.ammo.secondsLeft,
      fleet!.stats!.food.secondsLeft,
      fleet!.stats!.fuel.secondsLeft,
      fleet!.stats!.tools.secondsLeft,
    )

    const minDeplationTime = Math.min(
      minFleet!.stats!.ammo.secondsLeft,
      minFleet!.stats!.food.secondsLeft,
      minFleet!.stats!.fuel.secondsLeft,
      minFleet!.stats!.tools.secondsLeft,
    )

    if (deplationTime < minDeplationTime) {
      minFleet = fleet;
    }
  }

  return minFleet;
 }

 public static findWhoDeplateLast(fleets:IFleet[]) :  Partial<IFleet>  {

  if (fleets.length == 0) {
    return  {
      stats: {
        ammo: {
          imgSrc: ammoImg,
          id: TOKENS.ammo,
          pct1Color: COLORS.THICK_GREY,
          maxSeconds: 0,
          maxUnits: 0,
          unitsNeedToMax: 0,
          burnRate: 0,
          secondsLeft: 0,
          unitsLeft: 0,
          secondsNeedToMax: 0,
          untisNeedToBuy: 0,
          supply: 0,
          isBlinking: false,
          pct1: 0,
          pct2: 0,
          isLoading: false,
        },
        food: {
          imgSrc: foodImg,
          id: TOKENS.food,
          pct1Color: COLORS.THICK_GREY,
          maxSeconds: 0,
          maxUnits: 0,
          unitsNeedToMax: 0,
          burnRate: 0,
          untisNeedToBuy: 0,
          supply: 0,
          secondsNeedToMax: 0,
          secondsLeft: 0,
          unitsLeft: 0,
          isBlinking: false,
          pct1: 0,
          pct2: 0,
          isLoading: false,
        },
        fuel: {
          imgSrc: fuelImg,
          id: TOKENS.fuel,
          pct1Color: COLORS.THICK_GREY,
          maxSeconds: 0,
          maxUnits: 0,
          unitsNeedToMax: 0,
          burnRate: 0,
          untisNeedToBuy: 0,
          supply: 0,
          secondsNeedToMax: 0,
          secondsLeft: 0,
          unitsLeft: 0,
          isBlinking: false,
          pct1: 0,
          pct2: 0,
          isLoading: false,
        },
        tools: {
          imgSrc: toolImg,
          id: TOKENS.tools,
          pct1Color: COLORS.THICK_GREY,
          maxSeconds: 0,
          maxUnits: 0,
          unitsNeedToMax: 0,
          burnRate: 0,
          untisNeedToBuy: 0,
          supply: 0,
          secondsNeedToMax: 0,
          secondsLeft: 0,
          unitsLeft: 0,
          isBlinking: false,
          pct1: 0,
          pct2: 0,
          isLoading: false,
        },
      } 
    } as Partial<IFleet>;
  }

  let maxFleet = fleets[0]
  for (const fleet of fleets) {
    const deplationTime = Math.min(
      fleet!.stats!.ammo.secondsLeft,
      fleet!.stats!.food.secondsLeft,
      fleet!.stats!.fuel.secondsLeft,
      fleet!.stats!.tools.secondsLeft,
    )

    const maxDeplationTime = Math.min(
      maxFleet!.stats!.ammo.secondsLeft,
      maxFleet!.stats!.food.secondsLeft,
      maxFleet!.stats!.fuel.secondsLeft,
      maxFleet!.stats!.tools.secondsLeft,
    )

    if (deplationTime > maxDeplationTime) {
      maxFleet = fleet;
    }
  }

  return maxFleet;
 }


// ! PRIVATE =======================
 public static async checkSignature(signature: WaitingSignature) {
  

 }

 private static getRemainFoodDetails(shipInfo: ScoreVarsShipInfo, fleet: ShipStakingInfo, timePassSinceStart: number) : ResourceRemaining {
 
  const secondsLeft = FleetService.getRemainFoodSec(fleet, timePassSinceStart);
  const unitsBurnRate = 1 / (shipInfo.millisecondsToBurnOneFood / 1000); // Per Second
  const unitsBurnt = unitsBurnRate * timePassSinceStart * fleet.shipQuantityInEscrow.toNumber();
  const unitsLeft = unitsBurnRate * secondsLeft * fleet.shipQuantityInEscrow.toNumber();
  const unitsLeftPct = unitsLeft / (shipInfo.foodMaxReserve * fleet.shipQuantityInEscrow.toNumber());
  const totalSeconds = fleet.foodCurrentCapacity.toNumber();
  const maxSeconds = shipInfo.foodMaxReserve * fleet.shipQuantityInEscrow.toNumber() * (shipInfo.millisecondsToBurnOneFood / 1000 / fleet.shipQuantityInEscrow.toNumber());
  const maxUnits = shipInfo.foodMaxReserve * fleet.shipQuantityInEscrow.toNumber();

  return {
    unitsBurnt,
    unitsLeftPct,
    unitsLeft: unitsLeft,
    secondsLeft: Math.max(0, secondsLeft),
    totalSeconds,
    maxSeconds,
    maxUnits,
    burnRate: unitsBurnRate
  };
 
 }

 private static getRemainArmsDetails(shipInfo: ScoreVarsShipInfo, fleet: ShipStakingInfo, timePassSinceStart: number) : ResourceRemaining {
 
  const secondsLeft = FleetService.getRemainArmsSec(fleet, timePassSinceStart);
  const unitsBurnRate = 1 / (shipInfo.millisecondsToBurnOneArms / 1000); // Per Second
  const unitsBurnt = unitsBurnRate * timePassSinceStart * fleet.shipQuantityInEscrow.toNumber();
  const unitsLeft = unitsBurnRate * secondsLeft * fleet.shipQuantityInEscrow.toNumber();
  const unitsLeftPct = unitsLeft / (shipInfo.armsMaxReserve * fleet.shipQuantityInEscrow.toNumber());
  const maxSeconds = shipInfo.armsMaxReserve * fleet.shipQuantityInEscrow.toNumber() * (shipInfo.millisecondsToBurnOneArms / 1000 / fleet.shipQuantityInEscrow.toNumber());
  // this is different than maxSeconds
  const totalSeconds = fleet.armsCurrentCapacity.toNumber();
  const maxUnits = shipInfo.armsMaxReserve * fleet.shipQuantityInEscrow.toNumber();

  return {
    unitsBurnt,
    unitsLeftPct,
    unitsLeft: unitsLeft,
    secondsLeft: Math.max(0, secondsLeft),
    totalSeconds,
    maxSeconds,
    maxUnits,
    burnRate: unitsBurnRate
  };
 
 }

 private static getRemainFuelDetails(shipInfo: ScoreVarsShipInfo, fleet: ShipStakingInfo, timePassSinceStart: number) : ResourceRemaining {
 
  const secondsLeft = FleetService.getRemainFuelSec(fleet, timePassSinceStart);
  const unitsBurnRate = 1 / (shipInfo.millisecondsToBurnOneFuel / 1000); // Per Second
  const unitsBurnt = unitsBurnRate * timePassSinceStart * fleet.shipQuantityInEscrow.toNumber();
  const unitsLeft = unitsBurnRate * secondsLeft * fleet.shipQuantityInEscrow.toNumber();
  const unitsLeftPct = unitsLeft / (shipInfo.fuelMaxReserve * fleet.shipQuantityInEscrow.toNumber());
  const totalSeconds = fleet.fuelCurrentCapacity.toNumber();
  const maxSeconds = shipInfo.fuelMaxReserve * fleet.shipQuantityInEscrow.toNumber() * (shipInfo.millisecondsToBurnOneFuel / 1000 / fleet.shipQuantityInEscrow.toNumber());
  const maxUnits = shipInfo.fuelMaxReserve * fleet.shipQuantityInEscrow.toNumber();

  return {
    unitsBurnt,
    unitsLeftPct,
    unitsLeft: unitsLeft,
    secondsLeft: Math.max(0, secondsLeft),
    totalSeconds,
    maxSeconds,
    maxUnits,
    burnRate: unitsBurnRate
  };
 
 }

 private static getRemainHealthDetails(shipInfo: ScoreVarsShipInfo, fleet: ShipStakingInfo, timePassSinceStart: number) : ResourceRemaining {
 
  const unitsLeftPct = (fleet.healthCurrentCapacity.toNumber() - timePassSinceStart) / fleet.healthCurrentCapacity.toNumber();
  const secondsLeft = FleetService.getRemainHealthSec(fleet, timePassSinceStart);
  const unitsBurnRate = 1 / (shipInfo.millisecondsToBurnOneToolkit / 1000); 
  const unitsLeft = secondsLeft / (shipInfo.millisecondsToBurnOneToolkit / 1000 / fleet.shipQuantityInEscrow.toNumber());
  const totalSeconds = fleet.healthCurrentCapacity.toNumber();
  const maxSeconds = shipInfo.toolkitMaxReserve * fleet.shipQuantityInEscrow.toNumber() * (shipInfo.millisecondsToBurnOneToolkit / 1000 / fleet.shipQuantityInEscrow.toNumber());
  const maxUnits = shipInfo.toolkitMaxReserve * fleet.shipQuantityInEscrow.toNumber();

  return {
    unitsBurnt: 0,
    unitsLeftPct,
    secondsLeft: Math.max(0, secondsLeft),
    totalSeconds,
    maxSeconds,
    maxUnits,
    unitsLeft: unitsLeft,
    burnRate: unitsBurnRate
  };
 
 }

 private static getRemainFoodSec(fleet: ShipStakingInfo, _timePass: number | undefined = undefined) : number {
 
  let timePass = _timePass != undefined ? _timePass : FleetService.getTimePass(fleet);
  let remainTime = fleet.foodCurrentCapacity.toNumber() - timePass;
  // In Seconds

  return remainTime;
 
 }

 private static getRemainArmsSec(fleet: ShipStakingInfo, _timePass: number | undefined = undefined) : number {
 
  let timePass = _timePass != undefined ? _timePass : FleetService.getTimePass(fleet);
  let remainTime = fleet.armsCurrentCapacity.toNumber() - timePass;
  // In Seconds
  return remainTime;
 
 }

 private static getRemainFuelSec(fleet: ShipStakingInfo, _timePass: number | undefined = undefined) : number {

  let timePass = _timePass != undefined ? _timePass : FleetService.getTimePass(fleet);
  let remainTime = fleet.fuelCurrentCapacity.toNumber() - timePass;
  // In Seconds
  return remainTime;
 
 }

 private static getRemainHealthSec(fleet: ShipStakingInfo, _timePass: number | undefined = undefined) : number {
 
  let timePass = _timePass != undefined ? _timePass : FleetService.getTimePass(fleet);
  let remainTime = fleet.healthCurrentCapacity.toNumber() - timePass;
  // In Seconds
  return remainTime;
 
 }

 private static getTimePass(fleet: ShipStakingInfo) : number {
  const now = Date.now() / 1000;
  const tripStart = fleet.currentCapacityTimestamp.toNumber();
  const timePass = now - tripStart;
  return timePass;
 }

 private static timePassSinceLastAction(fleet: ShipStakingInfo) {
  let timePassSinceStart = FleetService.getTimePass(fleet);

  const [foodRemainSec, armsRemainSec, fuelRemainSec, healthRemainSec] = [
    FleetService.getRemainFoodSec(fleet),
    FleetService.getRemainArmsSec(fleet),
    FleetService.getRemainFuelSec(fleet),
    FleetService.getRemainHealthSec(fleet),
  ];

  const depletionTime = Math.min(
    foodRemainSec,
    armsRemainSec,
    fuelRemainSec,
    healthRemainSec
  );

  if (depletionTime < 0) {
    timePassSinceStart = depletionTime + timePassSinceStart;
  }
  return timePassSinceStart;
 }

 private static async getTokenAmmount(token: Token, pubKey: PublicKey) : Promise<number> {
    
  try {
      return (
        await token.getOrCreateAssociatedAccountInfo(pubKey)
      ).amount.toNumber();
    } catch (error) {
      if (((error as any).message as string).includes("Failed to find account")) {
        return 0;
      } else {
        throw error;
      }
    }
 
 }

 private static getReward ( shipInfo:ScoreVarsShipInfo ,fleet: ShipStakingInfo) : number {
    let timePass = FleetService.getTimePass(fleet);
    let pendingReward = Number(fleet.shipQuantityInEscrow) * (Number(fleet.totalTimeStaked) - Number(fleet.stakedTimePaid) + timePass) * Number(shipInfo.rewardRatePerSecond);
    return pendingReward
 }


}



