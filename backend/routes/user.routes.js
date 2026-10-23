import { Router } from 'express';
import { getUsers, getUserById, updateProfile } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// GET  /api/users               ?search=&skill=&department=
router.get('/', getUsers);

// PUT  /api/users/profile/me    (convenience alias for authenticated user)
router.put('/profile/me', protect, (req, res, next) => {
  req.params.id = req.user.id;
  updateProfile(req, res, next);
});

// GET  /api/users/:id
router.get('/:id', getUserById);

// PUT  /api/users/:id           (auth required — own profile only)
router.put('/:id', protect, updateProfile);

export default router;
