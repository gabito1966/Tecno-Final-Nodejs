import admin from "firebase-admin";

const db = admin.firestore();
const auth = admin.auth();

export const userService = {
    getAllUsers: async () => {
        try {
            const snapshot = await db.collection("users").get();
            const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return { success: true, data: users };
        } catch (error) {
            console.error("getAllUsers error:", error);
            return { success: false, error: "No se pudieron obtener los usuarios" };
        }
    },

    getUserById: async (id) => {
        try {
            const doc = await db.collection("users").doc(id).get();
            if (!doc.exists) return { success: false, error: "Usuario no encontrado" };
            return { success: true, data: { id: doc.id, ...doc.data() } };
        } catch (error) {
            console.error("getUserById error:", error);
            return { success: false, error: "Error al obtener el usuario" };
        }
    },
    createUser: async (data) => {
        try {
            const userRecord = await auth.createUser({
                email: data.email,
                password: data.password,
                displayName: data.name
            });

            const userData = {
                name: data.name,
                email: data.email,
                role: data.role || "user",
                createdAt: new Date()
            };

            await db.collection("users").doc(userRecord.uid).set(userData);

            return { success: true, data: { id: userRecord.uid, ...userData } };
        } catch (error) {
            console.error("createUser error:", error);
            return { success: false, error: error.message || "Error al crear usuario" };
        }
    },

    updateUser: async (id, data) => {
        try {
            const updateAuth = {};
            const updateFirestore = {};

            if (data.name) {
                updateAuth.displayName = data.name;
                updateFirestore.name = data.name;
            }

            if (data.email) {
                updateAuth.email = data.email;
                updateFirestore.email = data.email;
            }

            if (data.password) {
                updateAuth.password = data.password;
            }

            if (data.role) {
                updateFirestore.role = data.role;
            }

            if (Object.keys(updateAuth).length > 0) {
                await auth.updateUser(id, updateAuth);
            }

            if (Object.keys(updateFirestore).length > 0) {
                updateFirestore.updatedAt = new Date();
                await db.collection("users").doc(id).update(updateFirestore);
            }

            const updatedDoc = await db.collection("users").doc(id).get();
            return { success: true, data: { id, ...updatedDoc.data() } };
        } catch (error) {
            console.error("updateUser error:", error);
            return { success: false, error: error.message || "Error al actualizar usuario" };
        }
    },

    deleteUser: async (id) => {
        try {
            await auth.deleteUser(id);
            await db.collection("users").doc(id).delete();
            return { success: true, data: { id } };
        } catch (error) {
            console.error("deleteUser error:", error);
            return { success: false, error: error.message || "Error al eliminar usuario" };
        }
    }
};
