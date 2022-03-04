import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";

export const RADUIS = 39.94789071606573;
export const CIRCUMFEREMCE = Math.PI * 2 * RADUIS;

export const COLORS = {
  THICK_RED: "#ff3233",
  THICK_BLUE: "#35fdff",
  THICK_YELLOW: "#ffed33",
  THICK_GREEN: "#c8f829",
  THICK_GREY: "#c5c3c3",
};

export const CONN = new Connection("https://solana--mainnet.datahub.figment.io/apikey/a273d5bc3ab79337e4c0dafc0c45d6df");
export const FLEET_PROGRAM = new PublicKey(
  "FLEET1qqzpexyaDpqb2DGsSzE2sDCizewCg9WjrA6DBW"
);

export const GUILD_WALLET = new PublicKey(
  "3d7EhHREZxkxqjdCDC8aYipoJH9FNms31foGPTTeHWxc"
);
export const AND_WALLET = new PublicKey(
  "RDqYaZ5bCMgdrsC59UWjKbRy3jdCiBpBYses6q9ho2D"
);
export const BAC_WALLET = new PublicKey(
  "9VV4TyRbNXfKcaG7kpxZ4WNax69kq59yNwtLHsPpEhSL"
);
export const ATLAS_MINT = new PublicKey(
  "ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx"
);

export const PALLETE = {
  SECONDARY_BG_COLOR: "#252525",
  FONT_COLOR_SIGN: "#4b4b4b",
  PRIMARY_BG_COLOR: "#080808c2",
  PRIMARY_BG_COLOR_DARK: "#080808",
  PRIMARY_BG_COLOR_HOVER: "#3333337e",
  FONT_COLOR: "#c5c3c3",
  FONT_SM: "13.5px",
  FONT_XM: "12px",
  FONT_MD: "16.5px",
  // CLUB_RED: "#d02452d3",
  CLUB_RED: "#142a54",
  CLUB_RED_DENSE: "#d02452",
  CLUB_RED_HOVER: "#d3768fd3",
  DEVICE : {
    mobileS: `(max-width: 320px)`,
    mobileM: `(max-width: 375px)`,
    mobileL: `(max-width: 768px)`,
    laptop: `(max-width: 1024px)`,
    laptopL: `(max-width: 1440px)`,
    desktop: `(min-width: 2560px)`,
  }
};

export enum BUY_SUPPLY_MODES {
  FULL_TANKS = "FULL TANKS SUPPLY",
  OPTIMAL = "OPTIMAL SUPPLY",
  URGENT = "URGENT ONLY SUPPLY",
  CRITICAL = "CRITICAL SUPPLY",
  // NONE = "NONE",
}

export type MarketsCredentials = {
  address: PublicKey;
  baseVault: PublicKey;
  quoteVault: PublicKey;
  vaultSigner: PublicKey;
};

export const FOOD_MARKET_CRED: MarketsCredentials = {
  address: new PublicKey("AdL6nGkPe3snPb7TEgSjaN8qCG493iYQqv4DeoCqH53F"),
  baseVault: new PublicKey("7pN9M8KCTPK8mmVDiPZmYPLjY5usoFWDEyNWtCA96Npr"),
  quoteVault: new PublicKey("DuWZwtytgYtSYSfZP5h7LHt3MaER27nSN8fiEmzMSAL2"),
  vaultSigner: new PublicKey("FBcgSh26moJe2XAd7L2oHvXmrnzdVuazuZy8NQwsNi8p"),
}; //ATLAS-FOOD
export const ARMS_MARKET_CRED: MarketsCredentials = {
  address: new PublicKey("8qtV9oq8VcrUHZdEeCJ2bUM3uLwjrfJ9U9FGrCSvu34z"),
  baseVault: new PublicKey("9JHgNyKGQ52LxhZqQKy4QJ5wrNJpL9dWYRqxeXtGz7uo"),
  quoteVault: new PublicKey("C7aoztjKUZGvcD3msBaJi73Rqi99adPumxfuaGBGQ6Mw"),
  vaultSigner: new PublicKey("CwM9Z6nexUcY9T3G4mRZ4sbzrwfywuUPkgbBMBJdDcPe"),
};
//ATLAS-ARMS
export const FUEL_MARKET_CRED: MarketsCredentials = {
  address: new PublicKey("D6rLbJLqi1VvV81ViPScgWiKYcZoTPnMiQTcrmH9X5oQ"),
  baseVault: new PublicKey("2AKDUUhg7LjTntVnBzVVhqhv1favmRmcY21LUp4TiDfd"),
  quoteVault: new PublicKey("5AaPvXwqf5DDnPstiaQPaZow4N9ue1pf2SYy6Gp8Dp1x"),
  vaultSigner: new PublicKey("3rVU7QaoWPy4T1cpj5EmHzbWN1PjuyenNFLntA41boo3"),
};
//ATLAS-FOOD
export const TOOLS_MARKET_CRED: MarketsCredentials = {
  address: new PublicKey("32Pr4MhSD1K4J9buESjjbSZnXWLQ5oHFgB9MhEC2hp6J"),
  baseVault: new PublicKey("BawrmsjgMYqvQBuK3WyqBNrbqygcHXqTcpEkkqRDK5sm"),
  quoteVault: new PublicKey("9rVQSFkuqVuQnPQ85JmiiaJ8NvyJzK49NeZ8QLHrYSXk"),
  vaultSigner: new PublicKey("2aNVwFSFKSADK9wnjSrTVUd7bXK7sEHDp79zuUJSaedB"),
};
//ATLAS-FOOD
export const ATLAS_DEX = new PublicKey(
  "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin"
);

