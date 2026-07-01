const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

// Import các route khác
const authRoutes = require('./auth');
const vehicleRoutes = require('./vehicles');
const orderRoutes = require('./orders');
const deliveryRoutes = require('./Delivery');
const shipperRoutes = require('./shippers');


// Public routes
router.use("/auth", authRoutes);

// Protected routes
router.use("/vehicle", verifyToken, vehicleRoutes);
router.use("/order", verifyToken, orderRoutes);
router.use("/delivery", verifyToken, deliveryRoutes);
router.use("/shipper", verifyToken, shipperRoutes);


module.exports = router;
