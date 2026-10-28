const router = require("express").Router();
const ctrl = require("../controllers/product.controller");
const { protect, restrictTo } = require("../middlewares/auth.middleware");
const { uploadProductImage } = require("../middlewares/upload.middleware");

router.get(
  "/admin/all",
  protect,
  restrictTo("admin"),
  ctrl.getAllProductsAdmin,
);
router.get("/admin/:id", protect, restrictTo("admin"), ctrl.getProductAdmin);

router.get("/", ctrl.getProducts);
router.get("/:slug", ctrl.getProductBySlug);

router.post(
  "/",
  protect,
  restrictTo("admin"),
  uploadProductImage,
  ctrl.createProduct,
);
router.patch(
  "/:id",
  protect,
  restrictTo("admin"),
  uploadProductImage,
  ctrl.updateProduct,
);
router.patch(
  "/:id/toggle-active",
  protect,
  restrictTo("admin"),
  ctrl.toggleActive,
);
router.delete("/:id", protect, restrictTo("admin"), ctrl.deleteProduct);

module.exports = router;
