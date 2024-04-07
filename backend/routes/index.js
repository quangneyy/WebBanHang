var express = require('express');
var router = express.Router();

router.use('/products',require('./products'));
router.use('/productTypes',require('./productTypes'));
router.use('/suppliers',require('./suppliers'));

router.use('/users',require('./users'));
router.use('/auth',require('./auth'));

module.exports = router;
