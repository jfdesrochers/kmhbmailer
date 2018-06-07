const sMail = require('../../mail')

const kmhbmailer = {}

kmhbmailer.sendMail = function (data) {
    return new Promise((resolve, reject) => {
        sMail(data.dest, data.subject, '', '', function (err) {
            if (err) {return reject(err)}
            resolve()
        })
    })
}

kmhbmailer.renderPreview = function (data) {
    return new Promise((resolve, reject) => {
        
    })
}

module.exports = kmhbmailer