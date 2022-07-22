import {DexInstructions, Market} from "@project-serum/serum";
import {ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID,} from "@solana/spl-token";
import {Keypair, PublicKey, TransactionInstruction} from "@solana/web3.js";
import {
  createHarvestInstruction,
  createRearmInstruction,
  createRefeedInstruction,
  createRefuelInstruction,
  createRepairInstruction
} from "@staratlas/factory";
import axios from "axios";
import {ceil, floor, round} from "mathjs";
import {
  AND_WALLET,
  ARMS_MARKET_CRED,
  ARMS_TOKEN,
  ATLAS_DEX,
  ATLAS_MINT,
  BAC_WALLET,
  BUY_SUPPLY_MODES,
  CONN,
  FLEET_PROGRAM,
  FOOD_MARKET_CRED,
  FOOD_TOKEN,
  FUEL_MARKET_CRED,
  FUEL_TOKEN,
  GUILD_WALLET,
  MarketsCredentials,
  SUPPLIES_MINTS,
  SUPPLIES_NAMES,
  TOOLS_MARKET_CRED,
  TOOLS_TOKEN
} from "../constants";
import {useAppStore, useFleetStore} from "../data/store";
import {ErrorModalTypes, InvoiceResources, MarketPriceDetail, MarketPriceResources} from "../data/types";
import {retryAsync} from "../utils";


export class MarketService  {
  

  // ! VARIABLES ===========================
  public static FOOD_MARKET : Market | undefined = undefined;
  public static ARMS_MARKET : Market | undefined = undefined;
  public static FUEL_MARKET : Market | undefined = undefined;
  public static TOOLS_MARKET : Market | undefined = undefined;

  // ! PUBLIC METHODS ======================
  public static async getSuppliesMarketPrices() : Promise<MarketPriceResources|undefined> {
  
    try {
      let res = await axios.get(
        "https://api.staratlas.club/redis/asset-prices?symbols=FUEL,FOOD,AMMO,TOOL,ATLAS"
      );
      let data = res.data;
      return data;
    } catch (error) {
      return undefined;
    }
  
  }


  public static async getAmmoMarketPrice() : Promise<number> {
  
    try {
      const pricesData = await MarketService.getSuppliesMarketPrices();
      const rate = pricesData?.AMMO["ATLAS/USDC"];
      const marketPrice = pricesData?.AMMO.data[0].market_price;
      if(rate !== undefined && marketPrice !== undefined) {
        return rate * marketPrice;
      } else {
        return -1;
      }
    } catch (error) {
      console.log(error);
      return -1;
    }
  
  }

  public static async getFuelMarketPrice() : Promise<number> {
  
    try {
      const pricesData = await MarketService.getSuppliesMarketPrices();
      const rate = pricesData?.FUEL["ATLAS/USDC"];
      const marketPrice = pricesData?.FUEL.data[0].market_price;
      if(rate !== undefined && marketPrice !== undefined) {
        return rate * marketPrice;
      } else {
        return -1;
      }
    } catch (error) {
      console.log(error);
      return -1;
    }
  
  }

  public static async getFoodMarketPrice() : Promise<number> {
  
    try {
      const pricesData = await MarketService.getSuppliesMarketPrices();
      const rate = pricesData?.FOOD["ATLAS/USDC"];
      const marketPrice = pricesData?.FOOD.data[0].market_price;
      if(rate !== undefined && marketPrice !== undefined) {
        return rate * marketPrice;
      } else {
        return -1;
      }
    } catch (error) {
      console.log(error);
      return -1;
    }
  
  }

  public static async getToolMarketPrice() : Promise<number> {
  
    try {
      const pricesData = await MarketService.getSuppliesMarketPrices();
      const rate = pricesData?.TOOL["ATLAS/USDC"];
      const marketPrice = pricesData?.TOOL.data[0].market_price;
      if(rate !== undefined && marketPrice !== undefined) {
        return rate * marketPrice;
      } else {
        return -1;
      }
    } catch (error) {
      console.log(error);
      return -1;
    }
  
  }

  public static async getBalanceAtlas(pubKey: PublicKey) : Promise<number> {
  
    return new Token(CONN, ATLAS_MINT, TOKEN_PROGRAM_ID, new Keypair())
    .getOrCreateAssociatedAccountInfo(pubKey)
    .then((data) => {
      return round(Number(data.amount) / 100000000 ,3)
    })
    .catch((error) => {
      console.log(error);
      return 0;
    });
  
  }

