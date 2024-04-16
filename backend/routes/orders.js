var express = require('express');
var router = express.Router();
var orderModel = require('../schemas/order')
var Res = require('../helpers/ResRender');
var checkLogin = require('../middlewares/checkLogin');
var checkRole = require('../middlewares/checkRole');
var Query = require('../helpers/QueryHandler');
var checkProduct = require('../middlewares/checkProduct');
var productModel = require('../schemas/product');
var discountcodeModel = require('../schemas/discountcode');
require('express-async-errors')

const populateFields = [
  { path: "user", select: "_id username" },
  { path: "items.product", select: "_id name" } 
];

router.get("/", async function (req, res, next) {
  let objQueries = Query.ProcessQueries(req);
  let sortObj = Query.ProcessSortQuery(req);
  let { page, limit } = Query.GetPageAndLimit(req);
  try {
    var orders = await orderModel
      .find(objQueries)
      .populate(populateFields)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(sortObj);
    res.send(orders);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async function (req, res, next) {
  var order = await orderModel.find({ _id: req.params.id }).populate(populateFields);
  Res.ResRend(res, true, order);
});

router.post('/', checkLogin, checkProduct, async function (req, res, next) {
  let session = null;
  try {
      session = await productModel.startSession();
      session.startTransaction();

      let insufficientProducts = [];
      for (const item of req.body.items) {
          const product = await productModel.findById(item.product).session(session);
          if (!product || product.quantity < item.quantity) {
              insufficientProducts.push(item);
          } else {
              product.quantity -= item.quantity;
              await product.save();
          }
      }

      if (insufficientProducts.length > 0) {
          throw { message: 'Sản phẩm không đủ số lượng', insufficientProducts };
      }

      let totalAmount = 0;
      req.body.items.forEach(item => {
          totalAmount += item.quantity * item.price;
      });

      let discountAmount = 0;
      if (req.body.discount) {
          const discount = await discountcodeModel.findOne({ code: req.body.discount });
          if (discount) {
              discountAmount = (totalAmount * discount.discountPercentage) / 100;
              totalAmount -= discountAmount;
          }
      }
      var neworder = new orderModel({
          user: req.user.id,
          items: req.body.items,
          totalAmount: totalAmount,
          status: req.body.status || 'Đang chờ xử lý',
          isPaid: req.body.isPaid || false
      });
      await neworder.save();

      await session.commitTransaction();
      Res.ResRend(res, true, neworder);
  } catch (error) {
      if (session) {
          await session.abortTransaction();
      }
      Res.ResRend(res, false, error);
  } finally {
      if (session) {
          session.endSession();
      }
  }
});


router.put('/:id', checkLogin, checkRole("ADMIN"), async function (req, res, next) {
  try {
    var order = await orderModel.findByIdAndUpdate(req.params.id,
      req.body, {
      new: true
    });
    Res.ResRend(res, true, order);
  } catch (error) {
    Res.ResRend(res, false, error);
  }
});

router.delete('/:id', checkLogin, checkRole("ADMIN"), async function (req, res, next) {
  try {
    var order = await orderModel.findByIdAndUpdate(req.params.id,
      { isDeleted: true }, {
      new: true
    });
    Res.ResRend(res, true, order);
  } catch (error) {
    Res.ResRend(res, false, error);
  }
});


module.exports = router;
