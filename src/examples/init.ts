import { Market, OpenOrders, DexInstructions, NEW_ORDER_OPEN_ORDERS_INDEX } from "@project-serum/serum";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, Token } from '@solana/spl-token';
import * as web3 from "@solana/web3.js";
import {
    Armada,
} from "./Armada";
import BN = require("bn.js");

import * as data from './data';
import { readFileSync } from "fs";
import {
    Account,
    Connection,
    PublicKey,
    Keypair, 
    SystemProgram,
    Transaction,
    TransactionInstruction, 
    sendAndConfirmTransaction, 
    sendAndConfirmRawTransaction,
    
} from '@solana/web3.js';

import {
    getAssociatedTokenAddress,
    readKeypairFromPath
} from "./classes/Helpers";

type TransactionInstructionsWithNewAccounts = {
	newAccounts: Account[];
	instructions: TransactionInstruction[]
}


const OPEN_ORDERS_LAYOUT_SIZE = 3228;
const player_name = "new_player.json";

const makeMicroTransaction = async (connection: Connection, player: PublicKey, market: Market, price: number) : Promise<TransactionInstructionsWithNewAccounts> => {
    let payer = await getAssociatedTokenAddress(player, data.ATLAS_MINT);
    let openOrders = new Account();
    
    let createAccountIx = SystemProgram.createAccount({
        fromPubkey: player,
        lamports: await connection.getMinimumBalanceForRentExemption(OPEN_ORDERS_LAYOUT_SIZE),
        newAccountPubkey: openOrders.publicKey,
        programId: data.ATLAS_DEX,
        space: OPEN_ORDERS_LAYOUT_SIZE
    });
    let startMatchOrdersIx = market.makeMatchOrdersTransaction(5);
    let placeOrderIx = market.makePlaceOrderInstruction(
        connection,
        {
            owner: player,
            payer: payer,
            price: price,
            side: 'buy',
            size: 10,
            orderType: 'limit',
            openOrdersAccount: openOrders,
        }
    )
    let endMatchOrdersIx = market.makeMatchOrdersTransaction(5);

    //market.makeMatchOrdersTransaction(5);
    
    let ixs = [];// Transaction = new Transaction();

    ixs.push(startMatchOrdersIx);
    ixs.push(createAccountIx);
    ixs.push(placeOrderIx);
    ixs.push(endMatchOrdersIx);
    return {
        newAccounts: [openOrders],
        instructions: ixs
    }
    //await sendAndConfirmTransaction(connection, tx, [player, openOrders]);
    /*let oo = new PublicKey("CA8LAqqQN4EwtRnrdAM4fTkKb1Cxq5C1GCLDP9V7sxRm");
    let ai = (await connection.getAccountInfo(oo));
    console.log(Buffer.byteLength(ai.data));
    console.log(ai);
    console.log(await connection.getMinimumBalanceForRentExemption(3228));
    console.table([market.address, market.programId, market.publicKey]);*/
}



const makeCreateAssociatedTokensAccountsInstructions = async (connection: Connection, player: PublicKey) : Promise<TransactionInstruction[]> => {
	//const owner = readKeypairFromPath(__dirname + "/keys/"+player_name);
	//const player = owner.publicKey;
	let tokens_accounts = await Promise.all(data.SUPPLIES_MINTS.map(async (el) => {
		return {
			account: await getAssociatedTokenAddress(player, el.token.publicKey),
			mint: el.token.publicKey
		};
	}));
	let token_accounts_data = await Promise.all(tokens_accounts.map(async (el) => {
		return {
			account: el.account,
			data: await connection.getAccountInfo(el.account),
			mint: el.mint
		}
	}));


	let accounts_2_create = (token_accounts_data.filter((el) => {
		
		if (el.data === null) {
			return true
		};
		return false;
	})
	);
	if (accounts_2_create.length === 0) {
		return [];
	}
	let ixs = accounts_2_create.map((el)=> {
		return Token.createAssociatedTokenAccountInstruction(
			ASSOCIATED_TOKEN_PROGRAM_ID,
			TOKEN_PROGRAM_ID,
			el.mint,
			el.account,
			player,
			player)
	});
	console.log(ixs);
	return ixs;
	/*
	let tx = new Transaction()
	ixs.map(ix => tx.add(ix));
	
	return tx;*/
	//await sendAndConfirmTransaction(connection, new Transaction().add(ixs[0]), [owner]);
}


