
import * as web3 from "@solana/web3.js";
import { createHarvestInstruction } from "@staratlas/factory";
import {
    createHarvestAllTransaction, 
    ArmadaMaintenanceInstructionFactory,
    Armada,
} from "./Armada";


import * as data from './data'

const logShips = (info: data.ArmadaInfo) => {
    let fleet = info.fleets.filter((el => el.shipMint == "4txpjHspP4usEsQTr3AcrpyHVjN4fi3d4taM6cmKJnd1"))[0];
    console.log(fleet.supplies);
}

const main = async (connection: web3.Connection, player: web3.PublicKey) : Promise<web3.TransactionInstruction[]>=> {
    await Armada.load(connection, data.score, data.SHIP_MINTS, data.SUPPLIES_MINTS);
    
    let info: data.ArmadaInfo = await Armada.getArmadaInfo(connection, player);
    logShips(info);
    //console.log(info.fleets);
    let harvestIxs: web3.TransactionInstruction[] = await ArmadaMaintenanceInstructionFactory.getHarvestAllInstructions(data.connection, info);
    let buyIxs: web3.TransactionInstruction[] = await ArmadaMaintenanceInstructionFactory.getBuyAllInstructions(data.connection, info);
    let settleIxs: web3.TransactionInstruction[] = await ArmadaMaintenanceInstructionFactory.getSettleAllInstructions(data.connection, info);
    let resupplyIxs: web3.TransactionInstruction[] = await ArmadaMaintenanceInstructionFactory.getResupplyAllInstructions(data.connection, info);
    let res = [harvestIxs, buyIxs, settleIxs, resupplyIxs].flat();
    return res;
}



main(data.connection, data.player).then((res) => {
    console.log('Total transaction needed for full resupply: ', res.length);
})
