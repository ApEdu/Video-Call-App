const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: "hotmail",
    auth: {
        user: "webDev-169@outlook.com",
        pass: "MerRatio12"
    }
});

module.exports = transporter

