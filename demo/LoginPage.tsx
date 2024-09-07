import {
  useAptimusFlow,
  useKeylessLogin,
  useKeylessSession,
} from "../src/react";
import { AptimusNetwork } from "../src/index";
import {
  Account,
  AccountAuthenticator,
  Aptos,
  AptosConfig,
  Deserializer,
  EphemeralKeyPair,
  KeylessAccount,
  Network,
  SimpleTransaction,
} from "@aptos-labs/ts-sdk";
import { getAptosConfig } from "../src/utils";

const network = AptimusNetwork.M1;

export const LoginPage = () => {
  const flow = useAptimusFlow();
  const { address } = useKeylessLogin();
  const session = useKeylessSession();

  const startLogin = async () => {
    const url = await flow.createAuthorizationURL({
      provider: "google",
      clientId:
        "898060815188-os2kha196hocdsuqpjhao3r52d4k9tkk.apps.googleusercontent.com",
      redirectUrl: `${window.location.origin}/callback`,
      network,
    });
    console.log(url);
    window.location.href = url.toString();
  };

  const createSponsoredTransaction = async () => {
    if (!address) {
      throw new Error("Sender address is undefined");
    }
    const aptosConfig = getAptosConfig(network);
    const aptos = new Aptos(aptosConfig);

    const bobAccountAddress =
      "0xed8af79aa6a0d0194808b18c5e9990c8d7c9e6846404dfb63bf716c6fa162981";

    const transaction = await aptos.transaction.build.simple({
      sender: address,
      withFeePayer: true,
      data: {
        function: "0x1::aptos_account::transfer",
        functionArguments: [bobAccountAddress, 1000000],
      },
    });

    console.log("Before sponsor transaction: ", transaction);

    const { sponsorSignedTransaction } = await flow.sponsorTransaction({
      network: network,
      transaction,
    });

    console.log("After sponsor transaction: ", sponsorSignedTransaction);
  };

  const createAndExecuteSponsoredTransaction = async () => {
    if (!address) {
      throw new Error("Sender address is undefined");
    }
    const aptosConfig = getAptosConfig(network);
    const aptos = new Aptos(aptosConfig);

    const bobAccountAddress =
      "0xed8af79aa6a0d0194808b18c5e9990c8d7c9e6846404dfb63bf716c6fa162981";

    const transaction = await aptos.transaction.build.simple({
      sender: address,
      withFeePayer: true,
      // withFeePayer: false,
      data: {
        function: "0x1::aptos_account::transfer",
        // functionArguments: [bob.accountAddress, 1000000],
        functionArguments: [bobAccountAddress, 1000000],
      },
    });

    // const { feePayerAuthenticator, sponsorSignedTransaction } =
    //   await flow.sponsorTransaction({
    //     network: AptimusNetwork.DEVNET,
    //     transaction,
    //   });

    // const executedTransaction = await flow.executeTransaction({
    //   network: AptimusNetwork.DEVNET,
    //   feePayerAuthenticator,
    //   transaction: sponsorSignedTransaction,
    //   aptos,
    // });

    const executedTransaction = await flow.sponsorAndExecuteTransaction({
      network: network,
      transaction,
      aptos,
    });

    console.log(
      `Transaction: https://explorer.movementlabs.xyz/${executedTransaction.hash}?network=${Network.TESTNET}`
    );
    console.log(
      `Transaction: https://explorer.aptoslabs.com/txn/${executedTransaction.hash}?network=${Network.TESTNET}`
    );
  };

  const executeTransaction = async () => {
    if (!address) {
      throw new Error("Sender address is undefined");
    }
    const aptosConfig = getAptosConfig(network);
    const aptos = new Aptos(aptosConfig);

    const bobAccount = Account.generate();

    const res = await aptos.getAccountResources({
      accountAddress: address
    })

    console.log("Account resources: ", res);
  };

  return (
    <div>
      {address ? (
        <>
          <div>{address}</div>
          <button onClick={() => flow.logout()}>Sign Out</button>
          <button onClick={createSponsoredTransaction}>
            Create sponsored Transaction
          </button>
          <button onClick={createAndExecuteSponsoredTransaction}>
            Create and Execute sponsored Transaction
          </button>
          <button onClick={executeTransaction}>
            Get Account Resources (see in console tab)
          </button>
        </>
      ) : (
        <button
          className="flex justify-center items-center border rounded-lg px-8 py-2 hover:bg-gray-100 hover:shadow-sm active:bg-gray-50 active:scale-95 transition-all"
          onClick={startLogin}
        >
          Sign in with google
        </button>
      )}
    </div>
  );
};
