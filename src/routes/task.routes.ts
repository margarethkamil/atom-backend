import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateBody, validators } from '../middlewares/validation.middleware';
import { CreateTaskDto, UpdateTaskDto } from '../models/task.model';

// Create router instance
const router = Router();
const taskController = new TaskController();

/**
 * Task routes
 * Prefix: /tasks
 * All routes are protected by authentication middleware
 */
router.use(authMiddleware);

/**
 * @route   GET /tasks
 * @desc    Get all tasks for the authenticated user
 * @access  Private
 */
router.get('/', taskController.getAllTasks);

/**
 * @route   GET /tasks/:id
 * @desc    Get a specific task by ID
 * @access  Private
 */
router.get('/:id', taskController.getTaskById);

/**
 * @route   POST /tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post(
  '/',
  validateBody<CreateTaskDto>({
    title: validators.required('Title'),
    description: validators.required('Description')
    // Priority, dueDate, and tags are optional so we don't validate them explicitly
    // The middleware will allow any fields defined in the DTO
  }),
  taskController.createTask
);

/**
 * @route   PUT /tasks/:id
 * @desc    Update an existing task
 * @access  Private
 */
router.put('/:id', taskController.updateTask);

/**
 * @route   DELETE /tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
router.delete('/:id', taskController.deleteTask);

export default router; 