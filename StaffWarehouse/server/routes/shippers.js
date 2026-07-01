const express = require("express");
const router = express.Router();
const shipperController = require("../controllers/shipperController");

// Middleware để xác định req.user.warehouseID nếu cần
// router.use(authMiddleware);

router.get("/:orderID", shipperController.getShippersByOrderController);

module.exports = router;
