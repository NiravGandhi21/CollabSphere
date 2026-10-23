import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/project.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// GET  /api/projects            ?search=&tech=&openOnly=true
router.get('/', getProjects);

// GET  /api/projects/:id
router.get('/:id', getProjectById);

// POST /api/projects            (auth required)
router.post('/', protect, createProject);

// PUT  /api/projects/:id        (auth required — creator only)
router.put('/:id', protect, updateProject);

// DELETE /api/projects/:id      (auth required — creator only)
router.delete('/:id', protect, deleteProject);

export default router;