  public static async getAmmoMarketPriceDetials() : Promise<MarketPriceDetail | -1 > {
  
    try {
      const pricesData = await MarketService.getSuppliesMarketPrices();
      const rate = pricesData?.AMMO["ATLAS/USDC"];
      const marketPrice = pricesData?.AMMO.data[0].market_price;
      if( rate !== undefined && marketPrice !== undefined) {
        return {
          usdc: rate * marketPrice,
          atlas: marketPrice,
          rate: rate,
        };
      } else {
        return -1;
      }
      
    } catch (error) {
      console.log(error);
      return -1;
    }
  
  }

  public static async getFoodMarketPriceDetials() : Promise<MarketPriceDetail | -1 > {
  
    try {
      const pricesData = await MarketService.getSuppliesMarketPrices();
      const rate = pricesData?.FOOD["ATLAS/USDC"];
      const marketPrice = pricesData?.FOOD.data[0].market_price;
      if( rate !== undefined && marketPrice !== undefined) {
        return {
          usdc: rate * marketPrice,
          atlas: marketPrice,
          rate: rate,
        };
      } else {
        return -1;
      }
      
    } catch (error) {
      console.log(error);
      return -1;
    }
  
  }

  public static async getFuelMarketPriceDetials() : Promise<MarketPriceDetail | -1 > {
  
    try {
      const pricesData = await MarketService.getSuppliesMarketPrices();
      const rate = pricesData?.FUEL["ATLAS/USDC"];
      const marketPrice = pricesData?.FUEL.data[0].market_price;
      if( rate !== undefined && marketPrice !== undefined) {
        return {
          usdc: rate * marketPrice,
          atlas: marketPrice,
          rate: rate,
        };
      } else {
        return -1;
      }
      
    } catch (error) {
      console.log(error);
      return -1;
    }
  
  }

  public static async getToolMarketPriceDetials() : Promise<MarketPriceDetail | -1 > {
  
    try {
      const pricesData = await MarketService.getSuppliesMarketPrices();
      const rate = pricesData?.TOOL["ATLAS/USDC"];
      const marketPrice = pricesData?.TOOL.data[0].market_price;
      if( rate !== undefined && marketPrice !== undefined) {
        return {
          usdc: rate * marketPrice,
          atlas: marketPrice,
          rate: rate,
        };
      } else {
        return -1;
      }
      
    } catch (error) {
      console.log(error);
      return -1;
    }
  
  }

  public static async getBuyAllInstructions(info: InvoiceResources, publicKey: PublicKey): Promise<TransactionInstruction[]> {
  
    let ixs: TransactionInstruction[] = [];
    if(MarketService.FOOD_MARKET && MarketService.ARMS_MARKET && MarketService.FUEL_MARKET && MarketService.TOOLS_MARKET) {
      if (info.food.amount > 0) ixs.push(await MarketService.getMarketBuyInstruction(MarketService.FOOD_MARKET, info.food.amount, publicKey));
      if (info.ammo.amount > 0) ixs.push(await MarketService.getMarketBuyInstruction(MarketService.ARMS_MARKET, info.ammo.amount, publicKey));
      if (info.fuel.amount > 0) ixs.push(await MarketService.getMarketBuyInstruction(MarketService.FUEL_MARKET, info.fuel.amount, publicKey));
      if (info.tools.amount > 0) ixs.push(await MarketService.getMarketBuyInstruction(MarketService.TOOLS_MARKET, info.tools.amount, publicKey));
    }
    
    return ixs;
  
  }

  public static async makeCreateAssociatedTokensAccountsInstructions (publicKey: PublicKey) : Promise<{ix: TransactionInstruction, name: string}[]>  {
    
    let tokens_accounts = await Promise.all(SUPPLIES_MINTS.map(async (el) => {
      return {
        account: await MarketService.getAssociatedTokenAddress(publicKey, el.token.publicKey),
        mint: el.token.publicKey,
        name: el.name
      };
    }));

    let token_accounts_data = await Promise.all(tokens_accounts.map(async (el) => {
      return {
        account: el.account,
        data: await CONN.getAccountInfo(el.account),
        mint: el.mint,
        name: el.name
      }
    }));
  
    let accounts_2_create = (token_accounts_data.filter((el) => {
      
      if (el.data === null) {
        return true
      };

      return false;

    }));

    if (accounts_2_create.length === 0) {
      return [];
    }

    let ixs = accounts_2_create.map((el)=> {
      return {
        ix: Token.createAssociatedTokenAccountInstruction(
              ASSOCIATED_TOKEN_PROGRAM_ID,
              TOKEN_PROGRAM_ID,
              el.mint,
              el.account,
              publicKey,
              publicKey,
            ),
        name: el.name
      };
    });

    return ixs;
    /*
    let tx = new Transaction()
    ixs.map(ix => tx.add(ix));
    
    return tx;*/
    //await sendAndConfirmTransaction(connection, new Transaction().add(ixs[0]), [owner]);
  }
  
