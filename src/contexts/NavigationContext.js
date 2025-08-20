import React, {createContext, useContext, useState} from 'react';
import {useInput, useApp} from 'ink';
import {VIEW, CLIENT, PROJECTS, TASKS, mapViewsToNum} from '../consts.js';

const NavigationContext = createContext();

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};

export const NavigationProvider = ({children}) => {
  const [focusedSection, setFocusedSection] = useState(CLIENT);
  const {exit} = useApp();

  useInput((input, key) => {
    if (input === 'q') {
      exit();
    }

    if (key.tab) {
      const sections = [VIEW, CLIENT, PROJECTS, TASKS];
      const currentIndex = sections.indexOf(focusedSection);
      const nextIndex = (currentIndex + 1) % sections.length;
      setFocusedSection(sections[nextIndex]);
    }

    if (input === '0') {
      setFocusedSection(VIEW);
    }

    if (input === '1') {
      setFocusedSection(CLIENT);
    }

    if (input === '2') {
      setFocusedSection(PROJECTS);
    }

    if (input === '3') {
      setFocusedSection(TASKS);
    }
  });

  const value = {
    focusedSection,
    currentView: mapViewsToNum[focusedSection],
    isViewFocused: focusedSection === VIEW,
    isClientFocused: focusedSection === CLIENT,
    isProjectsFocused: focusedSection === PROJECTS,
    isTasksFocused: focusedSection === TASKS,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
