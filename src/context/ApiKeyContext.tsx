"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface ApiKeyContextType {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  isConfigured: boolean;
}

const ApiKeyContext = createContext<ApiKeyContextType>({
  apiKey: null,
  setApiKey: () => {},
  isConfigured: false,
});

export const ApiKeyProvider = ({ children }: { children: React.ReactNode }) => {
  const [apiKey, setApiKeyState] = useState<string | null>(null);

  useEffect(() => {
    // 1. Try to fetch from localStorage
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) {
      setApiKeyState(savedKey);
    }
    
    // 2. This interface now strictly requires user-provided keys to ensure
    // privacy and individual usage. We do not look for .env fallbacks.
  }, []);

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    localStorage.setItem("gemini_api_key", key);
  };

  return (
    <ApiKeyContext.Provider value={{ apiKey, setApiKey, isConfigured: !!apiKey }}>
      {children}
    </ApiKeyContext.Provider>
  );
};

export const useApiKey = () => useContext(ApiKeyContext);
