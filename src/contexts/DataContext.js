import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};

export const DataProvider = ({children}) => {
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [reload, setReload] = useState(0);

  const triggerReload = useCallback(() => {
    setReload(r => r + 1);
  }, []);

  useEffect(() => {
    setSelectedProjectId(null);
  }, [selectedClientId]);

  useEffect(() => {
    setSelectedTaskId(null);
  }, [selectedProjectId]);

  const value = {
    selectedClientId,
    setSelectedClientId,
    selectedProjectId,
    setSelectedProjectId,
    selectedTaskId,
    setSelectedTaskId,
    reload,
    triggerReload,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
