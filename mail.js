const mailer = require('nodemailer')
const env = require('./env.json')

const sendMail = function (dest, subject, text, html, callback) {
    const mailTransport = mailer.createTransport({
        host: env.SMTP_SERVER,
        secure: false,
        port: 587,
        tls: {
            cipher:'SSLv3',
            rejectUnauthorized: false
        },
        auth: {
              user: env.SMTP_USER,
              pass: env.SMTP_PASSWORD
        }
    })
    
    const mailOptions = {
        from: env.MAIL_FROM,
        to: dest,
        subject: subject,
        text: text,
        html: html
    };
    
    mailTransport.sendMail(mailOptions, callback)
}

module.exports = sendMail