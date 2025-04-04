import { Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { CreateTaskDto, UpdateTaskDto } from '../models/task.model';
import { ApiError } from '../middlewares/error.middleware';

/**
 * Controller handling task-related requests
 */
export class TaskController {
  private taskService: TaskService;

  /**
   * Initialize the controller with dependencies
   */
  constructor() {
    this.taskService = new TaskService();
  }

  /**
   * Get all tasks for the authenticated user
   */
  getAllTasks = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId;
      
      if (!userId) {
        next(new ApiError(401, 'User ID not found in request'));
        return;
      }

      // Get all tasks for the user
      const tasks = await this.taskService.getAllTasks(userId);
      
      // Return success response with tasks
      res.status(200).json({
        status: 'success',
        data: {
          tasks
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get a specific task by ID
   */
  getTaskById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId;
      const taskId = req.params.id;
      
      if (!userId) {
        next(new ApiError(401, 'User ID not found in request'));
        return;
      }

      if (!taskId) {
        next(new ApiError(400, 'Task ID is required'));
        return;
      }

      // Get the task by ID
      const task = await this.taskService.getTaskById(taskId, userId);
      
      if (!task) {
        next(new ApiError(404, 'Task not found'));
        return;
      }

      // Return success response with task
      res.status(200).json({
        status: 'success',
        data: {
          task
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a new task
   */
  createTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId;
      const taskData = req.body as CreateTaskDto;
      
      if (!userId) {
        next(new ApiError(401, 'User ID not found in request'));
        return;
      }

      // Validate request data
      if (!taskData.title) {
        next(new ApiError(400, 'Task title is required'));
        return;
      }

      // Create the task
      const newTask = await this.taskService.createTask(taskData, userId);
      
      // Return success response with created task
      res.status(201).json({
        status: 'success',
        message: 'Task created successfully',
        data: {
          task: newTask
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update an existing task
   */
  updateTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId;
      const taskId = req.params.id;
      const taskData = req.body as UpdateTaskDto;
      
      if (!userId) {
        next(new ApiError(401, 'User ID not found in request'));
        return;
      }

      if (!taskId) {
        next(new ApiError(400, 'Task ID is required'));
        return;
      }

      // Validate that at least one field is being updated
      if (Object.keys(taskData).length === 0) {
        next(new ApiError(400, 'No update data provided'));
        return;
      }

      // Update the task
      const updatedTask = await this.taskService.updateTask(taskId, taskData, userId);
      
      // Return success response with updated task
      res.status(200).json({
        status: 'success',
        message: 'Task updated successfully',
        data: {
          task: updatedTask
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a task
   */
  deleteTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId;
      const taskId = req.params.id;
      
      if (!userId) {
        next(new ApiError(401, 'User ID not found in request'));
        return;
      }

      if (!taskId) {
        next(new ApiError(400, 'Task ID is required'));
        return;
      }

      // Delete the task
      await this.taskService.deleteTask(taskId, userId);
      
      // Return success response
      res.status(200).json({
        status: 'success',
        message: 'Task deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };
} 