  public static async getMissingOperOrderAccounts(publicKey: PublicKey): Promise<SUPPLIES_NAMES[]> {
    let result: SUPPLIES_NAMES[] = [];
    if (MarketService.allMarketsLoaded()) {
      await Promise.all([
        MarketService.ARMS_MARKET!.findOpenOrdersAccountsForOwner(CONN, publicKey).then(openOrders => openOrders.length === 0 ? result.push(SUPPLIES_NAMES.ARMS) : null),
        MarketService.FOOD_MARKET!.findOpenOrdersAccountsForOwner(CONN, publicKey).then(openOrders => openOrders.length === 0 ? result.push(SUPPLIES_NAMES.FOOD) : null),
        MarketService.FUEL_MARKET!.findOpenOrdersAccountsForOwner(CONN, publicKey).then(openOrders => openOrders.length === 0 ? result.push(SUPPLIES_NAMES.FUEL) : null),
        MarketService.TOOLS_MARKET!.findOpenOrdersAccountsForOwner(CONN, publicKey).then(openOrders => openOrders.length === 0 ? result.push(SUPPLIES_NAMES.TOOLS) : null)
      ])
      
    }

    return result;
  }

  public static async loadMarkets() : Promise<void> {
  
    MarketService.FOOD_MARKET  = await retryAsync(() => Market.load(CONN, FOOD_MARKET_CRED.address, {}, ATLAS_DEX)) ;
    MarketService.ARMS_MARKET  = await retryAsync(() => Market.load(CONN, ARMS_MARKET_CRED.address, {}, ATLAS_DEX));
    MarketService.FUEL_MARKET  = await retryAsync(() => Market.load(CONN, FUEL_MARKET_CRED.address, {}, ATLAS_DEX));
    MarketService.TOOLS_MARKET = await retryAsync(() => Market.load(CONN, TOOLS_MARKET_CRED.address, {}, ATLAS_DEX));
  
  }

  public static async getTipsInstructions(player: PublicKey, mint: PublicKey, amount: number): Promise<TransactionInstruction[]> {
      return  Promise.all(
          [
            Token.createTransferInstruction(
              TOKEN_PROGRAM_ID, 
              await MarketService.getAssociatedTokenAddress(player, ATLAS_MINT),
              await MarketService.getAssociatedTokenAddress(GUILD_WALLET, ATLAS_MINT),
              player,
              [], 
              amount * 100000000 * 0.50
            ),
            Token.createTransferInstruction(
              TOKEN_PROGRAM_ID, 
              await MarketService.getAssociatedTokenAddress(player, ATLAS_MINT),
              await MarketService.getAssociatedTokenAddress(AND_WALLET, ATLAS_MINT),
              player,
              [], 
              amount * 100000000 * 0.25
            ),
            Token.createTransferInstruction(
              TOKEN_PROGRAM_ID, 
              await MarketService.getAssociatedTokenAddress(player, ATLAS_MINT),
              await MarketService.getAssociatedTokenAddress(BAC_WALLET, ATLAS_MINT),
              player,
              [], 
              amount * 100000000 * 0.25
            )
          ]
      )
  }

