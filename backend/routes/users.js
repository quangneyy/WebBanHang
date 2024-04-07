var express = require('express');
var router = express.Router();
var userModel = require('../schemas/user')
var Res = require('../helpers/ResRender');
var { validationResult } = require('express-validator');
var checkUser = require('../validators/user')
var checkLogin = require('../middlewares/checkLogin');

router.get('/',checkLogin, async function (req, res, next) {
  let sortObj = {};
  let exclude = ["sort", "page", "limit"];
  let StringArray = ["username", "email"];
  let objQueries = JSON.parse(JSON.stringify(req.query));
  for (const [key, value] of Object.entries(objQueries)) {
    if (exclude.includes(key)) {
      delete objQueries[key];
    } else {
      if (StringArray.includes(key)) {
        objQueries[key] = new RegExp(value.replace(',', '|'), 'i');
      }
    }
  }
  objQueries.isDeleted = false;
  if (req.query.sort) {
    if (req.query.sort.startsWith('-')) {
      let field = req.query.sort;
      field = field.substring(1, field.length);
      sortObj[field] = -1;
    } else {
      let field = req.query.sort;
      console.log(req.query.sort);
      sortObj[field] = 1;
    }
  }
  let page = req.query.page ? req.query.page : 1;
  let limit = req.query.limit ? req.query.limit : 5;
  var users = await userModel.find(
    objQueries)
    .skip((page - 1) * limit).limit(limit)
    .sort(sortObj);
  res.send(users);
});

router.get('/:id', async function (req, res, next) {
  try {
    var user = await userModel.find({ _id: req.params.id });
    Res.ResRend(res, true, user);
  } catch (error) {
    Res.ResRend(res, false, error);
  }
});
router.get('/:id', async function (req, res, next) {
  try {
    let user = await userModel.find({ _id: req.params.id }).exec();
    Res.ResRend(res, true, user)
  } catch (error) {
    Res.ResRend(res, false, error)
  }
});

router.post('/', checkUser(), async function (req, res, next) {//3
  var result = validationResult(req);
  if (result.errors.length > 0) {
    Res.ResRend(res, false, result.errors);
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
router.put('/:id', async function (req, res, next) {
  try {
    let user = await userModel.findByIdAndUpdate
      (req.params.id, req.body).exec()
    Res.ResRend(res, true, user);
  } catch (error) {
    Res.ResRend(res, false, error)
  }
});


router.delete('/:id', async function (req, res, next) {
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