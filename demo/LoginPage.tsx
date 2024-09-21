import {
  useAptimusFlow,
  useKeylessLogin,
  useKeylessSession,
} from "../src/react";
import { AptimusNetwork } from "../src/index";
import {
  Account,
  Aptos,
  Network,
} from "@aptos-labs/ts-sdk";
import { getAptosConfig } from "../src/utils";
import { useState } from "react";

const network = AptimusNetwork.TESTNET;

const TransactionResult = ({ transactionHash }: { transactionHash: string}) => (
  <div className="mt-4 p-4 bg-green-100 rounded-md">
    <h3 className="text-lg font-semibold mb-2">Transaction Executed Successfully!</h3>
    <p className="mb-2">Transaction Hash: <span className="font-mono text-sm break-all">{transactionHash}</span></p>
    <div className="space-y-2">
      <a href={`https://explorer.aptoslabs.com/txn/${transactionHash}?network=testnet`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline block">
        View on Aptos Explorer
      </a>
    </div>
  </div>
);

export const LoginPage = () => {
  const flow = useAptimusFlow();
  const { address } = useKeylessLogin();
  const session = useKeylessSession();
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

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

  async function faucet() {
    const aptosConfig = getAptosConfig(network);
    const aptos = new Aptos(aptosConfig);
    if (address) {
      try {
        const resp = await aptos.fundAccount({
          accountAddress: address,
          amount: 1000000000,
        });
        setTransactionHash(resp.hash);
      } catch (error) {
        console.error(error);
      }
    }

    
  }

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
      data: {
        function: "0x1::aptos_account::transfer",
        // functionArguments: [bob.accountAddress, 1000000],
        functionArguments: [bobAccountAddress, 1000000],
      },
    });

    const { feePayerAuthenticator, sponsorSignedTransaction } =
      await flow.sponsorTransaction({
        network: AptimusNetwork.TESTNET,
        transaction,
      });

    const executedTransaction = await flow.executeTransaction({
      network: AptimusNetwork.TESTNET,
      feePayerAuthenticator,
      transaction: sponsorSignedTransaction,
      aptos,
    });

    setTransactionHash(executedTransaction.hash);
  };

  const executeTransaction = async () => {
    if (!address) {
      throw new Error("Sender address is undefined");
    }
    const aptosConfig = getAptosConfig(network);
    const aptos = new Aptos(aptosConfig);

    const bobAccountAddress =
      "0xed8af79aa6a0d0194808b18c5e9990c8d7c9e6846404dfb63bf716c6fa162981";

    const transaction = await aptos.transaction.build.simple({
      sender: address,
      withFeePayer: false,
      data: {
        function: "0x1::aptos_account::transfer",
        functionArguments: [bobAccountAddress, 1000000],
      },
    });

    const executedTransaction = await flow.executeTransaction({
      network: network,
      transaction,
      aptos,
    });

    setTransactionHash(executedTransaction.hash);
  };

  return (
    <div>
      {address ? (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
          <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-center mb-6">Aptimus Dashboard</h2>
            <div className="mb-4 text-center">
              <span className="font-semibold">Your Address:</span>
              <div className="text-sm text-gray-600 break-all">{address}</div>
            </div>
            <div className="space-y-3">
              <button onClick={faucet} className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-300">
                Faucet
              </button>
              <button onClick={executeTransaction} className="w-full bg-purple-500 text-white py-2 rounded-md hover:bg-purple-600 transition duration-300">
                Execute transaction
              </button>
              <button onClick={createAndExecuteSponsoredTransaction} className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition duration-300">
                Create and Execute Sponsored Transaction
              </button>
              <button onClick={() => flow.logout()} className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition duration-300">
                Sign Out
              </button>
            </div>
            {transactionHash && <TransactionResult transactionHash={transactionHash} />}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
          <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-center mb-6">Welcome to Aptimus</h2>

            <button onClick={startLogin} className="w-full bg-blue-300 text-gray-800 py-2 rounded-md mb-3 flex items-center justify-center">
              <span>Sign in with Google</span>
              <img src="/google-logo.png" className="ml-2 h-5 w-5" alt="Google logo" />
            </button>
            <button className="w-full bg-gray-200 text-gray-800 py-2 rounded-md mb-3 flex items-center justify-center">
              <span>Sign in with Apple</span>
              <img src="/apple-logo.png" className="ml-2 h-5 w-5" alt="Apple logo" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
