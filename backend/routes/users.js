var express = require('express');
var router = express.Router();
var userModel = require('../schemas/user')
var Res = require('../helpers/ResRender');
var { validationResult } = require('express-validator');
var checkUser = require('../validators/user')
var checkLogin = require('../middlewares/checkLogin');
var checkRole = require('../middlewares/checkRole');
var checkLogin = require('../middlewares/checkLogin');
var checkRole = require('../middlewares/checkRole');
var ValidateError = require('../errors/ValidateErrors')
var Query = require('../helpers/QueryHandler');
const bcrypt = require('bcrypt');

router.get('/', checkLogin, checkRole("ADMIN"), async function (req, res, next) {
  let StringArray = ["username"];
  let objQueries = Query.ProcessQueriesUser(req,StringArray);
  let sortObj = Query.ProcessSortQuery(req);
  let { page, limit } = Query.GetPageAndLimit(req);
  try {
    var users = await userModel
      .find(objQueries)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(sortObj);
    res.send(users);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', checkLogin, checkRole("ADMIN"), async function (req, res, next) {
  try {
    let user = await userModel.find({ _id: req.params.id }).exec();
    Res.ResRend(res, true, user)
  } catch (error) {
    Res.ResRend(res, false, error)
  }
});

router.post('/',checkLogin, checkRole("ADMIN"), checkUser(), async function (req, res, next) {//3
  var result = validationResult(req);
  if (result.errors.length > 0) {
    throw new ValidateError(result)
    return;
  }
  try {
    var newUser = new userModel({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email
    })
    await newUser.save();
    Res.ResRend(res, true, newUser)
  } catch (error) {
    Res.ResRend(res, false, error)
  }
});
router.put('/:id', checkLogin, async function (req, res, next) {
  try {
    let user = await userModel.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec();
    await user.save(); 
    Res.ResRend(res, true, user);
  } catch (error) {
    Res.ResRend(res, false, error);
  }
});
router.delete('/:id',checkLogin, checkRole("ADMIN"), async function (req, res, next) {
  try {
    let user = await userModel.findByIdAndUpdate
      (req.params.id, {
        status: false
      }, {
        new: true
      }).exec()
    Res.ResRend(res, true, user);
  } catch (error) {
    Res.ResRend(res, false, error)
  }
});

module.exports = router;