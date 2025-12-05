import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import methodOverride from 'method-override';
import path from 'path';

import authRoutes from './src/routes/auth.routes.js';
import productRoutes from './src/routes/products.routes.js';
import userRoutes from './src/routes/users.routes.js';

import authMiddleware, { requireAuth } from './src/middlewares/auth.middleware.js';
import { requireRole } from './src/middlewares/role.middleware.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares generales
app.use(methodOverride('_method'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(authMiddleware);

// Exponer variables de entorno de Firebase a EJS
app.use((req, res, next) => {
    res.locals.FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
    res.locals.FIREBASE_AUTH_DOMAIN = process.env.FIREBASE_AUTH_DOMAIN;
    res.locals.FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
    res.locals.FIREBASE_STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET;
    res.locals.FIREBASE_MEASUREMENT_ID = process.env.FIREBASE_MEASUREMENT_ID;
    res.locals.FIREBASE_APP_ID = process.env.FIREBASE_APP_ID;
    next();
});

// Configuración de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'src/views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// Ruta raíz
app.get('/', (req, res) => res.redirect('/auth/login'));

// Rutas
app.use('/auth', authRoutes);
app.use('/products', requireAuth, productRoutes);
app.use('/users', requireAuth, requireRole('admin'), userRoutes);

// Servidor
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
