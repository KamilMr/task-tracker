import {useEffect} from 'react';
import {useNavigation} from '../contexts/NavigationContext.js';

export const useComponentKeys = (componentId, keyMappings, isFocused) => {
  const {registerKeyHandler, unregisterKeyHandler} = useNavigation();

  useEffect(() => {
    if (isFocused && keyMappings) {
      // Convert array of key mappings to object for quick lookup
      const handlerMap = {};
      keyMappings.forEach(mapping => {
        handlerMap[mapping.key] = mapping.action;
      });

      registerKeyHandler(componentId, handlerMap);
    } else {
      unregisterKeyHandler(componentId);
    }

    // Cleanup on unmount or when focus changes
    return () => {
      unregisterKeyHandler(componentId);
    };
  }, [
    componentId,
    keyMappings,
    isFocused,
    registerKeyHandler,
    unregisterKeyHandler,
  ]);
};
