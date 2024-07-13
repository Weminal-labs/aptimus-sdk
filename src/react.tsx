import { useStore } from "@nanostores/react";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { AptimusFlow, AptimusFlowConfig } from "./AptimusFlow";

const AptimusFlowContext = createContext<AptimusFlow | null>(null);

export interface AptimusFlowProviderProps extends AptimusFlowConfig {
  children: ReactNode;
}

export function AptimusFlowProvider({
  children,
  ...config
}: AptimusFlowProviderProps) {
  const [aptimusFlow] = useState(() => new AptimusFlow(config));
  return (
    <AptimusFlowContext.Provider value={aptimusFlow}>
      {children}
    </AptimusFlowContext.Provider>
  );
}

export function useAptimusFlow() {
  const context = useContext(AptimusFlowContext);
  if (!context) {
    throw new Error("Missing `AptimusFlowContext` provider");
  }
  return context;
}

export function useKeylessLogin() {
  const flow = useAptimusFlow();
  return useStore(flow.$keylessState);
}

export function useKeylessSession() {
  const flow = useAptimusFlow();
  return useStore(flow.$keylessSession).value;
}

export function useAuthCallback() {
  const flow = useAptimusFlow();
  const [state, setState] = useState<string | null>(null);
  const [handled, setHandled] = useState(false);
  const [hash, setHash] = useState<string | null>(null);

  useEffect(() => {
    const listener = () => setHash(window.location.hash.slice(1).trim());
    listener();

    window.addEventListener("hashchange", listener);
    return () => window.removeEventListener("hashchange", listener);
  }, []);

  useEffect(() => {
    if (!hash) return;

    (async () => {
      try {
        setState(await flow.handleAuthCallback(hash));

        window.location.hash = "";
      } finally {
        setHandled(true);
      }
    })();
  }, [hash, flow]);

  return { handled, state };
}
