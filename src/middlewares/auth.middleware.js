import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { db } from '../config/firebase.js';

dotenv.config();

export default async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        req.user = null;
        res.locals.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.id || !decoded.role) {
            console.warn("Token inválido o manipulado");
            res.clearCookie("token");
            req.user = null;
            res.locals.user = null;
            return next();
        }

        req.user = decoded;

        const userDoc = await db.collection('users').doc(decoded.id).get();
        if (userDoc.exists) {
            res.locals.user = { id: userDoc.id, ...userDoc.data() };
        } else {
            res.locals.user = null;
        }

    } catch (err) {
        console.error("Token inválido o expirado:", err.message);
        res.clearCookie("token");
        req.user = null;
        res.locals.user = null;
    }

    if (res.locals.success === undefined) res.locals.success = null;
    if (res.locals.error === undefined) res.locals.error = null;

    next();
};

export const requireAuth = (req, res, next) => {
    if (!req.user || !res.locals.user) {
        return res.redirect("/auth/login");
    }
    next();
};
