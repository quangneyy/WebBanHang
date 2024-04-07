var express = require("express");
var router = express.Router();
var supplierModel = require("../schemas/supplier");
var Res = require("../helpers/ResRender");
var Query = require("../helpers/QueryHandler");

const populateFields = [{ path: "published", select: "_id name" }];

router.get("/", async function (req, res, next) {
  let objQueries = Query.ProcessQueries(req);
  let sortObj = Query.ProcessSortQuery(req);
  let { page, limit } = Query.GetPageAndLimit(req);
  try {
    var suppliers = await supplierModel
      .find(objQueries)
      .populate(populateFields)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(sortObj);
    res.send(suppliers);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async function (req, res, next) {
  try {
    var supplier = await supplierModel
      .find({ _id: req.params.id })
      .populate(populateFields);
    Res.ResRend(res, true, supplier);
  } catch (error) {
    Res.ResRend(res, false, error);
  }
});

router.post("/", async function (req, res, next) {
  try {
    var newsupplier = new supplierModel({
      name: req.body.name,
      logo: req.body.logo,
    });
    await newsupplier.save();
    Res.ResRend(res, true, newsupplier);
  } catch (error) {
    Res.ResRend(res, false, error);
  }
});
router.put("/:id", async function (req, res, next) {
  try {
    var supplier = await supplierModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    Res.ResRend(res, true, supplier);
  } catch (error) {
    Res.ResRend(res, false, error);
  }
});

router.delete("/:id", async function (req, res, next) {
  try {
    var supplier = await supplierModel.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      {
        new: true,
      }
    );
    Res.ResRend(res, true, supplier);
  } catch (error) {
    Res.ResRend(res, false, error);
  }
});

module.exports = router;