const makeCreateSerumOpenOrdersAccountsInstructions = async (connection: Connection, player: PublicKey) : Promise<TransactionInstructionsWithNewAccounts[]> /*: Promise<TransactionWithNewAccount[]> */=> {
	console.log('load data');
	await Armada.load(data.connection, data.score, data.SHIP_MINTS, data.SUPPLIES_MINTS);
	let result = [];
	let ammoOpenOrders = await Armada.ARMS_MARKET.findOpenOrdersAccountsForOwner(data.connection, player);
    if (ammoOpenOrders.length === 0) {
        let ammoIxs = await makeMicroTransaction(data.connection, player, Armada.ARMS_MARKET, 0.0021504);
		result.push(ammoIxs);
        //await sendAndConfirmTransaction(data.connection, ammoTx.transaction, [player, ammoTx.newAccount]);
    }
    let foodOpenOrders = await Armada.FOOD_MARKET.findOpenOrdersAccountsForOwner(data.connection, player);
    if (foodOpenOrders.length === 0) {
        let foodIxs = await makeMicroTransaction(data.connection, player, Armada.FOOD_MARKET, 0.0006244);
        result.push(foodIxs);
    }
    let fuelOpenOrders = await Armada.FUEL_MARKET.findOpenOrdersAccountsForOwner(data.connection, player);
    if (fuelOpenOrders.length === 0) {
        let fuelIxs = await makeMicroTransaction(data.connection, player, Armada.FUEL_MARKET, 0.0014336);
        result.push(fuelIxs);
    }
    let toolOpenOrders = await Armada.TOOLS_MARKET.findOpenOrdersAccountsForOwner(data.connection, player);
    if (toolOpenOrders.length === 0) {
        let toolIxs = await makeMicroTransaction(data.connection, player, Armada.TOOLS_MARKET, 0.0017408);
        result.push(toolIxs);
    }
	return result;
}

const sendCreateSerumOpenOrdersAccountsTransaction = (
	instructions: TransactionInstructionsWithNewAccounts[], 
	connection: Connection, 
	player: Keypair) => {
		
		instructions.map((el) => {
			let tx = new Transaction();
			el.instructions.map(ix => tx.add(ix));
			let signers : web3.Signer[] = [player];
			el.newAccounts.map(acc => signers.push(acc));
			//===================UNCOMENT TO SEND TRANSACTIONS
			//sendAndConfirmTransaction(connection, tx, signers)
			console.log(tx);
		})
}

//SEE sendCreateSerumOpenOrdersAccountsTransaction how to compose transactions with instructions and new accounts 
const player = readKeypairFromPath(__dirname + "/keys/"+player_name);

//if this method returns empty list then all supplies tokens associated accounts exists, 
//if not - player should run this instructions, or get missing supplies (for example buy its on ATLAS market)
makeCreateAssociatedTokensAccountsInstructions(data.connection, data.player).then(res => console.log(res));
//if this method returns empty list then all serum's open orders accounts exists,
//if not - player should run this instructions as described in sendCreateSerumOpenOrdersAccountsTransaction methods 
//(NB!!!! All new accounts must be in transaction signers list!!!!!)
//(NB!!!! Runing this transaction may lead to incorrect work of StarAtlas GUI 
//(not showing not settled funds, user must go to another dex (fe. raydium) to settle funds).
makeCreateSerumOpenOrdersAccountsInstructions(data.connection, data.player).then(
	res=> sendCreateSerumOpenOrdersAccountsTransaction(res, data.connection, player));
