const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// Order routes
router.get("/", orderController.getAllOrdersController);
router.get('/detail/:orderCode', orderController.getOrderDetailController);
router.post("/createShipment", orderController.createFullShipmentController);

module.exports = router;