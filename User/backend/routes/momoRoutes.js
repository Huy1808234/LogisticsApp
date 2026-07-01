const express = require("express");
const router = express.Router();
const momoController = require("../controllers/paymentController");

router.post("/momo/create", momoController.createMomoPayment);
router.post("/momo/ipn", momoController.handleMomoIPN);
router.get("/momo/autocancel", momoController.autoCancelUnpaidOrders);

module.exports = router;
