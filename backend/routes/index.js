var express = require('express');
var router = express.Router();

/* GET home page. */
router.use('/discountcodes',require('./discountcodes'));
router.use('/categories',require('./categories'));
router.use('/products',require('./products'));
router.use('/comments',require('./comments'));
router.use('/orders',require('./orders'));
router.use('/users',require('./users'));
router.use('/auth',require('./auth'));

module.exports = router;
