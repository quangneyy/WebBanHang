var express = require('express');
var router = express.Router();
var commentModel = require('../schemas/comment')
var Res = require('../helpers/ResRender');
var checkLogin = require('../middlewares/checkLogin');
require('express-async-errors')

router.post('/', checkLogin, async function (req, res, next) {
  try {
    var newcomment = new commentModel({
      text: req.body.text,
      user: req.body.user_id, 
      product: req.body.product_id
    })
    await newcomment.save();
    Res.ResRend(res, true, newcomment);
  } catch (error) {
    Res.ResRend(res, false, error);
  }
});
router.delete('/:id', checkLogin, async function (req, res, next) {
  try {
    var comment = await commentModel.findByIdAndUpdate(req.params.id,
      { isDeleted: true }, {
      new: true
    });
    Res.ResRend(res, true, comment);
  } catch (error) {
    Res.ResRend(res, false, error);
  }
});


module.exports = router;
