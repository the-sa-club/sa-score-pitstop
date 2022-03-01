import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';

import {
    PublicKey,
    Keypair,
} from "@solana/web3.js"

import { readFileSync } from "fs";

export function readKeypairFromPath(path: string): Keypair {
    const data = JSON.parse(readFileSync(path, "utf-8"))
    return Keypair.fromSecretKey(Buffer.from(data))
}

export async function getAssociatedTokenAddress(owner: PublicKey, mint: PublicKey): Promise<PublicKey> {
    const [address] = await PublicKey.findProgramAddress(
        [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
        ASSOCIATED_TOKEN_PROGRAM_ID,
    );
    return address;
  }
