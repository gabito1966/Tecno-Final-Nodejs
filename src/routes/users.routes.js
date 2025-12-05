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

// 🔐 Middleware global: todas las rutas protegidas
router.use(authMiddleware);
router.use(requireAuth);
router.use(requireRole('admin'));

// ---------- RUTAS DE VISTAS ----------
router.get('/view', renderUsers);               // Lista de usuarios
router.get('/view/:id', renderUserView);        // Vista individual
router.get('/create', renderCreateUser);       // Formulario creación
router.post('/create', createUser);            // Crear usuario
router.get('/edit/:id', renderEditUser);       // Formulario edición
router.post('/edit/:id', updateUser);          // Editar usuario
router.delete('/view/:id', deleteUser);        // DELETE vía AJAX desde la vista

// ---------- RUTAS DE API JSON ----------
router.get('/api', getUsers);                  // Listado JSON
router.get('/api/:id', getUser);               // Usuario individual JSON
router.delete('/api/:id', deleteUser);         // DELETE JSON (API)

export default router;
