import create, { State } from "zustand";
import { devtools } from "zustand/middleware";
import ammoImg from "../assets/images/ammo.png";
import foodImg from "../assets/images/food.png";
import fuelImg from "../assets/images/fuel.png";
import toolImg from "../assets/images/tool.png";
import { COLORS } from "../constants";
import { FleetService } from "../services/fleetService";
import {
  AppLoader,
  ErrorModalContent,
  IFleet,
  IInventory,
  InfoModalContent,
  IResourceData,
  SetType,
  TOKENS,
  WaitingSignature
} from "./types";

interface FleetState extends State {
  fleets: IFleet[];
  selectedFleets: IFleet[];
  inventory: IInventory | undefined;

  selectFleet: (fleets: IFleet | undefined, command?: string) => void;
  unselectFleet: (fleets: IFleet | undefined, command?: string) => void;
  setFleets: (fleets: IFleet[]) => void;
  delFleets: () => void;
  setInventory: (inventory: IInventory | undefined) => void;
  reset: () => void;
}

interface ResourceState extends State {
  resourcesData: { [key: string]: IResourceData };
  atlasBalance: number;

  setResourcesData: (resourcesData: {[key: string]: IResourceData;}) => void;
  setAtlasBalance: (balance: number) => void;
  reset: () => void;
}

interface AppState extends State {
  errorModalContent: ErrorModalContent |  undefined;
  infoModalContent: InfoModalContent | undefined;
  appLoading: AppLoader;
  refreshing: boolean;
  signaturesToWait: WaitingSignature[];
  setErrorModal: (content: ErrorModalContent | undefined) => void;
  setInfoModal: (content: InfoModalContent | undefined) => void;
  startAppLoading: (info: AppLoader) => void;
  stopAppLoading: () => void;
  reset: () => void;
  setRefreshing: (isRefreshing: boolean) => void;
  setSignaturesToWait: (setSignaturesToWait: WaitingSignature[]) => void
}

export const useFleetStore = create<FleetState>(devtools((set: SetType<FleetState>) => {
  return {
    fleets: [],
    selectedFleets: [],
    inventory: undefined,

    setFleets: (fleets: IFleet[]) => set((state) => {
      const newState: IFleet[] = [];
      
      // ? updating the fleets with same order
      state.fleets.forEach(existingFleet => {
        const found = fleets.find(f => f.name == existingFleet.name);
        if (found) {
          const stats = FleetService.calculateResources([found], state.inventory)
          found.stats = stats;
          newState.push(found);
        }
      });
      // ? adding the new fleets in case
      fleets.forEach(f => {
        const found = newState.find(ff => ff.name == f.name);
        if(!found){
          const stats = FleetService.calculateResources([f], state.inventory)
          f.stats = stats;
          newState.push(f)
        }
      });

      const newSelectedState: IFleet[] = [];
      // ? updating the selected fleets
      state.selectedFleets.forEach(seletedFleet => {
        const found = fleets.find(f => f.name == seletedFleet.name)
        if (found){
          const stats = FleetService.calculateResources([found], state.inventory)
          found.stats = stats;
          newSelectedState.push(found);
        }
      })

      return ({ fleets: newState, selectedFleets: newSelectedState });
    }, false, "SetFleets"),
    setInventory: (inventory: IInventory | undefined) => set((state) => ({ inventory: inventory }), false, "SetInventory"),
    delFleets: () => set((state) => ({ fleets: [] })),
    selectFleet: (fleet: IFleet | undefined, command?: string) => set((state) => ({
          selectedFleets:
            command == "all"
              ? [...state.fleets]
              : fleet
              ? [...state.selectedFleets, fleet]
              : [...state.selectedFleets],
        }),
        false,
        "SelectFleet"
      ),
    unselectFleet: (fleet: IFleet | undefined, command?: string) => set(
        (state) => ({
          selectedFleets:
            command == "all"
              ? []
              : fleet
              ? state.selectedFleets.filter(
                  (existFleet) => existFleet.name != fleet.name
                )
              : [],
        }),
        false,
        "UnSelectFleet"
      ),
      reset: () => set((state) => ({fleets: [], selectedFleets:[], inventory:undefined}))
  };
}));

export const useResourceStore = create<ResourceState>(devtools((set: SetType<ResourceState>) => {
  return {
    resourcesData: {
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
    },
    atlasBalance: 0,

    setResourcesData: (resourcesData: { [key: string]: IResourceData }) => set((state) => ({ resourcesData }), false, "setResourcesData"),
    setAtlasBalance: (balance: number) => set((state) => ({ atlasBalance: balance })),
    reset: () => set((state) => ({resourcesData: {
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
    },
    atlasBalance: 0}))
  };
}));

export const useAppStore = create<AppState>(devtools((set: SetType<AppState>) => {
  return {
    errorModalContent: undefined,
    infoModalContent: undefined,
    appLoading: { loading: false, message: '', pct: 0 },
    refreshing: false,
    signaturesToWait: [],

    setErrorModal: (content: ErrorModalContent | undefined) => set((state) => ({ errorModalContent: content })),
    setInfoModal: (content: InfoModalContent | undefined) => set((state) => ({ infoModalContent: content })),
    startAppLoading: (info: AppLoader) => set((state) => ({ appLoading: { ... info} })),
    stopAppLoading: () => set((state) => ({ appLoading: { loading: false, message: '', pct: 0 } })),
    reset: () => set((state) => ({errorModalContent: undefined, infoModalContent: undefined, appLoading: {loading: false},})),
    setRefreshing: (isRefreshing: boolean) => set((state) => ({refreshing: isRefreshing})),
    setSignaturesToWait: (signaturesToWait: WaitingSignature[]) => set((state) => ({signaturesToWait}))
  };

}));


