import { db } from "../config/firebase.js";
import { Product } from "../models/product.model.js";

export const listProducts = async () => {
    try {
        const snapshot = await db.collection("products")
            .orderBy("createdAt", "asc")
            .get();
        const products = snapshot.docs.map(doc => {
            const d = doc.data();
            return new Product(
                doc.id,
                d.name,
                d.price,
                d.description,
                d.image,
                d.category,
                d.createdAt
            );
        });
        return { products, total: products.length };
    } catch (err) {
        throw new Error("Error al listar productos: " + err.message);
    }
};

export const findProduct = async (productId) => {
    try {
        const doc = await db.collection("products").doc(productId).get();
        if (!doc.exists) return null;
        const d = doc.data();
        return new Product(
            doc.id,
            d.name,
            d.price,
            d.description,
            d.image,
            d.category,
            d.createdAt
        );
    } catch (err) {
        throw new Error("Error al obtener producto: " + err.message);
    }
};

export const addProduct = async (product) => {
    try {
        const docRef = await db.collection("products").add({
            ...product,
            createdAt: new Date()
        });
        const snap = await docRef.get();
        const d = snap.data();
        return new Product(
            docRef.id,
            d.name,
            d.price,
            d.description,
            d.image,
            d.category,
            d.createdAt
        );
    } catch (err) {
        throw new Error("Error al crear producto: " + err.message);
    }
};

export const updateProduct = async (productId, data) => {
    try {
        const docRef = db.collection("products").doc(productId);
        const snap = await docRef.get();
        if (!snap.exists) return null;
        await docRef.update(data);
        const updated = await docRef.get();
        const d = updated.data();
        return new Product(
            docRef.id,
            d.name,
            d.price,
            d.description,
            d.image,
            d.category,
            d.createdAt
        );
    } catch (err) {
        throw new Error("Error al actualizar producto: " + err.message);
    }
};

export const removeProduct = async (productId) => {
    try {
        const docRef = db.collection("products").doc(productId);
        const snap = await docRef.get();
        if (!snap.exists) return false;
        await docRef.delete();
        return true;
    } catch (err) {
        throw new Error("Error al eliminar producto: " + err.message);
    }
};

export const listAllProducts = async () => {
    try {
        const snapshot = await db.collection("products")
            .orderBy("createdAt", "desc")
            .get();
        return snapshot.docs.map(doc => {
            const d = doc.data();
            return new Product(
                doc.id,
                d.name,
                d.price,
                d.description,
                d.image,
                d.category,
                d.createdAt
            );
        });
    } catch (err) {
        throw new Error("Error al listar todos los productos: " + err.message);
    }
};
