/**
 * Interface representing a Task entity
 * Contains all information related to a user's task
 */
export interface Task {
  id?: string;          // Optional as it will be assigned by Firestore
  title: string;        // Task title
  description: string;  // Detailed description of the task
  completed: boolean;   // Task completion status
  createdAt: any;       // Timestamp of task creation
  updatedAt?: any;      // Timestamp of last update
  userId: string;       // Reference to the user who owns this task
  priority?: string;    // Task priority: 'low', 'medium', 'high'
  dueDate?: any;        // Due date for the task
  tags?: string[];      // Array of tags associated with the task
}

/**
 * Interface for task creation request data
 */
export interface CreateTaskDto {
  title: string;
  description: string;
  priority?: string;
  dueDate?: string | Date;
  tags?: string[];
}

/**
 * Interface for task update request data
 */
export interface UpdateTaskDto {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: string;
  dueDate?: string | Date;
  tags?: string[];
} 