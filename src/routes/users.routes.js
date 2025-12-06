import express from 'express';
import {
   createUser,
   deleteUser,
   getUser,
   getUsers,
   renderCreateUser,
   renderEditUser,
   renderUsers,
   renderUserView,
   updateUser
} from '../controllers/users.controller.js';

import authMiddleware, { requireAuth } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use(requireAuth);
router.use(requireRole('admin'));

router.get('/view', renderUsers);
router.get('/view/:id', renderUserView);
router.get('/create', renderCreateUser);
router.post('/create', createUser);
router.get('/edit/:id', renderEditUser);
router.post('/edit/:id', updateUser);
router.delete('/view/:id', deleteUser);

router.get('/api', getUsers);
router.get('/api/:id', getUser);
router.delete('/api/:id', deleteUser);

export default router;
