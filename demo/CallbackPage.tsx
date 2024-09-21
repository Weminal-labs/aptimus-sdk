import React, { useEffect } from "react";
import { useAuthCallback } from "../src/react";

export const CallbackPage = () => {
  const { handled } = useAuthCallback(); // This hook will handle the callback from the authentication provider

  useEffect(() => {
    if (handled) {
      window.location.href = "/";
    }
  }, [handled]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Processing Authentication</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Please wait while we complete the authentication process...</p>
      </div>
    </div>
  );
};
