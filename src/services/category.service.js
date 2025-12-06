import { db } from "../config/firebase.js";

export const listcategory = async () => {
    try {
        const snapshot = await db.collection("categories").get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (err) {
        throw new Error("Error al listar categorías: " + err.message);
    }
};

export const findCategory = async (id) => {
    try {
        const doc = await db.collection("categories").doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() };
    } catch (err) {
        throw new Error("Error al obtener categoría: " + err.message);
    }
};

export const findCategoryByName = async (name) => {
    try {
        const snapshot = await db
            .collection("categories")
            .where("name", "==", name)
            .limit(1)
            .get();

        if (snapshot.empty) return null;

        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    } catch (err) {
        throw new Error("Error al buscar categoría por nombre: " + err.message);
    }
};

export const categoryService = {
    listcategory,
    findCategory,
    findCategoryByName
};
