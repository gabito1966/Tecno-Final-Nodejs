import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import { auth, db } from "../config/firebase.js"; // ya no usar 'admin'

export const renderLogin = (req, res) => {
    res.render("auth/login", { error: null, success: null });
};

export const renderRegister = (req, res) => {
    res.render("auth/register", { error: null, success: null });
};

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.render("auth/register", { error: "Todos los campos son obligatorios", success: null });
        }

        const existingUser = await auth.getUserByEmail(email).catch(() => null);
        if (existingUser) {
            return res.render("auth/register", { error: "El usuario ya existe", success: null });
        }

        const userRecord = await auth.createUser({
            email,
            password,
            displayName: name
        });

        await db.collection("users").doc(userRecord.uid).set({
            name,
            email,
            role: "user",
            createdAt: new Date()
        });

        return res.render("auth/login", { success: "Registro exitoso, ya puedes iniciar sesión", error: null });

    } catch (err) {
        console.error(err);
        return res.render("auth/register", { error: "Error interno", success: null });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.render("auth/login", { error: "Faltan datos", success: null });
        }

        const apiKey = process.env.FIREBASE_API_KEY;
        const response = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, returnSecureToken: true })
            }
        );

        const data = await response.json();

        if (data.error) {
            return res.render("auth/login", { error: "Credenciales inválidas", success: null });
        }

        const userDoc = await db.collection("users").doc(data.localId).get();
        const userData = userDoc.exists ? userDoc.data() : { role: "user" };

        const token = jwt.sign(
            { id: data.localId, email, role: userData.role },
            process.env.JWT_SECRET
        );

        res.cookie("token", token, { httpOnly: true, secure: false });

        return res.redirect("/products/view");

    } catch (err) {
        console.error(err);
        return res.render("auth/login", { error: "Error interno", success: null });
    }
};

// Logout
export const logout = (req, res) => {
    res.clearCookie("token");
    return res.redirect("/auth/login");
};
