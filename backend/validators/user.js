const e = require('express');
let { check } = require('express-validator');
let util = require('util')

let options = {
    password: {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minSymbols: 1,
        minNumbers: 1
    }, username: {
        min: 6,
        max: 42
    }, role: (["ADMIN", "user", "modifier"].map(e=>e.toLowerCase()))
}

let Notifies = {
    NOTI_EMAIL: "Email phải đúng định dạng",
    NOTI_USERNAME: "Username phải dài từ %d đến %d ký tự",
    NOTI_PASSWORD: "Password phải dài ít nhất %d ký tự, trong đó ít nhất %d số, %d chữ hoa, %d chữ thuong, %d kí tự",
    NOTI_ROLE: "Role không hợp lệ"
}


module.exports = function () {
    return [
        check('email', Notifies.NOTI_EMAIL).isEmail(),
        check("username", util.format(Notifies.NOTI_USERNAME, options.username.min, options.username.max)).isLength(options.username),
        check("password", util.format(Notifies.NOTI_PASSWORD,options.password.minLength,options.password.minNumbers,options.password.minUppercase,options.password.minLowercase,options.password.minSymbols)).isStrongPassword(options.password),
        check("role", Notifies.NOTI_ROLE).isIn(options.role)
    ]
}