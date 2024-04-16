var express = require('express');
var router = express.Router();
var categoryModel = require('../schemas/category')
var Res = require('../helpers/ResRender');
var checkLogin = require('../middlewares/checkLogin');
var checkRole = require('../middlewares/checkRole');
var Query = require('../helpers/QueryHandler');
require('express-async-errors')

const populateFields = [{ path: "category", select: "_id name" }];

router.get("/", async function (req, res, next) {
  let StringArray = ["name"];
  let objQueries = Query.ProcessQueries(req, StringArray);
  let sortObj = Query.ProcessSortQuery(req);
  let { page, limit } = Query.GetPageAndLimit(req);
  try {
    var categorys = await categoryModel
      .find(objQueries)
      .populate(populateFields)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(sortObj);
    res.send(categorys);
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
    var categorys = await categoryModel
      .find(objQueries)
      .populate(populateFields)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(sortObj);
    res.send(categorys);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async function (req, res, next) {
  var category = await categoryModel.find({ _id: req.params.id });
  Res.ResRend(res, true, category);
});

router.post('/', checkLogin, checkRole("ADMIN"), async function (req, res, next) {
  try {
    var newcategory = new categoryModel({
      name: req.body.name
    })
    await newcategory.save();
    Res.ResRend(res, true, newcategory);
  } catch (error) {
    Res.ResRend(res, false, error);
  }
});
router.put('/:id', checkLogin, checkRole("ADMIN"), async function (req, res, next) {
  try {
    var category = await categoryModel.findByIdAndUpdate(req.params.id,
      req.body, {
      new: true
    });
    Res.ResRend(res, true, category);
  } catch (error) {
    Res.ResRend(res, false, error);
  }
});

router.delete('/:id', checkLogin, checkRole("ADMIN"), async function (req, res, next) {
  try {
    var category = await categoryModel.findByIdAndUpdate(req.params.id,
      { isDeleted: true }, {
      new: true
    });
    Res.ResRend(res, true, category);
  } catch (error) {
    Res.ResRend(res, false, error);
  }
});


module.exports = router;
