var express = require("express");
var router = express.Router();
var productModel = require("../schemas/product");
var Res = require("../helpers/ResRender");
var Query = require("../helpers/QueryHandler");

const populateFields = [
  { path: "productType", select: "_id name" },
  { path: "supplier", select: "_id name logo" },
];

router.get("/", async function (req, res, next) {
  let objQueries = Query.ProcessQueries(req);
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

router.get("/:id", async function (req, res, next) {
  try {
    var product = await productModel
      .find({ _id: req.params.id })
      .populate(populateFields);
    Res.ResRend(res, true, product);
  } catch (error) {
    Res.ResRend(res, false, error);
  }
});

router.post("/", async function (req, res, next) {
  try {
    var newproduct = new productModel({
      name: req.body.name,
      productType: req.body.productType,
      supplier: req.body.supplier,
    });
    await newproduct.save();
    Res.ResRend(res, true, newproduct);
  } catch (error) {
    Res.ResRend(res, false, error);
  }
});
router.put("/:id", async function (req, res, next) {
  try {
    var product = await productModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    Res.ResRend(res, true, product);
  } catch (error) {
    Res.ResRend(res, false, error);
  }
});

router.delete("/:id", async function (req, res, next) {
  try {
    var product = await productModel.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      {
        new: true,
      }
    );
    Res.ResRend(res, true, product);
  } catch (error) {
    Res.ResRend(res, false, error);
  }
});

module.exports = router;
