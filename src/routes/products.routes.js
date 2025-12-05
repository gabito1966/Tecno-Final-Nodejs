import express from "express";
import {
   createProduct,
   deleteProduct,
   editProduct,
   getProduct,
   getProducts,
   renderCreateForm,
   renderEditForm,
   renderProducts,
   renderProductView
} from "../controllers/products.controller.js";

const router = express.Router();

// Listado y vista por productId
router.get("/view", renderProducts);
router.get("/view/:id", renderProductView);

// Crear
router.get("/create", renderCreateForm);
router.post("/create", createProduct);

// Editar (usa productId)
router.get("/edit/:id", renderEditForm);
router.post("/edit/:id", editProduct);

// Eliminar por productId
router.delete("/delete/:id", deleteProduct);

// API
router.get("/api", getProducts);
router.get("/api/:id", getProduct);

export default router;
