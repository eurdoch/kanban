import { useState, useEffect } from 'react'
import { getTasks, postTask, deleteTask, updateTask, Task as NetworkTask, TaskStatus } from './network'

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  status: TaskStatus;
}

function App() {
  const [columns, setColumns] = useState<Column[]>([
    { id: 'todo', title: 'To Do', tasks: [], status: TaskStatus.TODO },
    { id: 'inprogress', title: 'In Progress', tasks: [], status: TaskStatus.IN_PROGRESS },
    { id: 'completed', title: 'Completed', tasks: [], status: TaskStatus.COMPLETED },
    { id: 'staged', title: 'Staged', tasks: [], status: TaskStatus.STAGED }
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [_isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch tasks on component mount and set up refresh interval
  useEffect(() => {
    // Initial fetch with loading state
    fetchTasks(true);
    
    // Set up interval for automatic refresh every second (without loading state)
    const intervalId = setInterval(() => {
      fetchTasks(false);
    }, 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);
  
  // Function to fetch all tasks and organize by status
  const fetchTasks = async (showLoadingState = false) => {
    if (showLoadingState) {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      const tasks = await getTasks();
      
      // Create a new columns array with empty tasks
      const updatedColumns = columns.map(column => ({
        ...column,
        tasks: [] as Task[]
      }));
      
      // Distribute tasks to appropriate columns based on status
      tasks.forEach(task => {
        const columnIndex = updatedColumns.findIndex(col => col.status === task.status);
        
        if (columnIndex !== -1) {
          updatedColumns[columnIndex].tasks.push({
            id: String(task.id),
            title: task.title,
            description: task.description || '',
            status: task.status as TaskStatus
          });
        }
      });
      
      setColumns(updatedColumns);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError('Connection error. Auto-refresh is active and will continue trying.');
    } finally {
      if (showLoadingState) {
        setIsLoading(false);
      }
    }
  };

  const addTask = async () => {
    if (newTaskTitle.trim() === '') return;
    
    try {
      // Create task data to send to API
      const taskData: NetworkTask = {
        title: newTaskTitle,
        description: newTaskDescription,
        status: TaskStatus.TODO
      };
      
      // Post to API and get response with ID
      const createdTask = await postTask(taskData);
      
      // Create local task with the returned data
      const newTask: Task = {
        id: String(createdTask.id),
        title: createdTask.title,
        description: createdTask.description || '',
        status: createdTask.status as TaskStatus
      };
      
      // Update UI
      const updatedColumns = [...columns];
      const todoColumnIndex = updatedColumns.findIndex(col => col.status === TaskStatus.TODO);
      updatedColumns[todoColumnIndex].tasks.push(newTask);
      
      setColumns(updatedColumns);
      setNewTaskTitle('');
      setNewTaskDescription('');
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task. Please try again.');
    }
  };

  const moveTask = async (taskId: string, sourceColumnId: string, destinationColumnId: string) => {
    try {
      const updatedColumns = [...columns];
      
      const sourceColumnIndex = updatedColumns.findIndex(col => col.id === sourceColumnId);
      const destinationColumnIndex = updatedColumns.findIndex(col => col.id === destinationColumnId);
      const destinationStatus = updatedColumns[destinationColumnIndex].status;
      
      const taskIndex = updatedColumns[sourceColumnIndex].tasks.findIndex(task => task.id === taskId);
      const task = updatedColumns[sourceColumnIndex].tasks[taskIndex];
      
      // Update the task in the API
      const updatedTask = await updateTask(taskId, {
        status: destinationStatus
      });
      
      // Remove task from source column
      updatedColumns[sourceColumnIndex].tasks.splice(taskIndex, 1);
      
      // Add updated task to destination column
      updatedColumns[destinationColumnIndex].tasks.push({
        ...task,
        status: updatedTask.status as TaskStatus
      });
      
      setColumns(updatedColumns);
    } catch (error) {
      console.error('Failed to move task:', error);
      alert('Failed to update task status. Please try again.');
      
      // Refresh tasks to ensure UI is in sync with backend
      fetchTasks(true);
    }
  };
  
  const removeTask = async (taskId: string, columnId: string) => {
    try {
      // Remove from API
      await deleteTask(taskId);
      
      // Remove from local state
      const updatedColumns = [...columns];
      const columnIndex = updatedColumns.findIndex(col => col.id === columnId);
      
      if (columnIndex >= 0) {
        const taskIndex = updatedColumns[columnIndex].tasks.findIndex(task => task.id === taskId);
        if (taskIndex >= 0) {
          updatedColumns[columnIndex].tasks.splice(taskIndex, 1);
          setColumns(updatedColumns);
        }
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  return (
    <div className="kanban-container">
      <h1>Kanban Board</h1>
      
      <div className="task-form">
        <input
          type="text"
          placeholder="Task title"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
        />
        <textarea
          placeholder="Task description"
          value={newTaskDescription}
          onChange={(e) => setNewTaskDescription(e.target.value)}
        />
        <button onClick={() => addTask()}>Add Task</button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="kanban-board">
        {columns.map(column => (
          <div key={column.id} className="kanban-column">
            <h2>{column.title}</h2>
            <div className="task-list">
              {column.tasks.map(task => (
                <div key={task.id} className="task-card">
                  <div className="task-header">
                    <h3>{task.title}</h3>
                    <button 
                      className="delete-button"
                      onClick={() => removeTask(task.id, column.id)}
                      title="Delete task"
                    >
                      ×
                    </button>
                  </div>
                  <p>{task.description}</p>
                  <div className="task-actions">
                    {column.id !== 'todo' && (
                      <button onClick={() => moveTask(task.id, column.id, 'todo')}>
                        Move to To Do
                      </button>
                    )}
                    {column.id !== 'inprogress' && (
                      <button onClick={() => moveTask(task.id, column.id, 'inprogress')}>
                        Move to In Progress
                      </button>
                    )}
                    {column.id !== 'completed' && (
                      <button onClick={() => moveTask(task.id, column.id, 'completed')}>
                        Move to Completed
                      </button>
                    )}
                    {column.id !== 'staged' && (
                      <button onClick={() => moveTask(task.id, column.id, 'staged')}>
                        Move to Staged
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <style>{`
        .kanban-container {
          padding: 20px;
          height: 100vh;
          width: 100vw;
          box-sizing: border-box;
          font-family: Arial, sans-serif;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        
        h1 {
          text-align: center;
          margin-bottom: 15px;
          color: #333;
          flex-shrink: 0;
        }
        
        .task-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 500px;
          margin: 0 auto 20px;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          flex-shrink: 0;
        }
        
        .task-form input, .task-form textarea {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .task-form textarea {
          min-height: 60px;
          resize: vertical;
        }
        
        .task-form button {
          padding: 10px;
          background-color: #4f6df5;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .task-form button:hover {
          background-color: #3a56d3;
        }
        
        .kanban-board {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          flex: 1;
          overflow: hidden;
        }
        
        .kanban-column {
          background-color: #f1f3f5;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow-y: auto;
        }
        
        .kanban-column h2 {
          text-align: center;
          padding-bottom: 10px;
          margin-bottom: 15px;
          border-bottom: 2px solid #ddd;
          color: #333;
        }
        
        .task-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
          flex: 1;
          overflow-y: auto;
        }
        
        .task-card {
          background-color: white;
          border-radius: 6px;
          padding: 15px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .task-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
        }
        
        .task-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
        }
        
        .task-card h3 {
          margin: 0;
          color: #444;
          flex: 1;
        }
        
        .delete-button {
          background: none;
          border: none;
          color: #999;
          font-size: 20px;
          font-weight: bold;
          cursor: pointer;
          width: 24px;
          height: 24px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          margin-left: 8px;
          transition: all 0.2s;
          line-height: 1;
        }
        
        .delete-button:hover {
          background-color: #ff4d4f;
          color: white;
        }
        
        .task-card p {
          margin: 0 0 15px;
          color: #666;
          font-size: 14px;
        }
        
        .task-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .task-actions button {
          padding: 6px 10px;
          background-color: #e9ecef;
          color: #495057;
          border: none;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .task-actions button:hover {
          background-color: #dee2e6;
        }
        
        .error-message {
          background-color: #ffebee;
          color: #d32f2f;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 15px;
          text-align: center;
          border-left: 4px solid #d32f2f;
        }
        
        .task-form button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }
        
        @media (max-width: 900px) {
          .kanban-board {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 600px) {
          .kanban-board {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default App
