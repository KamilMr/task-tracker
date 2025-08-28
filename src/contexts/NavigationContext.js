import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from 'react';
import {useInput, useApp} from 'ink';
import {
  VIEW,
  CLIENT,
  PROJECTS,
  TASKS,
  mapViewsToNum,
  componentTitles,
} from '../consts.js';
import clientService from '../services/clientService.js';
import projectService from '../services/projectService.js';
import taskService from '../services/taskService.js';

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

  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [reload, setReload] = useState();

  const {exit} = useApp();
  const componentKeyHandlers = useRef(new Map());

  const handleReload = () => {
    setTimeout(() => {
      setReload(!reload);
    }, 500);
  };

  // Load clients on mount
  useEffect(() => {
    const loadClients = async () => {
      try {
        const clientData = await clientService.selectAll();
        setClients(clientData);
        if (clientData.length > 0) {
          setSelectedClientId(clientData[0].id);
        }
      } catch (error) {
        console.error('Failed to load clients:', error);
      }
    };
    loadClients();
  }, []);

  // Load projects when selected client changes
  useEffect(() => {
    const loadProjects = async () => {
      if (selectedClientId) {
        try {
          const projectData =
            await projectService.selectByCliId(selectedClientId);
          setProjects(projectData);
          if (projectData.length > 0) {
            setSelectedProjectId(projectData[0].id);
          } else {
            setSelectedProjectId(null);
          }
        } catch (error) {
          console.error('Failed to load projects:', error);
        }
      } else {
        setProjects([]);
        setSelectedProjectId(null);
      }
    };
    loadProjects();
  }, [selectedClientId]);

  // Load tasks when selected project changes
  // useEffect(() => {
  //   const loadTasks = async () => {
  //     if (selectedProjectId) {
  //       try {
  //         const taskData =
  //           await taskService.getAllTasksFromToday(selectedProjectId);
  //         setTasks(taskData);
  //         if (taskData.length > 0) {
  //           setSelectedTaskId(taskData[0].id);
  //         } else {
  //           setSelectedTaskId(null);
  //         }
  //       } catch (error) {
  //         console.error('Failed to load tasks:', error);
  //       }
  //     } else {
  //       setTasks([]);
  //       setSelectedTaskId(null);
  //     }
  //   };
  //   loadTasks();
  // }, [selectedProjectId]);

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

  const getSelectedClient = () => {
    return clients.find(client => client.id === selectedClientId) || null;
  };

  const selectNextClient = () => {
    const currentIndex = clients.findIndex(
      client => client.id === selectedClientId,
    );
    const nextIndex = currentIndex < clients.length - 1 ? currentIndex + 1 : 0;
    if (clients[nextIndex]) {
      setSelectedClientId(clients[nextIndex].id);
    }
  };

  const selectPreviousClient = () => {
    const currentIndex = clients.findIndex(
      client => client.id === selectedClientId,
    );
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : clients.length - 1;
    if (clients[prevIndex]) {
      setSelectedClientId(clients[prevIndex].id);
    }
  };

  const reloadClients = async () => {
    try {
      const clientData = await clientService.selectAll();
      setClients(clientData);
      if (clientData.length > 0 && !selectedClientId) {
        setSelectedClientId(clientData[0].id);
      }
    } catch (error) {
      console.error('Failed to reload clients:', error);
    }
  };

  const getSelectedProject = () => {
    return projects.find(project => project.id === selectedProjectId) || null;
  };

  const selectNextProject = () => {
    const currentIndex = projects.findIndex(
      project => project.id === selectedProjectId,
    );
    const nextIndex = currentIndex < projects.length - 1 ? currentIndex + 1 : 0;
    if (projects[nextIndex]) {
      setSelectedProjectId(projects[nextIndex].id);
    }
  };

  const selectPreviousProject = () => {
    const currentIndex = projects.findIndex(
      project => project.id === selectedProjectId,
    );
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : projects.length - 1;
    if (projects[prevIndex]) {
      setSelectedProjectId(projects[prevIndex].id);
    }
  };

  const reloadProjects = async () => {
    if (selectedClientId) {
      try {
        const projectData =
          await projectService.selectByCliId(selectedClientId);
        setProjects(projectData);
        if (projectData.length > 0 && !selectedProjectId) {
          setSelectedProjectId(projectData[0].id);
        }
      } catch (error) {
        console.error('Failed to reload projects:', error);
      }
    }
  };

  // const getSelectedTask = () => {
  //   return tasks.find(task => task.id === selectedTaskId) || null;
  // };

  // const selectNextTask = () => {
  //   const currentIndex = tasks.findIndex(task => task.id === selectedTaskId);
  //   const nextIndex = currentIndex < tasks.length - 1 ? currentIndex + 1 : 0;
  //   if (tasks[nextIndex]) {
  //     setSelectedTaskId(tasks[nextIndex].id);
  //   }
  // };
  //
  // const selectPreviousTask = () => {
  //   const currentIndex = tasks.findIndex(task => task.id === selectedTaskId);
  //   const prevIndex = currentIndex > 0 ? currentIndex - 1 : tasks.length - 1;
  //   if (tasks[prevIndex]) {
  //     setSelectedTaskId(tasks[prevIndex].id);
  //   }
  // };

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
    clients,
    selectedClientId,
    getSelectedClient,
    selectNextClient,
    selectPreviousClient,
    setSelectedClientId,
    reloadClients,
    projects,
    selectedProjectId,
    getSelectedProject,
    selectNextProject,
    selectPreviousProject,
    setSelectedProjectId,
    reloadProjects,
    selectedTaskId,
    setSelectedTaskId,
    reload,
    setReload: handleReload,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
