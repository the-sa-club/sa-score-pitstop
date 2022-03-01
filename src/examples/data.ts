import {
    clusterApiUrl,
    PublicKey, 
    Keypair, 
    Connection
} from '@solana/web3.js';
import {
    Token,
    TOKEN_PROGRAM_ID
} from "@solana/spl-token";

const env = "mainnet-beta";

//export const connection = new Connection(clusterApiUrl(env));
const serum_endpoint = "https://solana-api.projectserum.com";
export const connection = new Connection(serum_endpoint);

export enum SuppliesNames {
    ARMS,
    FOOD,
    FUEL,
    TOOLS
}

export type TOKEN_DATA = {
    name: SuppliesNames,
    token: Token
}

export type DemandInfo = {
    toBuy: number,
    timeLeft: number
}

export type Supplies = {
    food: DemandInfo,
    arms: DemandInfo,
    fuel: DemandInfo,
    tools: DemandInfo,
}

export type FleetSuppliesStatus = {
    shipMint: string,
    supplies: Supplies
}

export type ArmadaSuppliesStatus = {
    totalDemand: Supplies,
    stocks: Supplies,
    deficit: Supplies
}

export type ArmadaInfo = {
    player: PublicKey,
    supplies: ArmadaSuppliesStatus,
    fleets: FleetSuppliesStatus[]
}

//export const player = new PublicKey("4XFVvUxQuSLZ3eVHgrtRgDL7LKoQ8fgMhN1ZkeG97rmF");
export const player = new PublicKey("9VV4TyRbNXfKcaG7kpxZ4WNax69kq59yNwtLHsPpEhSL");
export const SHIP_MINTS = [
    new PublicKey("9czEqEZ4EkRt7N3HWDcw9qqwys3xRRjGdbn8Jhk8Khwj"),//"VZUS opod", 
    new PublicKey("267DbhCypYzvTqv72ZG5UKHeFu56qXFsuoz3rw832eC5"),//"Pearce X5", 
    new PublicKey("CWxNX9sTexuqvQefqskhP9f6AP5C8hq2VNkicRseqAT5"),//"Ogrika Thripid", 
    new PublicKey("9MvZS3TVfv4DZL9W2pT12po384aBHf7wi89KXQ9Z7uwW"),//"Pearce F4", 
    new PublicKey("9ABNesWj7NVdkDgko7UjVaDp5pTh8a6wfXHLWz3bZM6W"),//"Opal Jetjet", 
    new PublicKey("H2jHqvXA2oxSpEp6dKkpK7WeszQEdFW5n25mNfrJFAc1"),//"VZUS ambwe", 
    new PublicKey("FpwV1Da6BZJnYPr1JSLUm14UwBmZHA7J5WLY4TXgbde8"),//"Fimbul ECOS Greenader", 
    new PublicKey("2bCgKTo11QayWBy6QryHZMqZL2ZgWd5LEAZKiTGQi4g7"),//"Pearce R8", 
    new PublicKey("9ifQ16N5DdUFoejCwsgR73ihUwadAe3srCo9HhQe2zL2"),//"Pearce C11", 
    new PublicKey("HJBmBYyGR8z1oajAM4jiK46uobuxeJoKDYpFwzWHBvhb"),//"Ogrika Jod Asteris", 
    new PublicKey("8RveLFEyteyL1vbCKPQJxjf3JT1ACyrzs46TXbJStrHG"),//"Pearce X6", 
    new PublicKey("HqPN13pLUVJRiuGSsKjfWZvGKAagK98PshuKu51bnG4E"),//"Fimbul ECOS Treearrow", 
    new PublicKey("DsJHgpnNovjJ981QJJnqMggexAekNawbSavfV1QuTpis"),//"Rainbow Chi", 
    new PublicKey("6SqLuwHNRC1qjo9KATLKJLszFHMWyYaNxDXraCEUtfdR"),//"Fimbul BYOS Earp", 
    new PublicKey("4txpjHspP4usEsQTr3AcrpyHVjN4fi3d4taM6cmKJnd1"),//"Calico Evac", 
    new PublicKey("7M6RHgPiHXiZAin5ManH63cLYGt3miQ54KaGynUQoERS"),//"Fimbul ECOS Bombarella", 
    new PublicKey("DdpXnnYsyUQgJby8TDHbmPwkKyGF4U6bXwCXTQZsrfKP"),//"Calico Guardian", 
    new PublicKey("HzBx8PP86pyPrrboTHqPYWhxnEB5vXDHDBP8femWfPTS"),//"Rainbow Om", 
    new PublicKey("7V9C2XUQgCb31n7hGKqKGu4ENcvqXhJLJzU77CAQtXhw"),//"Fimbul BYOS Packlite", 
    new PublicKey("AkNbg12E9PatjkiAWJ3tAbM479gtcoA1gi6Joa925WKi"),//"Calico Compakt Hero", 
    new PublicKey("2iMhgB4pbdKvwJHVyitpvX5z1NBNypFonUgaSAt9dtDt"),//"Pearce X4", 
    new PublicKey("Ev3xUhc1Leqi4qR2E5VoG9pcxCvHHmnAaSRVPg485xAT"),//"Opal Jet", 
    new PublicKey("5f1jUARhtSypVA4uTpgpLp76WYGdB2dGr8zMbh4WjYRf"),//"Pearce C9", 
    new PublicKey("HsdbLvZrEgN2ZhsrZs5ag4F2FNFCHjjuXPfbVAhkeJBZ"),//"Tufa Feist", 
];

