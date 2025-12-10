const { Router } = require("express");
const { Checkout, webhook } = require("../controllers/checkout.js");
const express = require('express');
const router = Router();

router.post("/", Checkout);

router.post('/webhook', express.raw({type: 'application/json'}), webhook);

module.exports = router;