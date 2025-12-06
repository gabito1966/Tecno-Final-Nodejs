import { Router } from "express";
import * as productController from "../controllers/products.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/view", requireAuth, productController.renderProducts);
router.get("/view/:id", requireAuth, productController.renderProductView);
router.get("/create", requireAuth, productController.renderCreateForm);
router.post("/create", requireAuth, productController.createProduct);
router.get("/edit/:id", requireAuth, productController.renderEditForm);
router.post("/edit/:id", requireAuth, productController.editProduct);

router.delete("/delete/:id", requireAuth, productController.deleteProduct);
router.get("/", requireAuth, productController.getProducts);
router.get("/:id", requireAuth, productController.getProduct);

export default router;
