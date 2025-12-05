import { db } from "../config/firebase.js";
import { categoryService } from "../services/category.service.js";

// Listado con paginación y filtros
export const renderProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 16;
        const search = req.query.search || "";
        const categoryFilter = req.query.category || "";

        const categorias = await categoryService.listcategory();
        let query = db.collection("products").orderBy("createdAt", "desc");

        if (categoryFilter) query = query.where("category", "==", categoryFilter);

        const snapshot = await query.get();

        let products = snapshot.docs.map(doc => ({
            firebaseId: doc.id,
            ...doc.data()
        }));

        if (search) {
            const s = search.toLowerCase();
            products = products.filter(product =>
                product.name.toLowerCase().includes(s)
            );
        }

        const total = products.length;
        const paginated = products.slice((page - 1) * limit, page * limit);
        const totalPages = Math.ceil(total / limit);

        res.render("products/list", {
            products: paginated,
            categorias,
            search,
            category: categoryFilter,
            currentPage: page,
            totalPages,
            user: res.locals.user
        });

    } catch (err) {
        res.status(500).send("Error al cargar productos: " + err.message);
    }
};

// FUNCION REUTILIZABLE para renderizar el formulario
const renderProductForm = async (req, res, product = {}, error = null, success = null) => {
    const categorias = await categoryService.listcategory();
    res.render("products/form", {
        categorias,
        product,
        error,
        success,
        user: res.locals.user
    });
};

// Mostrar formulario de creación
export const renderCreateForm = (req, res) => renderProductForm(req, res);

// Crear producto
export const createProduct = async (req, res) => {
    try {
        const { name, description, price, image, category } = req.body;

        const categoryRecord = await categoryService.findCategoryByName(category);
        if (!categoryRecord)
            return renderProductForm(req, res, req.body, "Categoría inválida");

        // GENERAR ID AUTOMÁTICO
        const last = await db.collection("products")
            .orderBy("productId", "desc")
            .limit(1)
            .get();

        let newId = 1;
        if (!last.empty) {
            newId = last.docs[0].data().productId + 1;
        }

        await db.collection("products").add({
            productId: newId,
            name,
            description,
            price: Number(price),
            image: image || "",
            category: categoryRecord.name,
            createdAt: new Date()
        });

        renderProductForm(req, res, {}, null, "Producto creado correctamente");

    } catch (err) {
        renderProductForm(req, res, req.body, "Error al crear producto: " + err.message);
    }
};

// Renderizar formulario de edición
export const renderEditForm = async (req, res) => {
    const productId = parseInt(req.params.id);
    try {
        const snapshot = await db.collection("products")
            .where("productId", "==", productId)
            .limit(1)
            .get();

        if (snapshot.empty)
            return res.render("404", { message: "Producto no encontrado" });

        const doc = snapshot.docs[0];

        return renderProductForm(req, res, {
            firebaseId: doc.id,
            ...doc.data()
        });

    } catch (error) {
        console.error("❌ Error en renderEditForm:", error);
        res.status(500).send("Error en el servidor");
    }
};

// Editar producto
export const editProduct = async (req, res) => {
    const productId = parseInt(req.params.id);
    try {
        const snapshot = await db.collection("products")
            .where("productId", "==", productId)
            .limit(1)
            .get();

        if (snapshot.empty)
            return res.status(404).json({ error: "Producto no encontrado" });

        const firebaseId = snapshot.docs[0].id;

        await db.collection("products")
            .doc(firebaseId)
            .update({
                name: req.body.name,
                description: req.body.description,
                price: Number(req.body.price),
                image: req.body.image,
                category: req.body.category
            });

        res.redirect("/products/view/" + productId);

    } catch (error) {
        console.error("❌ Error en editProduct:", error);
        res.status(500).send("Error en el servidor");
    }
};

// Vista individual
export const renderProductView = async (req, res) => {
    const productId = parseInt(req.params.id);
    try {
        const snapshot = await db.collection("products")
            .where("productId", "==", productId)
            .limit(1)
            .get();

        if (snapshot.empty)
            return res.status(404).send("Producto no encontrado");

        const doc = snapshot.docs[0];

        res.render("products/view", {
            product: { firebaseId: doc.id, ...doc.data() },
            user: res.locals.user
        });

    } catch (err) {
        res.status(500).send("Error al ver producto: " + err.message);
    }
};

// API
export const getProducts = async (req, res) => {
    try {
        const snapshot = await db.collection("products").get();
        const products = snapshot.docs.map(doc => ({
            firebaseId: doc.id,
            ...doc.data()
        }));
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// API detalle
export const getProduct = async (req, res) => {
    const productId = parseInt(req.params.id);
    try {
        const snapshot = await db.collection("products")
            .where("productId", "==", productId)
            .limit(1)
            .get();

        if (snapshot.empty)
            return res.status(404).json({ error: "No encontrado" });

        const doc = snapshot.docs[0];
        res.json({ firebaseId: doc.id, ...doc.data() });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Eliminar producto
export const deleteProduct = async (req, res) => {
    const productId = parseInt(req.params.id);
    try {
        const snapshot = await db.collection("products")
            .where("productId", "==", productId)
            .limit(1)
            .get();

        if (snapshot.empty)
            return res.status(404).json({ error: "No encontrado" });

        const firebaseId = snapshot.docs[0].id;

        await db.collection("products").doc(firebaseId).delete();

        res.redirect("/products/view");

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