  public static async getSettleAllInstructions(publicKey: PublicKey): Promise<TransactionInstruction[]> {
    let ixs: TransactionInstruction[] = []; 

    const [foodUnsettled, armsUnsettled, fuelUnsettled, toolsUnsettled] = await Promise.all([
      MarketService.getUnsettledSupply(MarketService.FOOD_MARKET!, publicKey),
      MarketService.getUnsettledSupply(MarketService.ARMS_MARKET!, publicKey),
      MarketService.getUnsettledSupply(MarketService.FUEL_MARKET!, publicKey),
      MarketService.getUnsettledSupply(MarketService.TOOLS_MARKET!, publicKey)
    ])

    

    if (foodUnsettled.unsettledTokens > 0) ixs.push(await  MarketService.getSettleFundsInstruction(MarketService.FOOD_MARKET!, FOOD_MARKET_CRED, publicKey));
    if (armsUnsettled.unsettledTokens > 0) ixs.push(await  MarketService.getSettleFundsInstruction(MarketService.ARMS_MARKET!, ARMS_MARKET_CRED, publicKey));
    if (fuelUnsettled.unsettledTokens > 0) ixs.push(await  MarketService.getSettleFundsInstruction(MarketService.FUEL_MARKET!, FUEL_MARKET_CRED, publicKey));
    if (toolsUnsettled.unsettledTokens > 0) ixs.push(await  MarketService.getSettleFundsInstruction(MarketService.TOOLS_MARKET!, TOOLS_MARKET_CRED, publicKey));
    
    
    return ixs;
  }

  public static async getHarvestAllInstructions(player: PublicKey): Promise<TransactionInstruction[]> {
    let atlasAccount = await MarketService.getAssociatedTokenAddress(player, ATLAS_MINT);
    const ixs = (await Promise.all(useFleetStore.getState().fleets.map(async (fleet) => {
        if (fleet.pendingRewardsV2 > 0) {
          return await createHarvestInstruction(
              CONN, 
              player,
              atlasAccount,
              new PublicKey(fleet.shipMint),
              FLEET_PROGRAM
          )
        }
      })
    )).filter(ix => !!ix) as  TransactionInstruction[];

    return ixs;
  }

