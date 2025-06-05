"use client";

import { createContext, useContext, useState } from "react";

const DetectionContext = createContext();

export function DetectionProvider({ children }) {
  const [itemDetected, setItemDetected] = useState([]);

  return (
    <DetectionContext.Provider value={{ itemDetected, setItemDetected }}>
      {children}
    </DetectionContext.Provider>
  );
}

export function useDetection() {
  return useContext(DetectionContext);
}