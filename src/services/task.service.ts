import { db } from '../config/firebase-config';
import { Task, CreateTaskDto, UpdateTaskDto } from '../models/task.model';
import { firestore } from 'firebase-admin';

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

      return tasksSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          completed: data.completed,
          userId: data.userId,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
          priority: data.priority,
          dueDate: data.dueDate?.toDate ? data.dueDate.toDate() : data.dueDate,
          tags: data.tags || []
        } as Task;
      });
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
        createdAt: taskData.createdAt?.toDate ? taskData.createdAt.toDate() : taskData.createdAt,
        updatedAt: taskData.updatedAt?.toDate ? taskData.updatedAt.toDate() : taskData.updatedAt,
        priority: taskData.priority,
        dueDate: taskData.dueDate?.toDate ? taskData.dueDate.toDate() : taskData.dueDate,
        tags: taskData.tags || []
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
      // Process dueDate if provided
      let dueDate = null;
      if (taskData.dueDate) {
        // If dueDate is a string, convert to Date object
        dueDate = typeof taskData.dueDate === 'string' 
          ? new Date(taskData.dueDate) 
          : taskData.dueDate;
      }

      // Process tags - ensure it's an array
      const tags = Array.isArray(taskData.tags) ? taskData.tags : [];

      // Create the new task object
      const newTask: Task = {
        title: taskData.title,
        description: taskData.description,
        completed: false,
        createdAt: firestore.Timestamp.now(),
        updatedAt: firestore.Timestamp.now(),
        userId,
        priority: taskData.priority || 'medium', // Default to medium priority
        dueDate: dueDate ? firestore.Timestamp.fromDate(dueDate) : null,
        tags
      };

      const docRef = await db.collection(this.taskCollection).add(newTask);
      
      // Convert Firestore Timestamps back to Date objects for the response
      return {
        id: docRef.id,
        ...newTask,
        createdAt: newTask.createdAt.toDate(),
        updatedAt: newTask.updatedAt.toDate(),
        dueDate: newTask.dueDate ? newTask.dueDate.toDate() : null
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
      const updateData: Partial<Task> = {
        updatedAt: firestore.Timestamp.now()
      };
      
      // Update basic fields if provided
      if (taskData.title !== undefined) updateData.title = taskData.title;
      if (taskData.description !== undefined) updateData.description = taskData.description;
      if (taskData.completed !== undefined) updateData.completed = taskData.completed;
      if (taskData.priority !== undefined) updateData.priority = taskData.priority;
      
      // Process dueDate if provided
      if (taskData.dueDate !== undefined) {
        if (taskData.dueDate === null) {
          updateData.dueDate = null;
        } else {
          // Convert string to Date if needed
          const dueDate = typeof taskData.dueDate === 'string' 
            ? new Date(taskData.dueDate) 
            : taskData.dueDate;
          updateData.dueDate = firestore.Timestamp.fromDate(dueDate);
        }
      }
      
      // Process tags if provided
      if (taskData.tags !== undefined) {
        updateData.tags = Array.isArray(taskData.tags) ? taskData.tags : [];
      }

      // Update the task in Firestore
      await db.collection(this.taskCollection).doc(taskId).update(updateData);
      
      // Get the updated task to return
      const updatedTask = await this.getTaskById(taskId, userId);
      if (!updatedTask) {
        throw new Error('Failed to retrieve updated task');
      }
      
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      throw new Error('Failed to update task');
    }
  }

  /**
   * Delete a task
   * @param taskId - The ID of the task to delete
   * @param userId - The ID of the user who owns the task
   */
  async deleteTask(taskId: string, userId: string): Promise<void> {
    try {
      // First check if the task exists and belongs to the user
      const existingTask = await this.getTaskById(taskId, userId);
      
      if (!existingTask) {
        throw new Error('Task not found or unauthorized access');
      }

      // Delete the task from Firestore
      await db.collection(this.taskCollection).doc(taskId).delete();
    } catch (error) {
      console.error('Error deleting task:', error);
      throw new Error('Failed to delete task');
    }
  }
} 