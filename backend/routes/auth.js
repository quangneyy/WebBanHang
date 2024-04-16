var express = require('express');
var router = express.Router();
var userModel = require('../schemas/user')
var Res = require('../helpers/ResRender');
var { validationResult } = require('express-validator');
var checkUser = require('../validators/auth')
var bcrypt = require("bcrypt")
var checkLogin = require('../middlewares/checkLogin');
const changpassword = require('../validators/changpassword');
const sendMail = require('../helpers/sendMail')
require('express-async-errors')


router.post('/resetpassword/:token',async function (req, res, next) {
  let user = await userModel.findOne({
    tokenResetPassword: req.params.token
  })
  if (!user) {
    Res.ResRend(res, false, "URL không hợp lệ!")
    return;
  }
  if (user.tokenResetPasswordExp > Date.now) {
    Res.ResRend(res, false, "URL không hợp lệ!")
    return;
  }
  user.password = req.body.password;
  user.tokenResetPassword = undefined;
  user.tokenResetPasswordExp = undefined;
  await user.save();
  Res.ResRend(res, true, "Cập nhật thành công!")
});

router.post('/forgotpassword', async function (req, res, next) {
  let user = await userModel.findOne({
    email: req.body.email
  })
  if (!user) {
    Res.ResRend(res, false, "Email không tồn tại!")
    return;
  }
  let token = user.genResetToken();
  await user.save();
  let url = `http://localhost:3000/auth/resetpassword/${token}`;
  await sendMail(user.email,url);
  Res.ResRend(res, true, "Gửi email thành công")
});

router.get('/me', checkLogin, async function (req, res, next) {
  Res.ResRend(res, true, req.user)
});

router.post('/changepassword', checkLogin, changpassword(), async function (req, res, next) {
  let result = validationResult(req);
  if (result.errors.length > 0) {
    Res.ResRend(res, false, result.errors)
    return;
  }
  let userPassword = req.user.password;
  if (bcrypt.compareSync(req.body.oldpassword, userPassword)) {
    let user = await userModel.findById(req.user._id);
    user.password = req.body.newpassword;
    await user.save();
    Res.ResRend(res, true, "Đổi Password thành công")
  } else {
    Res.ResRend(res, false, "Mật khẩu cũ sai")
  }
});

router.post('/login', async function (req, res, next) {
  let username = req.body.username;
  let password = req.body.password;
  if (!username || !password) {
    Res.ResRend(res, false, "Vui lòng nhập đủ thông tin");
    return;
  }
  let user = await userModel.findOne({ username: username })
  if (!user) {
    Res.ResRend(res, false, "Username hoặc Password không tồn tại");
    return;
  }
  let result = bcrypt.compareSync(password, user.password);
  if (result) {
    let token = user.genJWT();
    res.status(200).cookie("kento", token, {
      expires: new Date(Date.now() + 3600 * 1000),
      httpOnly: true
    }).send({
      success: true,
      data: token
    })
  } else {
    Res.ResRend(res, false, "Username hoặc Password không tồn tại");
  }
});

router.post('/logout', checkLogin, async function (req, res, next) {
  res.status(200).cookie("kento", 'null', {
    expires: new Date(Date.now() + 1000),
    httpOnly: true
  }).send({
    success: true,
    data: "Đăng xuất thành công"
  })
})

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
    Res.ResRend(res, true, "Đăng ký thành công")
  } catch (error) {
    Res.ResRend(res, false, error)
  }
});

module.exports = router;