  public static async getResupplyAllInstructions(player: PublicKey, buySupplyMode: BUY_SUPPLY_MODES): Promise<TransactionInstruction[] | undefined> {
    
    const createReArmIx = async (qty: number, shipmint: PublicKey) => {
        return createRearmInstruction(
            CONN, 
            player, 
            player, 
            qty, 
            shipmint, 
            ARMS_TOKEN.publicKey, 
            await MarketService.getAssociatedTokenAddress(player, ARMS_TOKEN.publicKey), 
            FLEET_PROGRAM)
    };

    const createReFeedIx = async (qty: number, shipmint: PublicKey) => {
        return createRefeedInstruction(
            CONN, 
            player, 
            player, 
            qty, shipmint, 
            FOOD_TOKEN.publicKey, 
            await MarketService.getAssociatedTokenAddress(player, FOOD_TOKEN.publicKey), 
            FLEET_PROGRAM)
    };

    const createRefuelIx = async (qty: number, shipmint: PublicKey) => {
        return createRefuelInstruction(
            CONN, 
            player, 
            player, 
            qty, shipmint, 
            FUEL_TOKEN.publicKey, 
            await MarketService.getAssociatedTokenAddress(player, FUEL_TOKEN.publicKey), 
            FLEET_PROGRAM)
    };

    const createRepairIx = async (qty: number, shipmint: PublicKey) => {
        return createRepairInstruction(
            CONN, 
            player, 
            player, 
            qty, 
            shipmint, 
            TOOLS_TOKEN.publicKey, 
            await MarketService.getAssociatedTokenAddress(player, TOOLS_TOKEN.publicKey), 
            FLEET_PROGRAM)
    };

    // ? checking if we can supply based on mode
    const {selectedFleets, inventory, fleets} = useFleetStore.getState();
    let fleetsToResupply = selectedFleets;
    if (selectedFleets.length == 0) {
      fleetsToResupply = fleets
    }


    const supplyStorage = {
      food: inventory!.supplies.food,
      arms: inventory!.supplies.arms,
      tools: inventory!.supplies.tools,
      fuel: inventory!.supplies.fuel
    }
  
    // ! FULL TANK
    if (buySupplyMode == BUY_SUPPLY_MODES.FULL_TANKS) {
  
      fleetsToResupply.forEach(fleet => {
        supplyStorage.food -= Math.max(fleet.resources.food.maxUnits - fleet.resources.food.unitsLeft, 0); 
        supplyStorage.fuel -= Math.max(fleet.resources.fuel.maxUnits - fleet.resources.fuel.unitsLeft, 0); 
        supplyStorage.tools -= Math.max(fleet.resources.health.maxUnits - fleet.resources.health.unitsLeft, 0); 
        supplyStorage.arms -= Math.max(fleet.resources.arms.maxUnits - fleet.resources.arms.unitsLeft, 0); 
      })
  
      // ? supply is not enough
      if (floor(Math.min(...Object.values(supplyStorage))) < 0) {
        return undefined;
      }
      
      // ? building the instructions
      let res = await Promise.all(fleetsToResupply.map(async (fleet) => {
        let shipPk = new PublicKey(fleet.shipMint);
        const ixs: TransactionInstruction[] = []; 

        if (ceil(fleet.resources.food.maxUnits - fleet.resources.food.unitsLeft) > 1 ) {
          ixs.push(await createReFeedIx(ceil(fleet.resources.food.maxUnits - fleet.resources.food.unitsLeft), shipPk)) 
        }
        if ( ceil(fleet.resources.fuel.maxUnits - fleet.resources.fuel.unitsLeft) > 1 ) {
          ixs.push(await createRefuelIx(ceil(fleet.resources.fuel.maxUnits - fleet.resources.fuel.unitsLeft), shipPk))
        }
        if ( ceil(fleet.resources.arms.maxUnits - fleet.resources.arms.unitsLeft) > 1 ) {
          ixs.push(await createReArmIx(ceil(fleet.resources.arms.maxUnits - fleet.resources.arms.unitsLeft), shipPk))
        }
        if ( ceil(fleet.resources.health.maxUnits - fleet.resources.health.unitsLeft) > 1 ) {
          ixs.push(await createRepairIx(ceil(fleet.resources.health.maxUnits - fleet.resources.health.unitsLeft), shipPk))
        }

        return ixs;

      }))
      return res.flat()
  
    }
  
    // ! Optimal
    if (buySupplyMode == BUY_SUPPLY_MODES.OPTIMAL) {
      
      fleetsToResupply.forEach(fleet => {
        const fuelTarget = Math.min((fleet.resources.fuel.burnRatePerShip * fleet.shipQuantityInEscrow.toNumber()   * fleet.resources.food.maxSeconds), fleet.resources.fuel.maxUnits)
        const fuelNeed = ceil(Math.max(fuelTarget - fleet.resources.fuel.unitsLeft, 0));
        
        const toolsTarget = Math.min((fleet.resources.health.burnRatePerShip * fleet.shipQuantityInEscrow.toNumber()   * fleet.resources.food.maxSeconds), fleet.resources.health.maxUnits)
        const toolsNeed = ceil(Math.max(toolsTarget - fleet.resources.health.unitsLeft, 0));
        
        const armsTarget = Math.min((fleet.resources.arms.burnRatePerShip * fleet.shipQuantityInEscrow.toNumber()   * fleet.resources.food.maxSeconds), fleet.resources.arms.maxUnits)
        const armsNeed = ceil(Math.max(armsTarget - fleet.resources.arms.unitsLeft, 0));
        

        supplyStorage.food  -= Math.max(fleet.resources.food.maxUnits - fleet.resources.food.unitsLeft, 0); 
        supplyStorage.fuel  -= fuelNeed; 
        supplyStorage.tools -= toolsNeed;
        supplyStorage.arms  -= armsNeed
      })
      

      // ? supply is not enough
      if (round(Math.min(...Object.values(supplyStorage))) < 0) {
        return undefined;
      }

      // ? building the instructions
      let res = await Promise.all(fleetsToResupply.map(async (fleet) => {
        let shipPk = new PublicKey(fleet.shipMint);
        const ixs: TransactionInstruction[] = []; 

        const fuelTarget = Math.min((fleet.resources.fuel.burnRatePerShip * fleet.shipQuantityInEscrow.toNumber()   * fleet.resources.food.maxSeconds), fleet.resources.fuel.maxUnits)
        const fuelNeed = ceil(Math.max(fuelTarget - fleet.resources.fuel.unitsLeft, 0));
        
        const toolsTarget = Math.min((fleet.resources.health.burnRatePerShip * fleet.shipQuantityInEscrow.toNumber()   * fleet.resources.food.maxSeconds), fleet.resources.health.maxUnits)
        const toolsNeed = ceil(Math.max(toolsTarget - fleet.resources.health.unitsLeft, 0));
        
        const armsTarget = Math.min((fleet.resources.arms.burnRatePerShip * fleet.shipQuantityInEscrow.toNumber()   * fleet.resources.food.maxSeconds), fleet.resources.arms.maxUnits)
        const armsNeed = ceil(Math.max(armsTarget - fleet.resources.arms.unitsLeft, 0));

        if (ceil(fleet.resources.food.maxUnits - fleet.resources.food.unitsLeft) > 1 ) {
          ixs.push(await createReFeedIx(ceil(fleet.resources.food.maxUnits - fleet.resources.food.unitsLeft), shipPk))
        }
        if (fuelNeed > 1 ) ixs.push(await createRefuelIx(fuelNeed, shipPk))
        if (armsNeed > 1 ) ixs.push(await createReArmIx(armsNeed, shipPk))
        if (toolsNeed > 1) ixs.push(await createRepairIx(toolsNeed, shipPk))

        return ixs;

        
        
      }))
      return res.flat()
  
    }
  
    // ! URGENT
    if (buySupplyMode == BUY_SUPPLY_MODES.URGENT) {
      
      const maxSeconds = 12 * 60 * 60;
      
      fleetsToResupply.forEach(fleet => {

        const foodTarget = Math.min((fleet.resources.food.burnRatePerShip * fleet.shipQuantityInEscrow.toNumber()  * maxSeconds), fleet.resources.food.maxUnits)
        const foodNeed = ceil(Math.max(foodTarget - fleet.resources.food.unitsLeft, 0));

        const fuelTarget = Math.min((fleet.resources.fuel.burnRatePerShip * fleet.shipQuantityInEscrow.toNumber()  * maxSeconds), fleet.resources.fuel.maxUnits)
        const fuelNeed = ceil(Math.max(fuelTarget - fleet.resources.fuel.unitsLeft, 0));
        
        const toolsTarget = Math.min((fleet.resources.health.burnRatePerShip * fleet.shipQuantityInEscrow.toNumber() * maxSeconds), fleet.resources.health.maxUnits)
        const toolsNeed = ceil(Math.max(toolsTarget - fleet.resources.health.unitsLeft, 0));
        
        const armsTarget = Math.min((fleet.resources.arms.burnRatePerShip * fleet.shipQuantityInEscrow.toNumber()  * maxSeconds), fleet.resources.arms.maxUnits)
        const armsNeed = ceil(Math.max(armsTarget - fleet.resources.arms.unitsLeft, 0));

        supplyStorage.food  -= foodNeed; 
        supplyStorage.fuel  -= fuelNeed; 
        supplyStorage.tools -= toolsNeed; 
        supplyStorage.arms  -= armsNeed; 
      })
  
      // ? supply is not enough
      if (round(Math.min(...Object.values(supplyStorage))) < 0) {
        return undefined;
      }
      

      // ? building the instructions
      let res = await Promise.all(fleetsToResupply.map(async (fleet) => {
        let shipPk = new PublicKey(fleet.shipMint);
        const ixs: TransactionInstruction[] = []; 


        const foodTarget = Math.min((fleet.resources.food.burnRatePerShip * fleet.shipQuantityInEscrow.toNumber()  * maxSeconds), fleet.resources.food.maxUnits)
        const foodNeed = ceil(Math.max(foodTarget - fleet.resources.food.unitsLeft, 0));

        const fuelTarget = Math.min((fleet.resources.fuel.burnRatePerShip * fleet.shipQuantityInEscrow.toNumber()  * maxSeconds), fleet.resources.fuel.maxUnits)
        const fuelNeed = ceil(Math.max(fuelTarget - fleet.resources.fuel.unitsLeft, 0));
        
        const toolsTarget = Math.min((fleet.resources.health.burnRatePerShip * fleet.shipQuantityInEscrow.toNumber() * maxSeconds), fleet.resources.health.maxUnits)
        const toolsNeed = ceil(Math.max(toolsTarget - fleet.resources.health.unitsLeft, 0));
        
        const armsTarget = Math.min((fleet.resources.arms.burnRatePerShip * fleet.shipQuantityInEscrow.toNumber()  * maxSeconds), fleet.resources.arms.maxUnits)
        const armsNeed = ceil(Math.max(armsTarget - fleet.resources.arms.unitsLeft, 0));


        if (foodNeed > 1) ixs.push(await createReFeedIx(foodNeed, shipPk))
        if (fuelNeed > 1) ixs.push(await createRefuelIx(fuelNeed, shipPk))
        if ( armsNeed > 1 ) ixs.push(await createReArmIx(armsNeed, shipPk))
        if ( toolsNeed > 1 ) ixs.push(await createRepairIx(toolsNeed, shipPk))

        return ixs;
        
      }))
      return res.flat()
    }
  
    // ! Critical
    if (buySupplyMode == BUY_SUPPLY_MODES.CRITICAL) {
  
      const maxSeconds = Math.min(...fleetsToResupply.map(f => {
        let min = Math.max(
          f.resources.arms.secondsLeft,
          f.resources.food.secondsLeft,
          f.resources.fuel.secondsLeft,
          f.resources.health.secondsLeft
        );
  
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
      }));
      
      

      fleetsToResupply.forEach(fleet => {

        const foodTarget = Math.min((fleet.resources.food.burnRatePerShip * fleet.shipQuantityInEscrow.toNumber()  * maxSeconds), fleet.resources.food.maxUnits)
        const foodNeed = ceil(Math.max(foodTarget - fleet.resources.food.unitsLeft, 0));

        const fuelTarget = Math.min((fleet.resources.fuel.burnRatePerShip * fleet.shipQuantityInEscrow.toNumber()  * maxSeconds), fleet.resources.fuel.maxUnits)
        const fuelNeed = ceil(Math.max(fuelTarget - fleet.resources.fuel.unitsLeft, 0));
        
        const toolsTarget = Math.min((fleet.resources.health.burnRatePerShip * fleet.shipQuantityInEscrow.toNumber() * maxSeconds), fleet.resources.health.maxUnits)
        const toolsNeed = ceil(Math.max(toolsTarget - fleet.resources.health.unitsLeft, 0));
        
        const armsTarget = Math.min((fleet.resources.arms.burnRatePerShip * fleet.shipQuantityInEscrow.toNumber()  * maxSeconds), fleet.resources.arms.maxUnits)
        const armsNeed = ceil(Math.max(armsTarget - fleet.resources.arms.unitsLeft, 0));

        supplyStorage.food  -= foodNeed; 
        supplyStorage.fuel  -= fuelNeed; 
        supplyStorage.tools -= toolsNeed; 
        supplyStorage.arms  -= armsNeed; 
      })
      
      
      // ? supply is not enough
      if (round(Math.min(...Object.values(supplyStorage))) < 0) {
        return undefined;
      }
      

      // ? building the instructions
      let res = await Promise.all(fleetsToResupply.map(async (fleet) => {
        let shipPk = new PublicKey(fleet.shipMint);
        const ixs: TransactionInstruction[] = []; 

        const foodTarget = Math.min((fleet.resources.food.burnRatePerShip * fleet.shipQuantityInEscrow.toNumber()  * maxSeconds), fleet.resources.food.maxUnits)
        const foodNeed = ceil(Math.max(foodTarget - fleet.resources.food.unitsLeft, 0));

        const fuelTarget = Math.min((fleet.resources.fuel.burnRatePerShip * fleet.shipQuantityInEscrow.toNumber()  * maxSeconds), fleet.resources.fuel.maxUnits)
        const fuelNeed = ceil(Math.max(fuelTarget - fleet.resources.fuel.unitsLeft, 0));
        
        const toolsTarget = Math.min((fleet.resources.health.burnRatePerShip * fleet.shipQuantityInEscrow.toNumber() * maxSeconds), fleet.resources.health.maxUnits)
        const toolsNeed = ceil(Math.max(toolsTarget - fleet.resources.health.unitsLeft, 0));
        
        const armsTarget = Math.min((fleet.resources.arms.burnRatePerShip * fleet.shipQuantityInEscrow.toNumber()  * maxSeconds), fleet.resources.arms.maxUnits)
        const armsNeed = ceil(Math.max(armsTarget - fleet.resources.arms.unitsLeft, 0));

        

        if (foodNeed > 1) ixs.push(await createReFeedIx(foodNeed, shipPk))
        if (fuelNeed > 1) ixs.push(await createRefuelIx(fuelNeed, shipPk))
        if (armsNeed > 1 ) ixs.push(await createReArmIx(armsNeed, shipPk))
        if (toolsNeed > 1 ) ixs.push(await createRepairIx(toolsNeed, shipPk))

        return ixs;
        
      }))
      return res.flat()
    }

    
  }