export const SUPPLIES_MINTS: TOKEN_DATA[] = [
    {
        name: SuppliesNames.FOOD,
        token: new Token(
            connection, 
            new PublicKey("foodQJAztMzX1DKpLaiounNe2BDMds5RNuPC6jsNrDG"), 
            TOKEN_PROGRAM_ID, 
            new Keypair())
    },
    {
        name: SuppliesNames.ARMS,
        token: new Token(connection, new PublicKey("ammoK8AkX2wnebQb35cDAZtTkvsXQbi82cGeTnUvvfK"), TOKEN_PROGRAM_ID, new Keypair())
    }, 
    {
        name: SuppliesNames.FUEL,
        token: new Token(connection, new PublicKey("fueL3hBZjLLLJHiFH9cqZoozTG3XQZ53diwFPwbzNim"), TOKEN_PROGRAM_ID, new Keypair())
    }, 
    {
        name: SuppliesNames.TOOLS,
        token: new Token(connection, new PublicKey("tooLsNYLiVqzg8o4m3L2Uetbn62mvMWRqkog6PQeYKL"), TOKEN_PROGRAM_ID, new Keypair())
    }
];

export const score = new PublicKey('FLEET1qqzpexyaDpqb2DGsSzE2sDCizewCg9WjrA6DBW');

export const ATLAS_MINT = new PublicKey('ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx');

export type MarketsCredentials = {
    address: PublicKey,
    baseVault: PublicKey,
    quoteVault: PublicKey,
    vaultSigner: PublicKey,
}

export const FOOD_MARKET_CRED: MarketsCredentials = {
    address: new PublicKey("AdL6nGkPe3snPb7TEgSjaN8qCG493iYQqv4DeoCqH53F"),
    baseVault: new PublicKey("7pN9M8KCTPK8mmVDiPZmYPLjY5usoFWDEyNWtCA96Npr"),
    quoteVault: new PublicKey("DuWZwtytgYtSYSfZP5h7LHt3MaER27nSN8fiEmzMSAL2"),
    vaultSigner: new PublicKey("FBcgSh26moJe2XAd7L2oHvXmrnzdVuazuZy8NQwsNi8p")
};//ATLAS-FOOD
export const ARMS_MARKET_CRED: MarketsCredentials = {
    address: new PublicKey("8qtV9oq8VcrUHZdEeCJ2bUM3uLwjrfJ9U9FGrCSvu34z"),
    baseVault: new PublicKey("9JHgNyKGQ52LxhZqQKy4QJ5wrNJpL9dWYRqxeXtGz7uo"),
    quoteVault: new PublicKey("C7aoztjKUZGvcD3msBaJi73Rqi99adPumxfuaGBGQ6Mw"),
    vaultSigner: new PublicKey("FBcgSh26moJe2XAd7L2oHvXmrnzdVuazuZy8NQwsNi8p")
};
     //ATLAS-ARMS
export const FUEL_MARKET_CRED: MarketsCredentials = {
    address: new PublicKey("D6rLbJLqi1VvV81ViPScgWiKYcZoTPnMiQTcrmH9X5oQ"),
    baseVault: new PublicKey("2AKDUUhg7LjTntVnBzVVhqhv1favmRmcY21LUp4TiDfd"),
    quoteVault: new PublicKey("5AaPvXwqf5DDnPstiaQPaZow4N9ue1pf2SYy6Gp8Dp1x"),
    vaultSigner: new PublicKey("FBcgSh26moJe2XAd7L2oHvXmrnzdVuazuZy8NQwsNi8p")
}; //ATLAS-FOOD
export const TOOLS_MARKET_CRED: MarketsCredentials = {
    address: new PublicKey("32Pr4MhSD1K4J9buESjjbSZnXWLQ5oHFgB9MhEC2hp6J"),
    baseVault: new PublicKey("BawrmsjgMYqvQBuK3WyqBNrbqygcHXqTcpEkkqRDK5sm"),
    quoteVault: new PublicKey("9rVQSFkuqVuQnPQ85JmiiaJ8NvyJzK49NeZ8QLHrYSXk"),
    vaultSigner: new PublicKey("FBcgSh26moJe2XAd7L2oHvXmrnzdVuazuZy8NQwsNi8p")
}; //ATLAS-FOOD
export const ATLAS_DEX = new PublicKey("9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin");
