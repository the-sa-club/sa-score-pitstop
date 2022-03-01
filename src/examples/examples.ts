
import {
    createHarvestAllTransaction,
    ArmadaMaintenanceInstructionFactory,
} from "./Armada";
import {
    PublicKey, 
    Transaction,
} from '@solana/web3.js';

import { Market, TokenInstructions,  } from '@project-serum/serum';
import { connection, FOOD_MARKET_CRED, player } from './data'

const harvestAll = async () : Promise<Transaction> => {
    let tx = await createHarvestAllTransaction(connection, player);
    return tx;
}

const logAsks = async () => {
    const FOOD_MARKET_PK = new PublicKey("AdL6nGkPe3snPb7TEgSjaN8qCG493iYQqv4DeoCqH53F"); //ATLAS-FOOD
    const ATLAS_DEX = new PublicKey("9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin");
    let foodMarket = await Market.load(connection, FOOD_MARKET_PK, {}, ATLAS_DEX);
    let asks = await foodMarket.loadAsks(connection);
    console.log(asks.getL2(20));
}

const settleFood = async () : Promise<Transaction> => {
    const FOOD_MARKET_PK = new PublicKey("AdL6nGkPe3snPb7TEgSjaN8qCG493iYQqv4DeoCqH53F"); //ATLAS-FOOD
    const ATLAS_DEX = new PublicKey("9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin");
    let foodMarket = await Market.load(connection, FOOD_MARKET_PK, {}, ATLAS_DEX);
    let ix = await ArmadaMaintenanceInstructionFactory.getSettleFundsInstruction(
        connection,
        foodMarket,
        FOOD_MARKET_CRED,
        player
    )

    return new Transaction().add(ix);
}

