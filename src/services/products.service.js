import { db } from "../firebaseAdmin.js";
import { Product } from "../models/Product.js";

// Obtener lista de productos con filtros y paginación
export const listProducts = async (
    page = 1,
    limit = 16,
    category = null,
    search = null,
    startAfterId = null
) => {
    try {
        let query = db.collection("products").orderBy("createdAt", "desc");

        if (category) query = query.where("category", "==", category);

        if (startAfterId) {
            const lastDoc = await db.collection("products").doc(startAfterId).get();
            if (lastDoc.exists) query = query.startAfter(lastDoc);
        }

        query = query.limit(limit);
        const snapshot = await query.get();

        let products = snapshot.docs.map(doc => {
            const d = doc.data();
            return new Product(
                d.productId,
                d.name,
                d.price,
                d.description,
                d.image,
                d.category
            );
        });

        if (search) {
            const s = search.toLowerCase();
            products = products.filter(p =>
                p.name.toLowerCase().includes(s)
            );
        }

        let totalQuery = db.collection("products");
        if (category) totalQuery = totalQuery.where("category", "==", category);
        const totalDocs = (await totalQuery.get()).size;

        return { products, total: totalDocs };

    } catch (err) {
        throw new Error("Error al listar productos: " + err.message);
    }
};

// Buscar producto por productId (NO firebaseId)
export const findProduct = async (productId) => {
    try {
        const snapshot = await db.collection("products")
            .where("productId", "==", Number(productId))
            .limit(1)
            .get();

        if (snapshot.empty) return null;

        const data = snapshot.docs[0].data();

        return new Product(
            data.productId,
            data.name,
            data.price,
            data.description,
            data.image,
            data.category
        );
    } catch (err) {
        throw new Error("Error al obtener producto: " + err.message);
    }
};

export const addProduct = async (data) => {
    try {
        const docRef = await db.collection("products").add(data);
        const snap = await docRef.get();
        const d = snap.data();

        return new Product(
            d.productId,
            d.name,
            d.price,
            d.description,
            d.image,
            d.category
        );
    } catch (err) {
        throw new Error("Error al crear producto: " + err.message);
    }
};

export const updateProduct = async (productId, data) => {
    try {
        const snapshot = await db.collection("products")
            .where("productId", "==", Number(productId))
            .limit(1)
            .get();

        if (snapshot.empty) return null;

        const docId = snapshot.docs[0].id;

        await db.collection("products").doc(docId).update(data);

        return findProduct(productId);
    } catch (err) {
        throw new Error("Error al actualizar producto: " + err.message);
    }
};

export const removeProduct = async (productId) => {
    try {
        const snapshot = await db.collection("products")
            .where("productId", "==", Number(productId))
            .limit(1)
            .get();

        if (snapshot.empty) return false;

        const docId = snapshot.docs[0].id;

        await db.collection("products").doc(docId).delete();

        return true;
    } catch (err) {
        throw new Error("Error al eliminar producto: " + err.message);
    }
};
