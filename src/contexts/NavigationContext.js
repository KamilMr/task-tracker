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
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const {exit} = useApp();
  const componentKeyHandlers = useRef(new Map());

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

  // Load active task on mount
  useEffect(() => {
    const loadActiveTask = async () => {
      try {
        const activeTaskData = await taskService.selectActiveTask();
        setActiveTask(activeTaskData);
      } catch (error) {
        console.error('Failed to load active task:', error);
      }
    };
    loadActiveTask();
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
  useEffect(() => {
    const loadTasks = async () => {
      if (selectedProjectId) {
        try {
          const taskData =
            await taskService.selectByProjectId(selectedProjectId);
          setTasks(taskData);
          if (taskData.length > 0) {
            setSelectedTaskId(taskData[0].id);
          } else {
            setSelectedTaskId(null);
          }
        } catch (error) {
          console.error('Failed to load tasks:', error);
        }
      } else {
        setTasks([]);
        setSelectedTaskId(null);
      }
    };
    loadTasks();
  }, [selectedProjectId]);

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

  const getSelectedTask = () => {
    return tasks.find(task => task.id === selectedTaskId) || null;
  };

  const selectNextTask = () => {
    const currentIndex = tasks.findIndex(task => task.id === selectedTaskId);
    const nextIndex = currentIndex < tasks.length - 1 ? currentIndex + 1 : 0;
    if (tasks[nextIndex]) {
      setSelectedTaskId(tasks[nextIndex].id);
    }
  };

  const selectPreviousTask = () => {
    const currentIndex = tasks.findIndex(task => task.id === selectedTaskId);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : tasks.length - 1;
    if (tasks[prevIndex]) {
      setSelectedTaskId(tasks[prevIndex].id);
    }
  };

  const reloadTasks = async () => {
    if (selectedProjectId) {
      try {
        const taskData = await taskService.selectByProjectId(selectedProjectId);
        setTasks(taskData);
        if (taskData.length > 0 && !selectedTaskId) {
          setSelectedTaskId(taskData[0].id);
        }
      } catch (error) {
        console.error('Failed to reload tasks:', error);
      }
    }
  };

  const startTask = async taskIdOrData => {
    try {
      // Stop any currently active task first
      if (activeTask) {
        await taskService.endTask({id: activeTask.id});
      }

      let taskData;
      if (typeof taskIdOrData === 'object') {
        // Direct task data provided
        taskData = taskIdOrData;
      } else {
        // Task ID provided, get task data
        const task = tasks.find(t => t.id === taskIdOrData);
        if (!task) {
          throw new Error('Task not found');
        }
        taskData = {
          title: task.title,
          projectId: task.project_id,
        };
      }

      // Start the new task
      const newTaskId = await taskService.startTask(taskData);

      // Reload active task
      const activeTaskData = await taskService.selectActiveTask();
      setActiveTask(activeTaskData);

      // Reload tasks to show updated state
      await reloadTasks();

      return true;
    } catch (error) {
      console.error('Failed to start task:', error);
      throw error;
    }
  };

  const stopTask = async () => {
    try {
      if (!activeTask) {
        throw new Error('No active task to stop');
      }

      await taskService.endTask({id: activeTask.id});
      setActiveTask(null);

      // Reload tasks to show updated state
      await reloadTasks();

      return true;
    } catch (error) {
      console.error('Failed to stop task:', error);
      throw error;
    }
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
    tasks,
    selectedTaskId,
    getSelectedTask,
    selectNextTask,
    selectPreviousTask,
    setSelectedTaskId,
    reloadTasks,
    activeTask,
    startTask,
    stopTask,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
