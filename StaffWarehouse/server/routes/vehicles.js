const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');


// Vehicle routes
router.get("", vehicleController.getVehiclesController);
router.get("/byOrder/:code", vehicleController.getVehicleByOrderController);
router.get("/orders/:vehicleID", vehicleController.getOrdersByVehicleController);
router.put("/updateLocation/:vehicleID", vehicleController.updateVehicleLocation);

module.exports = router;