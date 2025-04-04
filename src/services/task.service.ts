import { db } from '../config/firebase-config';
import { Task, CreateTaskDto, UpdateTaskDto } from '../models/task.model';

/**
 * Service responsible for task-related operations
 * Implements repository pattern for task data access
 */
export class TaskService {
  private readonly taskCollection = 'tasks';

  /**
   * Get all tasks for a specific user
   * @param userId - The ID of the user whose tasks to retrieve
   * @returns A Promise that resolves to an array of tasks
   */
  async getAllTasks(userId: string): Promise<Task[]> {
    try {
      const tasksSnapshot = await db
        .collection(this.taskCollection)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

      return tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      } as Task));
    } catch (error) {
      console.error('Error getting tasks:', error);
      throw new Error('Failed to retrieve tasks');
    }
  }

  /**
   * Get a specific task by ID
   * @param taskId - The ID of the task to retrieve
   * @param userId - The ID of the user who owns the task
   * @returns A Promise that resolves to the found task or null if not found
   */
  async getTaskById(taskId: string, userId: string): Promise<Task | null> {
    try {
      const taskDoc = await db.collection(this.taskCollection).doc(taskId).get();
      
      if (!taskDoc.exists) {
        return null;
      }
      
      const taskData = taskDoc.data() as any;
      
      // Verify that the task belongs to the user
      if (taskData.userId !== userId) {
        return null;
      }
      
      return {
        id: taskDoc.id,
        title: taskData.title,
        description: taskData.description,
        completed: taskData.completed,
        userId: taskData.userId,
        createdAt: taskData.createdAt.toDate()
      };
    } catch (error) {
      console.error('Error getting task by ID:', error);
      throw new Error('Failed to retrieve task');
    }
  }

  /**
   * Create a new task for a user
   * @param taskData - The task data to create
   * @param userId - The ID of the user who owns the task
   * @returns A Promise that resolves to the created task
   */
  async createTask(taskData: CreateTaskDto, userId: string): Promise<Task> {
    try {
      const newTask: Task = {
        title: taskData.title,
        description: taskData.description,
        completed: false,
        createdAt: new Date(),
        userId
      };

      const docRef = await db.collection(this.taskCollection).add(newTask);
      
      return {
        id: docRef.id,
        ...newTask
      };
    } catch (error) {
      console.error('Error creating task:', error);
      throw new Error('Failed to create task');
    }
  }

  /**
   * Update an existing task
   * @param taskId - The ID of the task to update
   * @param taskData - The task data to update
   * @param userId - The ID of the user who owns the task
   * @returns A Promise that resolves to the updated task
   */
  async updateTask(taskId: string, taskData: UpdateTaskDto, userId: string): Promise<Task> {
    try {
      // First check if the task exists and belongs to the user
      const existingTask = await this.getTaskById(taskId, userId);
      
      if (!existingTask) {
        throw new Error('Task not found or unauthorized access');
      }

      // Create the update data object
      const updateData: Partial<Task> = {};
      
      if (taskData.title !== undefined) updateData.title = taskData.title;
      if (taskData.description !== undefined) updateData.description = taskData.description;
      if (taskData.completed !== undefined) updateData.completed = taskData.completed;

      // Update the task in Firestore
      await db.collection(this.taskCollection).doc(taskId).update(updateData);
      
      // Return the updated task
      return {
        ...existingTask,
        ...updateData
      };
    } catch (error) {
      console.error('Error updating task:', error);
      throw new Error('Failed to update task');
    }
  }

  /**
   * Delete a task
   * @param taskId - The ID of the task to delete
   * @param userId - The ID of the user who owns the task
   * @returns A Promise that resolves when the task is deleted
   */
  async deleteTask(taskId: string, userId: string): Promise<void> {
    try {
      // First check if the task exists and belongs to the user
      const existingTask = await this.getTaskById(taskId, userId);
      
      if (!existingTask) {
        throw new Error('Task not found or unauthorized access');
      }

      // Delete the task
      await db.collection(this.taskCollection).doc(taskId).delete();
    } catch (error) {
      console.error('Error deleting task:', error);
      throw new Error('Failed to delete task');
    }
  }
} 