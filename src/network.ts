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
 * Fetches all tasks from the API
 * @returns Array of tasks
 */
export async function getTasks(): Promise<Task[]> {
  const response = await fetch(`${API_BASE_URL}/task`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch tasks');
  }

  return response.json();
}

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

/**
 * Deletes a task by ID
 * @param id The ID of the task to delete
 * @returns Object indicating if task was deleted and the deleted task data
 */
export async function deleteTask(id: number | string): Promise<{ deleted: boolean, task: Task }> {
  const response = await fetch(`${API_BASE_URL}/task/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete task');
  }

  return response.json();
}

/**
 * Updates an existing task via the API
 * @param id The ID of the task to update
 * @param updates Partial task data with fields to update
 * @returns The updated task
 */
export async function updateTask(id: number | string, updates: Partial<Task>): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/task/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update task');
  }

  return response.json();
}
