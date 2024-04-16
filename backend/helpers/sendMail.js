const nodemailer = require("nodemailer");
const config = require("../configs/config");

const transporter = nodemailer.createTransport({
    host: config.Host,
    port: config.Port,
    secure: false,
    auth: {
        user: config.Username,
        pass: config.Password,
    },
});

module.exports = async function (mailDes, url) {
    const info = await transporter.sendMail({
        from: 'WEB BÁN HÀNG', 
        to: mailDes, 
        subject: "Yêu cầu đổi lại mật khẩu", 
        html: "<a href=" + url + ">Nhấp vào đây để đổi mật khẩu</a>", 
    });
}
