import React, {createContext, useContext, useState, useRef} from 'react';
import {useInput, useApp} from 'ink';
import {
  VIEW,
  CLIENT,
  PROJECTS,
  TASKS,
  mapViewsToNum,
  componentTitles,
} from '../consts.js';

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
  const [mode, setMode] = useState('normal'); // 'normal' or 'insert'
  const {exit} = useApp();
  const componentKeyHandlers = useRef(new Map());

  useInput((input, key) => {
    // Global vim-like mode switching (always works)
    if (key.escape) {
      setMode('normal');
      return;
    }

    if (input === 'i') {
      setMode('insert');
      return;
    }

    if (input === 'q' && mode === 'normal') exit();

    // All other keys only work in normal mode
    if (mode !== 'normal') return;

    // Navigation keys (normal mode only)
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

    // Component-specific handlers (normal mode only)
    const currentHandler = componentKeyHandlers.current.get(focusedSection);
    if (currentHandler && currentHandler[input]) {
      currentHandler[input]();
      return;
    }
  });

  const registerKeyHandler = (componentId, keyHandler) => {
    componentKeyHandlers.current.set(componentId, keyHandler);
  };

  const unregisterKeyHandler = componentId => {
    componentKeyHandlers.current.delete(componentId);
  };

  const getBorderTitle = componentName => {
    const navKey = mapViewsToNum[componentName];
    const title = componentTitles[componentName];
    return `[${navKey}] ${title}`;
  };

  const value = {
    focusedSection,
    currentView: mapViewsToNum[focusedSection],
    isViewFocused: focusedSection === VIEW,
    isClientFocused: focusedSection === CLIENT,
    isProjectsFocused: focusedSection === PROJECTS,
    isTasksFocused: focusedSection === TASKS,
    mode,
    setMode,
    registerKeyHandler,
    unregisterKeyHandler,
    getBorderTitle,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
