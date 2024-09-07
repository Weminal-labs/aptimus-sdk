import { ZeroKnowledgeSig } from "@aptos-labs/ts-sdk";

export enum AptimusNetwork {
  MAINNET = "mainnet",
  TESTNET = "testnet",
  DEVNET = "devnet",
  M1 = "m1",
}

export interface CreateKeylessZkpApiInput {
  network?: AptimusNetwork;
  ephemeralKeyPairBase64: string;
  jwt: string;
}
export interface CreateKeylessZkpApiResponse extends ZeroKnowledgeSig {}

export type CreateSponsoredTransactionApiInput = {
  network?: AptimusNetwork;
  transactionBytesBase64: string;
} & (
  | {
      jwt: string;
      sender?: never;
      allowedAddresses?: never;
      allowedMoveCallTargets?: never;
    }
  | {
      sender: string;
      allowedAddresses?: string[];
      allowedMoveCallTargets?: string[];
      jwt?: never;
    }
);

export interface CreateSponsoredTransactionApiResponse {
  sponsorAuthBytesBase64: string;
  sponsorSignedTransactionBytesBase64: string;
}
