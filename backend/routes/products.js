var express = require('express');
var router = express.Router();
var productModel = require('../schemas/product')
var Res = require('../helpers/ResRender');
var checkLogin = require('../middlewares/checkLogin');
var checkRole = require('../middlewares/checkRole');
var Query = require('../helpers/QueryHandler');

const populateFields = [
  { path: "category", select: "_id name" },
  { path: "published", select: "_id name" },
];


router.get("/", async function (req, res, next) {
  let StringArray = ["name"];
  let objQueries = Query.ProcessQueries(req,StringArray);
  let sortObj = Query.ProcessSortQuery(req);
  let { page, limit } = Query.GetPageAndLimit(req);

  try {
    var products = await productModel
      .find(objQueries)
      .populate(populateFields)
      .lean()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(sortObj);

    res.send(products);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async function (req, res, next) {
  var product = await productModel.find({ _id: req.params.id });
  Res.ResRend(res, true, product);
});

router.post('/', checkLogin, checkRole("ADMIN"), async function (req, res, next) {
  try {
    var newproduct = new productModel({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      images: req.body.images,
    })
    await newproduct.save();
    Res.ResRend(res, true, newproduct);
  } catch (error) {
    Res.ResRend(res, false, error);
  }
});

router.put('/:id', checkLogin, checkRole("ADMIN"), async function (req, res, next) {
  try {
    var product = await productModel.findByIdAndUpdate(req.params.id,
      req.body, {
      new: true
    });
    Res.ResRend(res, true, product);
  } catch (error) {
    Res.ResRend(res, false, error);
  }
});
router.delete('/:id',checkLogin, checkRole("ADMIN"), async function (req, res, next) {
  try {
    var product = await productModel.findByIdAndUpdate(req.params.id,
      { isDeleted: true }, {
      new: true
    });
    Res.ResRend(res, true, product);
  } catch (error) {
    Res.ResRend(res, false, error);
  }
});


module.exports = router;
