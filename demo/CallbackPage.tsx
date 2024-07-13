import React, { useEffect } from "react";
import { useAuthCallback } from "../src/react";

export const CallbackPage = () => {
  const { handled } = useAuthCallback(); // This hook will handle the callback from the authentication provider

  useEffect(() => {
    if (handled) {
      window.location.href = "/";
    }
  }, [handled]);

  return <div>CallbackPage</div>;
};
