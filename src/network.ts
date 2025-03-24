// Define enum for task status
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  STAGED = 'STAGED'
}

// Define types for task
export interface Task {
  id?: number;
  title: string;
  description?: string;
  status?: TaskStatus;
}

// API base URL
const API_BASE_URL = 'http://localhost:3001';

/**
 * Creates a new task via the API
 * @param task The task data to create
 * @returns The created task with ID
 */
export async function postTask(task: Task): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/task`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create task');
  }

  return response.json();
}
