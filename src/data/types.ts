import { ShipStakingInfo } from "@staratlas/factory";
import { PartialState } from "zustand";

export interface IFleet extends ShipStakingInfo {
  name: string;
  image: string;
  resources: { [key: string]: ResourceRemaining };
  pendingRewardsV2: number,
  stats?: {[key: string]: IResourceData}
}

export interface WaitingSignature {
  hash: string;
  status: "processed" | "confirmed" | "finalized" | 'processing'
}

export interface InventorySupplies {
  food: number;
  arms: number;
  fuel: number;
  tools: number;
}
export interface IInventory {
  supplies: InventorySupplies;
}

export interface IResourceData {
  imgSrc: string;
  id: string;
  pct1Color: string;
  maxSeconds: number;
  maxUnits: number;
  unitsNeedToMax: number;
  secondsLeft: number;
  secondsNeedToMax: number;
  untisNeedToBuy: number;
  burnRate: number;
  unitsLeft: number;
  supply: number;
  isBlinking: boolean;
  pct1: number;
  pct2: number;
  isLoading: boolean;

  // ? stats for resources section

}

export interface ResourceRemaining {
  unitsBurnt: number;
  unitsLeftPct: number;
  unitsLeft: number;
  secondsLeft: number;
  totalSeconds: number;
  maxSeconds: number;
  maxUnits: number;
  burnRatePerShip: number;
  burnRatePerFleet: number;
}

export type SetType<T extends object> = <
  K1 extends keyof T,
  K2 extends keyof T = K1,
  K3 extends keyof T = K2,
  K4 extends keyof T = K3
>(
  partial: PartialState<T, K1, K2, K3, K4>,
  replace?: boolean | undefined,
  logName?: string
) => void;

export const TOKENS = {
  ammo: "AMMMO",
  fuel: "FUEL",
  food: "FOOD",
  tools: "TOOLS",
};

export interface InvoiceResources {
  ammo: {
    amount: number;
    atlas: number;
    usdc: number;
  };
  food: {
    amount: number;
    atlas: number;
    usdc: number;
  };
  fuel: {
    amount: number;
    atlas: number;
    usdc: number;
  };
  tools: {
    amount: number;
    atlas: number;
    usdc: number;
  };

  market: {
    rate: number;
  };
}

export interface MarketPriceData {
  address: string;
  market_price: number;
  quote_symbol: string;
  symbol: string;
}

export interface MarketPriceAMMO {
  "ATLAS/USDC": number;
  data: MarketPriceData[];
  mint: string;
  version: string;
}

export interface MarketPriceData {
  address: string;
  market_price: number;
  quote_symbol: string;
  symbol: string;
}

export interface MarketPriceAtlas {
  "ATLAS/USDC": number;
  data: MarketPriceData[];
  mint: string;
  version: string;
}

export interface MarketPriceData {
  address: string;
  market_price: number;
  quote_symbol: string;
  symbol: string;
}

export interface MarketPriceFood {
  "ATLAS/USDC": number;
  data: MarketPriceData[];
  mint: string;
  version: string;
}

export interface MarketPriceData {
  address: string;
  market_price: number;
  quote_symbol: string;
  symbol: string;
}

export interface MarketPriceFuel {
  "ATLAS/USDC": number;
  data: MarketPriceData[];
  mint: string;
  version: string;
}

export interface MarketPriceData {
  address: string;
  market_price: number;
  quote_symbol: string;
  symbol: string;
}

export interface MarketPriceTool {
  "ATLAS/USDC": number;
  data: MarketPriceData[];
  mint: string;
  version: string;
}

export interface MarketPriceResources {
  AMMO: MarketPriceAMMO;
  ATLAS: MarketPriceAtlas;
  FOOD: MarketPriceFood;
  FUEL: MarketPriceFuel;
  TOOL: MarketPriceTool;
}

export interface MarketPriceDetail {
  usdc: number;
  atlas: number;
  rate: number;
}


export enum ErrorModalTypes {
  MISSING_OPEN_ORDERS = "missing open orders",
  NORMAL = "noraml",
}


export enum InfoModalTypes {
  CONFIRM = "confirm",
  NORMAL = "noraml",
  LIST = "list",
  TX_LIST = "tx list"
}

export  interface ErrorModalContent {
  modalType: ErrorModalTypes;
  message?: string;
}

export  interface InfoModalContent {
  modalType: InfoModalTypes;
  message?: string;
  list?: string[];
  confirmCb?: (...args: any) => void;
}


export interface AppLoader {
  loading: boolean;
  message?: string;
  pct?: number; 
}