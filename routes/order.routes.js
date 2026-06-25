const express = require("express");

const router = express.Router();

const orderController = require("../controllers/order.controller");

router.get("/", orderController.getOrder);
router.get("/my", orderController.getMyOrders);   // 🔹 User lihat pesanan sendiri
// path dinamis
router.get("/:id", orderController.detailOrder);
router.post("/", orderController.createOrder);
// update hanya untuk status order
router.put("/:id/status", orderController.updateStatusOrder);
router.put("/:id/finalize", orderController.finalizeOrder); // 🔹 Admin checklist → stok potong
router.delete("/:id", orderController.deleteOrder);

module.exports = router;
