const express = require("express");
const router = express.Router();
const deliveryController = require("../controllers/deliveryController");

// Delivery routes
router.post("/", deliveryController.createDeliveryController);


module.exports = router;