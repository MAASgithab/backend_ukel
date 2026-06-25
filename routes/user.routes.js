const express = require("express");

const router = express.Router();

const userController = require("../controllers/user.controller");
const { verifyToken, verifyAdmin } = require("../middlewares/auth");

router.get("/", verifyToken, verifyAdmin, userController.getUser);
router.get("/:id", verifyToken, verifyAdmin, userController.detailUser);
router.put("/:id", verifyToken, verifyAdmin, userController.updateUser);
router.delete("/:id", verifyToken, verifyAdmin, userController.deleteUser);

module.exports = router;
