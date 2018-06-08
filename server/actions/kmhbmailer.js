const sMail = require('../../mail')
const Mustache = require('mustache')
const fs = require('fs')
const path = require('path')

const kmhbmailer = {}

kmhbmailer.sendMail = function (data) {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, '..', 'templates', data.template), (err, template) => {
            if (err) {return reject(err.message)}
            const rendered = Mustache.render(template.toString('utf8'), data.fields)
            sMail(data.dest, data.subject, data.text, rendered, function (err) {
                if (err) {return reject(err)}
                resolve()
            })
        })
    })
}

kmhbmailer.renderPreview = function (data) {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, '..', 'templates', data.template), (err, template) => {
            if (err) {return reject(err.message)}
            const rendered = Mustache.render(template.toString('utf8'), data.fields)
            resolve(rendered)
        })
    })
}

module.exports = kmhbmailer