  public static async canInteractWithMarket(player: PublicKey) {

    if (localStorage.getItem("_cm_in") == 'true') return true;

    const missingOpenOrderAccounts = await retryAsync(() => MarketService.getMissingOperOrderAccounts(player)) as SUPPLIES_NAMES[];
    if (missingOpenOrderAccounts.length > 0) {
      localStorage.setItem('_cm_in', 'false');
      useAppStore.getState().setErrorModal({
        modalType: ErrorModalTypes.MISSING_OPEN_ORDERS,
        message: missingOpenOrderAccounts.join(","),
      });
      return false
    }
    
    const missingAssociatedTokenAccountsIx = await retryAsync(() => MarketService.makeCreateAssociatedTokensAccountsInstructions(player));
    if (missingAssociatedTokenAccountsIx!.length > 0) {
      localStorage.setItem('_cm_in', 'false');
      useAppStore.getState().setErrorModal({
        modalType: ErrorModalTypes.MISSING_OPEN_ORDERS,
        message: missingAssociatedTokenAccountsIx!.map(el => el.name).join(","),
      });
      return false
    }

    localStorage.setItem('_cm_in', 'true');
    return true;
  }

  public static getDescriptionForMode(v: BUY_SUPPLY_MODES) {
    switch (v) {
      case BUY_SUPPLY_MODES.FULL_TANKS:
        return 'Fully resupply all resources and repair back to 100%'
      case BUY_SUPPLY_MODES.OPTIMAL: 
        return 'Fully resupplies the resource that has the shortest depletion time AND also ensures all other resources have at least enough remaining to last the period of the shortest depletion time'
      case BUY_SUPPLY_MODES.CRITICAL:
        return 'Resupplies only the resources that have been depleted'
      case BUY_SUPPLY_MODES.URGENT:
        return 'Ensures 12 hours worth of supplies for all resources'
      // case BUY_SUPPLY_MODES.CUSTOM:
      //   return "You can buy supplies to cover as many days you want. You can't use Resupply button in this mode."
    }
  }


