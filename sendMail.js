const nodemailer = require('nodemailer')
let transporter = nodemailer.createTransport({
    service: 'qq',
    port: 465,
    secureConnection: true,
    auth: {
        user: '83687401@qq.com',
        pass: 'xxxxx'
    }
})
function sendMail (message) {
    let mailOptions = {
        from: '"83687401" <83687401@qq.com>', // 发送地址
        to: '83687401@qq.com', // 接收者
        subject: '部署通知',    // 主题
        html: message // 内容主体
    }
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error)
        }
        console.log('Massage send: %s', info.messageId)
    })
}
module.exports = sendMail