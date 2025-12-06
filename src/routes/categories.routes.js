import express from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { categoryService } from "../services/category.service.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
    try {
        const categories = await categoryService.listcategory();
        res.status(200).json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/:id", requireAuth, async (req, res) => {
    try {
        const category = await categoryService.findCategory(req.params.id);
        if (!category) {
            return res.status(404).json({ error: "Categoría no encontrada" });
        }
        res.status(200).json(category);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/name/:name", requireAuth, async (req, res) => {
    try {
        const category = await categoryService.findCategoryByName(req.params.name);
        if (!category) {
            return res.status(404).json({ error: "Categoría no encontrada" });
        }
        res.status(200).json(category);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/", requireAuth, async (req, res) => {
    try {
        const { categoryId, name } = req.body;
        if (!categoryId || !name) {
            return res.status(400).json({ error: "categoryId y name son obligatorios" });
        }
        await db.collection("category").add({
            categoryId: Number(categoryId),
            name: name.trim()
        });
        res.status(201).json({ message: "Categoría creada correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete("/:id", requireAuth, async (req, res) => {
    try {
        const docRef = db.collection("category").doc(req.params.id);
        const snap = await docRef.get();
        if (!snap.exists) {
            return res.status(404).json({ error: "Categoría no encontrada" });
        }
        await docRef.delete();
        res.status(200).json({ message: "Categoría eliminada correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


export default router;
