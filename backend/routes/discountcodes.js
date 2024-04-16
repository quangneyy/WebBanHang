var express = require('express');
var router = express.Router();
var discountcodeModel = require('../schemas/discountcode')
var Res = require('../helpers/ResRender');
var checkLogin = require('../middlewares/checkLogin');
var checkRole = require('../middlewares/checkRole');
var Query = require('../helpers/QueryHandler');
require('express-async-errors')


router.get("/", async function (req, res, next) {
  let StringArray = ["code"];
  let objQueries = Query.ProcessQueries(req, StringArray);
  let sortObj = Query.ProcessSortQuery(req);
  let { page, limit } = Query.GetPageAndLimit(req);
  try {
    var discountcodes = await discountcodeModel
      .find(objQueries)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(sortObj);
    res.send(discountcodes);
  } catch (error) {
    next(error);
  }
});

router.get("/", async function (req, res, next) {
  let StringArray = ["name"];
  let objQueries = Query.ProcessQueries(req,StringArray);
  let sortObj = Query.ProcessSortQuery(req);
  let { page, limit } = Query.GetPageAndLimit(req);
  try {
    var discountcodes = await discountcodeModel
      .find(objQueries)
      .populate(populateFields)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(sortObj);
    res.send(discountcodes);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async function (req, res, next) {
  var discountcode = await discountcodeModel.find({ _id: req.params.id });
  Res.ResRend(res, true, discountcode);
});

router.post('/', checkLogin, checkRole("ADMIN"), async function (req, res, next) {
  try {
    var newdiscountcode = new discountcodeModel({
      code: req.body.code,
      discountPercentage: req.body.discountPercentage,
      startDate: req.body.startDate,
      expiryDate: req.body.expiryDate,
      isActive: req.body.isActive
    });
    await newdiscountcode.save();
    Res.ResRend(res, true, newdiscountcode);
  } catch (error) {
    Res.ResRend(res, false, error);
  }
});
router.put('/:id', checkLogin, checkRole("ADMIN"), async function (req, res, next) {
  try {
    var discountcode = await discountcodeModel.findByIdAndUpdate(req.params.id,
      req.body, {
      new: true
    });
    Res.ResRend(res, true, discountcode);
  } catch (error) {
    Res.ResRend(res, false, error);
  }
});

router.delete('/:id', checkLogin, checkRole("ADMIN"), async function (req, res, next) {
  try {
    var discountcode = await discountcodeModel.findByIdAndUpdate(req.params.id,
      { isDeleted: true }, {
      new: true
    });
    Res.ResRend(res, true, discountcode);
  } catch (error) {
    Res.ResRend(res, false, error);
  }
});


module.exports = router;
