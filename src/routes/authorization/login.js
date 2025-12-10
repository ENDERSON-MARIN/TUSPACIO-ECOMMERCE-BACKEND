const router = require('express').Router();

const {
    getLogin,
} = require("../../controllers/authorization/login.js");


router.post('/', getLogin); 

module.exports = router;
