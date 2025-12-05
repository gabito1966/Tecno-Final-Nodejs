import express from 'express';
import { login, logout, register, renderLogin, renderRegister } from '../controllers/auth.controller.js';

const router = express.Router();

router.get('/login', renderLogin);
router.get('/register', renderRegister);
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);


export default router;