  // ! PRIVATE METHODS =======================
  private static async getSettleFundsInstruction(market: Market, marketCredentials: MarketsCredentials, owner: PublicKey): Promise<TransactionInstruction> {

    return DexInstructions.settleFunds({
        market: market.publicKey,
        openOrders: (await market.findOpenOrdersAccountsForOwner(CONN, owner))[0].publicKey,
        owner: owner,
        baseVault: marketCredentials.baseVault,
        quoteVault: marketCredentials.quoteVault,
        baseWallet: await MarketService.getAssociatedTokenAddress(owner, market.baseMintAddress),
        quoteWallet: await MarketService.getAssociatedTokenAddress(owner, ATLAS_MINT),
        vaultSigner: marketCredentials.vaultSigner,
        programId: ATLAS_DEX
    })
  }

  private static allMarketsLoaded() : boolean {
    return !!(MarketService.ARMS_MARKET && MarketService.FOOD_MARKET && MarketService.FUEL_MARKET && MarketService.TOOLS_MARKET);
  }

  private static async getMarketBuyInstruction(market: Market, size: number, owner: PublicKey) : Promise<TransactionInstruction> {
  
    let payer = await MarketService.getAssociatedTokenAddress(owner, ATLAS_MINT);
    const instruction = await market.makeNewOrderV3Instruction({
      owner: owner,
      payer: payer,
      side: "buy",
      price: await MarketService.getMarketPrice(market),
      size: size,
      orderType: "limit"
    });

    const openOrderAccounts = await market.findOpenOrdersAccountsForOwner(CONN, owner);
    instruction.keys[1].pubkey = openOrderAccounts[0].address;
    
    return instruction;
  
  }

  private static async getMarketPrice(market: Market) : Promise<number> {
    let asks = await market.loadAsks(CONN);
    return asks.getL2(1)[0][0]
  }

  private static async getAssociatedTokenAddress(owner: PublicKey, mint: PublicKey) : Promise<PublicKey> {
  
    const [address] = await PublicKey.findProgramAddress(
      [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    return address;
  }

  private static async getUnsettledSupply(market: Market, player: PublicKey) : Promise<{unsettledTokens: number, unsettledAtlas: number}> {
 
    let openOrders = await market.findOpenOrdersAccountsForOwner(CONN, player);
    
    return {
      unsettledTokens: Number(openOrders[0].baseTokenFree),
      unsettledAtlas: Number(openOrders[0].quoteTokenFree),
    }
 
 
 
  }

}


