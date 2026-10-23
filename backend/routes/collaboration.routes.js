import { Router } from 'express';
import {
  getIncoming,
  getOutgoing,
  checkExisting,
  submitRequest,
  updateStatus,
} from '../controllers/collaboration.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// All collaboration routes require authentication
router.use(protect);

// GET /api/collaborations/incoming & /api/collaborations/creator — requests on creator's projects
// Compatible aliases supporting both frontend service (/incoming) and documented API contract (/creator)
router.get('/incoming', getIncoming);
router.get('/creator', getIncoming);

// GET /api/collaborations/outgoing & /api/collaborations/applicant — requests submitted by current user
// Compatible aliases supporting both frontend service (/outgoing) and documented API contract (/applicant)
router.get('/outgoing', getOutgoing);
router.get('/applicant', getOutgoing);

// GET /api/collaborations/check/:projectId — check for existing request
router.get('/check/:projectId', checkExisting);

// POST /api/collaborations — submit a join request
router.post('/', submitRequest);

// PUT /api/collaborations/:id/status — accept or decline
router.put('/:id/status', updateStatus);

export default router;
