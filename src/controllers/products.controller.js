import * as productService from "../services/products.service.js";


const caegories =
    [
        {
            "name": "computadoras"
        },
        {
            "name": "perifericos"
        },
        {
            "name": "electronicos"
        },
        {
            "name": "impresoras"
        },
        {
            "name": "hardware"
        }
    ]

export const renderProducts = async (req, res) => {
    try {
        const { products } = await productService.listProducts();
        res.render("products/list", { products });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al cargar la lista de productos");
    }
};

export const renderProductView = async (req, res) => {
    try {
        const product = await productService.findProduct(req.params.id);
        if (!product) return res.status(404).send("Producto no encontrado");

        res.render("products/view", { product });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al cargar el producto");
    }
};

export const renderCreateForm = (req, res) => {
    res.render("products/form", { product: null, categories });
};

export const createProduct = async (req, res) => {
    try {
        const newProduct = {
            name: req.body.name,
            price: req.body.price,
            description: req.body.description,
            image: req.body.image || "",
            category: req.body.category || "Sin categoría"
        };

        await productService.addProduct(newProduct);
        res.redirect("/products/view");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al crear producto");
    }
};

export const renderEditForm = async (req, res) => {
    try {
        const product = await productService.findProduct(req.params.id);
        if (!product) return res.status(404).send("Producto no encontrado");

        res.render("products/form", { product, categories });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al cargar formulario de edición");
    }
};

export const editProduct = async (req, res) => {
    try {
        const updated = {
            name: req.body.name,
            price: req.body.price,
            description: req.body.description,
            image: req.body.image,
            category: req.body.category
        };

        await productService.updateProduct(req.params.id, updated);
        res.redirect("/products/view");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al actualizar producto");
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const ok = await productService.removeProduct(req.params.id);
        if (!ok) return res.status(404).json({ message: "Producto no encontrado" });

        res.status(200).json({ message: "Producto eliminado" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar producto" });
    }
};

export const getProducts = async (req, res) => {
    try {
        const { products } = await productService.listProducts();
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener productos" });
    }
};

export const getProduct = async (req, res) => {
    try {
        const product = await productService.findProduct(req.params.id);
        if (!product) return res.status(404).json({ message: "Producto no encontrado" });

        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener producto" });
    }
};