export enum SUPPLIES_NAMES {
  FOOD = "FOOD",
  ARMS = "ARMS",
  FUEL = "FUEL",
  TOOLS = "TOOLS",
}

export const SUPPLIES_MINTS = [
  {
    name: SUPPLIES_NAMES.FOOD,
    token: new Token(
      CONN,
      new PublicKey("foodQJAztMzX1DKpLaiounNe2BDMds5RNuPC6jsNrDG"),
      TOKEN_PROGRAM_ID,
      new Keypair()
    ),
  },
  {
    name: SUPPLIES_NAMES.ARMS,
    token: new Token(
      CONN,
      new PublicKey("ammoK8AkX2wnebQb35cDAZtTkvsXQbi82cGeTnUvvfK"),
      TOKEN_PROGRAM_ID,
      new Keypair()
    ),
  },
  {
    name: SUPPLIES_NAMES.FUEL,
    token: new Token(
      CONN,
      new PublicKey("fueL3hBZjLLLJHiFH9cqZoozTG3XQZ53diwFPwbzNim"),
      TOKEN_PROGRAM_ID,
      new Keypair()
    ),
  },
  {
    name: SUPPLIES_NAMES.TOOLS,
    token: new Token(
      CONN,
      new PublicKey("tooLsNYLiVqzg8o4m3L2Uetbn62mvMWRqkog6PQeYKL"),
      TOKEN_PROGRAM_ID,
      new Keypair()
    ),
  },
];

export const ATLAS_TOKEN = new Token(
  CONN,
  new PublicKey("ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx"),
  TOKEN_PROGRAM_ID,
  new Keypair()
);

export const FOOD_TOKEN = new Token(
  CONN,
  new PublicKey("foodQJAztMzX1DKpLaiounNe2BDMds5RNuPC6jsNrDG"),
  TOKEN_PROGRAM_ID,
  new Keypair()
);
export const ARMS_TOKEN = new Token(
  CONN,
  new PublicKey("ammoK8AkX2wnebQb35cDAZtTkvsXQbi82cGeTnUvvfK"),
  TOKEN_PROGRAM_ID,
  new Keypair()
);
export const TOOLS_TOKEN = new Token(
  CONN,
  new PublicKey("tooLsNYLiVqzg8o4m3L2Uetbn62mvMWRqkog6PQeYKL"),
  TOKEN_PROGRAM_ID,
  new Keypair()
);
export const FUEL_TOKEN = new Token(
  CONN,
  new PublicKey("fueL3hBZjLLLJHiFH9cqZoozTG3XQZ53diwFPwbzNim"),
  TOKEN_PROGRAM_ID,
  new Keypair()
);


export const ATLAS_DECIMAL = 1;
export const USDC_DECIMAL = 2;
export const RESOURCE_DECIMAL = 0;
export const FEE = 0.05
export const FIXED_FEE = 1