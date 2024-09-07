import { AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { AptimusNetwork } from "./AptimusClient/type";

export function toB64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

export function fromB64(base64String: string): Uint8Array {
  return new Uint8Array(Buffer.from(base64String, "base64"));
}

export const getAptosConfig = (network: AptimusNetwork): AptosConfig => {
  switch (network) {
    case AptimusNetwork.M1:
      return new AptosConfig({
        fullnode: 'https://aptos.testnet.suzuka.movementlabs.xyz/v1',
        faucet: 'https://faucet.testnet.suzuka.movementlabs.xyz/',
      });
    case AptimusNetwork.TESTNET:
      return new AptosConfig({ network: Network.TESTNET });
    default:
      throw new Error(`Unsupported or undefined network: ${network}`);
  }
};