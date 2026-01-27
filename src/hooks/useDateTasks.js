import {useState, useEffect} from 'react';
import taskService from '../services/taskService.js';
import {useData} from '../contexts/DataContext.js';

const useDateTasks = selectedDate => {
  const {selectedProjectId, reload} = useData();
  const [dateTasks, setDateTasks] = useState([]);

  useEffect(() => {
    const loadDateTasks = async () => {
      if (selectedProjectId) {
        try {
          const allTasks = await taskService.getAllTasksFromToday(
            selectedDate,
            selectedProjectId,
          );
          const projectTasks = allTasks.filter(
            task => task.projectId === selectedProjectId,
          );
          setDateTasks(projectTasks);
        } catch (error) {
          console.error('Error loading date tasks:', error);
          setDateTasks([]);
        }
      } else setDateTasks([]);
    };
    loadDateTasks();
  }, [selectedDate, selectedProjectId, reload]);

  return dateTasks;
};

export default useDateTasks;
