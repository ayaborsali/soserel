import React, { createContext, useContext, useState } from 'react';

const SectionVisibilityContext = createContext();

export const SectionVisibilityProvider = ({ children }) => {
  const [showStats, setShowStats] = useState(true);
  const [showAlerts, setShowAlerts] = useState(true);

  return (
    <SectionVisibilityContext.Provider value={{ showStats, setShowStats, showAlerts, setShowAlerts }}>
      {children}
    </SectionVisibilityContext.Provider>
  );
};

export const useSectionVisibility = () => useContext(SectionVisibilityContext);
