// VisibilityContext.tsx

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface VisibilityContextProps {
 chatHistoryVisible: boolean;
 toggleChatHistoryVisibility: () => void;
}

const VisibilityContext = createContext<VisibilityContextProps | undefined>(undefined);

export const useVisibility = () => {
 const context = useContext(VisibilityContext);
 if (!context) {
    throw new Error('useVisibility must be used within a VisibilityProvider');
 }
 return context;
};

interface VisibilityProviderProps {
 children: ReactNode; // Add this line to type the children prop
}

export const VisibilityProvider: React.FC<VisibilityProviderProps> = ({ children }) => { // Use the typed props here
 const [chatHistoryVisible, setChatHistoryVisible] = useState(true);

 const toggleChatHistoryVisibility = () => {
    setChatHistoryVisible((prevVisibility) => !prevVisibility);
 };

 return (
    <VisibilityContext.Provider value={{ chatHistoryVisible, toggleChatHistoryVisibility }}>
      {children}
    </VisibilityContext.Provider>
 );
};