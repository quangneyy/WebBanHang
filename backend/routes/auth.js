var express = require('express');
var router = express.Router();
var userModel = require('../schemas/user')
var Res = require('../helpers/ResRender');
var { validationResult } = require('express-validator');
var checkUser = require('../validators/auth')
var bcrypt = require("bcrypt")


router.post('/login', async function (req, res, next) {
  let username = req.body.username;
  let password = req.body.password;
  if (!username || !password) {
    Res.ResRend(res, false, "Vui lòng nhập đầy đủ thông tin");
    return;
  }
  let user = await userModel.findOne({ username: username })
  if (!user) {
    Res.ResRend(res, false, "Username không tồn tại");
    return;
  }
  let result = bcrypt.compareSync(password, user.password);
  if (result) {
    Res.ResRend(res, true, user.genJWT());
  } else {
    Res.ResRend(res, false, "Username hoặc passowrd không đúng");
  }
});

router.post('/register', checkUser(), async function (req, res, next) {//3
  var result = validationResult(req);
  if (result.errors.length > 0) {
    Res.ResRend(res, false, result.errors);
    return;
  }
  try {
    var newUser = new userModel({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      role: ["user"]
    })
    await newUser.save();
    Res.ResRend(res, true, newUser)
  } catch (error) {
    Res.ResRend(res, false, error)
  }
});

module.exports = router;