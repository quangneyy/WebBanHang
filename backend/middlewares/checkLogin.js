var Res = require('../helpers/ResRender');
var jwt = require('jsonwebtoken')
var config = require('../configs/config')
var userModel = require('../schemas/user')

module.exports = async function (req, res, next) {
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        let token = req.headers.authorization.split(" ")[1];
        try {
            var result = jwt.verify(token, config.JWT_SECRETKEY);
            if (result.exp * 1000 >= Date.now()) {
                let user = await userModel.findById(result.id);
                req.user = user;
                next();
            } else {
                Res.ResRend(res, false, "Bạn chưa đăng nhập");
                return;
            }
        } catch (error) {
            Res.ResRend(res, false, "Bạn chưa đăng nhập");
            return;
        }
    } else {
        Res.ResRend(res, false, "Bạn chưa đăng nhập");
        return;
    }
}