var express = require("express");
var router = express.Router();
var productTypeModel = require("../schemas/productType");
var Res = require("../helpers/ResRender");
var Query = require("../helpers/QueryHandler");

const populateFields = [{ path: "published", select: "_id name" }];

router.get("/", async function (req, res, next) {
  let objQueries = Query.ProcessQueries(req);
  let sortObj = Query.ProcessSortQuery(req);
  let { page, limit } = Query.GetPageAndLimit(req);
  try {
    var productTypes = await productTypeModel
      .find(objQueries)
      .populate(populateFields)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(sortObj);
    res.send(productTypes);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async function (req, res, next) {
  try {
    var productType = await productTypeModel
      .find({ _id: req.params.id })
      .populate(populateFields);
    Res.ResRend(res, true, productType);
  } catch (error) {
    Res.ResRend(res, false, error);
  }
});

router.post("/", async function (req, res, next) {
  try {
    var newproductType = new productTypeModel({
      name: req.body.name,
    });
    await newproductType.save();
    Res.ResRend(res, true, newproductType);
  } catch (error) {
    Res.ResRend(res, false, error);
  }
});
router.put("/:id", async function (req, res, next) {
  try {
    var productType = await productTypeModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    Res.ResRend(res, true, productType);
  } catch (error) {
    Res.ResRend(res, false, error);
  }
});

router.delete("/:id", async function (req, res, next) {
  try {
    var productType = await productTypeModel.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      {
        new: true,
      }
    );
    Res.ResRend(res, true, productType);
  } catch (error) {
    Res.ResRend(res, false, error);
  }
});

module.exports = router;
