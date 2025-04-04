/**
 * Interface representing a Task entity
 * Contains all information related to a user's task
 */
export interface Task {
  id?: string;          // Optional as it will be assigned by Firestore
  title: string;        // Task title
  description: string;  // Detailed description of the task
  completed: boolean;   // Task completion status
  createdAt: Date;      // Timestamp of task creation
  userId: string;       // Reference to the user who owns this task
}

/**
 * Interface for task creation request data
 */
export interface CreateTaskDto {
  title: string;
  description: string;
}

/**
 * Interface for task update request data
 */
export interface UpdateTaskDto {
  title?: string;
  description?: string;
  completed?: boolean;
} 