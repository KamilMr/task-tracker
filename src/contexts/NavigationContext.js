import React, {createContext, useContext, useState} from 'react';
import {useInput, useApp} from 'ink';
import {COMMANDS, SUMMARY, mapViewsToNum} from '../consts.js';

const NavigationContext = createContext();

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};

export const NavigationProvider = ({children}) => {
  const [focusedSection, setFocusedSection] = useState(COMMANDS);
  const {exit} = useApp();

  useInput((input, key) => {
    if (input === 'q') {
      exit();
    }
    
    if (key.tab) {
      setFocusedSection(prev => prev === COMMANDS ? SUMMARY : COMMANDS);
    }

    if (input === '1') {
      setFocusedSection(COMMANDS);
    }

    if (input === '2') {
      setFocusedSection(SUMMARY);
    }
  });

  const value = {
    focusedSection,
    currentView: mapViewsToNum[focusedSection],
    isCommandsFocused: focusedSection === COMMANDS,
    isSummaryFocused: focusedSection === SUMMARY
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
