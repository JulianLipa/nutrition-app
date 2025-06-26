"use client";

import { createContext, useContext, useState } from "react";

const DetectionContext = createContext();

export function DetectionProvider({ children }) {
  const [itemDetected, setItemDetected] = useState([]);
  const [configData, setConfigData] = useState([]);

  return (
    <DetectionContext.Provider value={{ itemDetected, setItemDetected, configData, setConfigData }}>
      {children}
    </DetectionContext.Provider>
  );
}

export function useDetection() {
  return useContext(DetectionContext);
}