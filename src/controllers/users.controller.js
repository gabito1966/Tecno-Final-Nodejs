import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import { auth, db } from "../config/firebase.js";

// =======================
// AUTH
// =======================
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
            uid: userRecord.uid,
            name,
            email,
            role: "user",
            createdAt: new Date()
        });

        return res.render("auth/login", { success: "Registro exitoso, ya puedes iniciar sesión", error: null });

    } catch (err) {
        console.error("Error en registro:", err);
        return res.render("auth/register", { error: "Error interno", success: null });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
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
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, { httpOnly: true, secure: false, maxAge: 3600000 });

        return res.redirect("/products/view");

    } catch (err) {
        console.error("Error en login:", err);
        return res.render("auth/login", { error: "Error interno", success: null });
    }
};

export const logout = (req, res) => {
    res.clearCookie("token");
    return res.redirect("/auth/login");
};

// =======================
// USERS CRUD
// =======================
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.render("users/create", { error: "Todos los campos son obligatorios" });
        }

        const userRecord = await auth.createUser({
            email,
            password,
            displayName: name
        });

        await db.collection("users").doc(userRecord.uid).set({
            uid: userRecord.uid,
            name,
            email,
            role: role || "user",
            createdAt: new Date()
        });

        return res.redirect("/users/view");

    } catch (err) {
        console.error(err);
        return res.render("users/create", { error: "Error al crear usuario" });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const userDoc = await db.collection("users").doc(id).get();
        if (!userDoc.exists) return res.status(404).json({ error: "Usuario no encontrado" });

        const userData = userDoc.data();

        // Borra de Firebase Auth usando UID o id
        try {
            await auth.deleteUser(userData.uid || id);
            console.log(`Usuario Auth eliminado: ${userData.uid || id}`);
        } catch (authErr) {
            console.warn("Error eliminando usuario de Firebase Auth:", authErr.code);
        }

        // Borra de Firestore
        await db.collection("users").doc(id).delete();
        console.log(`Usuario Firestore eliminado: ${id}`);

        return res.status(200).json({ message: "Usuario eliminado" });

    } catch (err) {
        console.error("Error eliminando usuario:", err);
        return res.status(500).json({ error: "Error al eliminar usuario" });
    }
};

export const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db.collection("users").doc(id).get();

        if (!doc.exists) return res.status(404).json({ error: "Usuario no encontrado" });

        return res.status(200).json({ id: doc.id, ...doc.data() });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Error al obtener usuario" });
    }
};

export const getUsers = async (req, res) => {
    try {
        const snapshot = await db.collection("users").get();
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return res.status(200).json(users);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Error al listar usuarios" });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role } = req.body;

        await db.collection("users").doc(id).update({ name, email, role });

        await auth.updateUser(id, { email, displayName: name });

        return res.redirect("/users/view");

    } catch (err) {
        console.error(err);
        return res.render("users/edit", {
            error: "Error al actualizar usuario",
            user: { id, ...req.body }
        });
    }
};

// =======================
// RENDER VIEWS
// =======================
export const renderUsers = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    const search = req.query.search || '';
    const roleFilter = req.query.role || '';

    try {
        const snapshot = await db.collection("users").orderBy("createdAt", "desc").get();
        let users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (roleFilter) {
            users = users.filter(u => u.role === roleFilter);
        }

        if (search) {
            const lower = search.toLowerCase();
            users = users.filter(u =>
                u.name.toLowerCase().includes(lower) ||
                u.email.toLowerCase().includes(lower)
            );
        }

        const total = users.length;
        const totalPages = Math.ceil(total / limit);
        const paginatedUsers = users.slice((page - 1) * limit, page * limit);

        const roles = ['admin', 'user', 'manager'];

        return res.render("users/list", {
            users: paginatedUsers,
            roles,
            roleFilter,
            search,
            currentPage: page,
            totalPages,
            user: res.locals.user
        });

    } catch (err) {
        console.error("Error renderUsers:", err);

        return res.render("users/list", {
            users: [],
            roles: ['admin', 'user', 'manager'],
            roleFilter,
            search,
            currentPage: page,
            totalPages: 1,
            error: "Error al cargar usuarios",
            user: res.locals.user
        });
    }
};


export const renderUserView = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db.collection("users").doc(id).get();

        if (!doc.exists) return res.render("users/view", { user: null, error: "Usuario no encontrado" });

        return res.render("users/view", { user: { id: doc.id, ...doc.data() }, error: null });

    } catch (err) {
        console.error(err);
        return res.render("users/view", { user: null, error: "Error al cargar usuario" });
    }
};

export const renderCreateUser = (req, res) => {
    res.render("users/create", { error: null });
};

export const renderEditUser = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db.collection("users").doc(id).get();

        if (!doc.exists) return res.render("users/edit", { user: null, error: "Usuario no encontrado" });

        return res.render("users/edit", { user: { id: doc.id, ...doc.data() }, error: null });

    } catch (err) {
        console.error(err);
        return res.render("users/edit", { user: null, error: "Error al cargar usuario" });
    }
};
