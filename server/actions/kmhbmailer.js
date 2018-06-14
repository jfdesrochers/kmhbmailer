const sMail = require('../../mail')
const Mustache = require('mustache')
const fs = require('fs')
const path = require('path')
const forms = require('../forms')

const kmhbmailer = {}

const processTags = function (s, fields) {
    return s.replace(/\$\[(\w+)\]/g, function (match, param) {
        return fields[param]
    })
}

kmhbmailer.sendMail = function (data, authUser) {
    return new Promise((resolve, reject) => {
        let form = forms[data.formname]
        if (!form) return reject('E_NotFound - Form not found')
        if (form.authentication.required) {
            if (!authUser) {
                return reject('E_NotAuthenticated - User not authenticated')
            } else if (form.authentication.authorizedOnly && !authUser.isPrivileged) {
                return reject('E_NotAuthorized - User not authorized')
            }
        }
        data.fields.authUser = authUser.displayName
        let dest = [form.mailOptions.destination]
        if (typeof form.mailOptions.showCC === 'string') {
            dest.push(data.fields[form.mailOptions.showCC])
        } else if (form.mailOptions.showCC === true && data.fields['mailCC']) {
            dest.push(data.fields['mailCC'])
        }
        let subject = processTags(form.mailOptions.subject, data.fields)

        fs.readFile(path.join(__dirname, '..', 'forms', form.mailOptions.template), (err, template) => {
            if (err) {return reject(err.message)}
            const rendered = Mustache.render(template.toString('utf8'), data.fields)
            sMail(dest, subject, data.text, rendered, function (err) {
                if (err) {return reject(err)}
                resolve()
            })
        })
    })
}

kmhbmailer.renderPreview = function (data, authUser) {
    return new Promise((resolve, reject) => {
        let form = forms[data.formname]
        if (!form) return reject('E_NotFound - Form not found')
        if (form.authentication.required) {
            if (!authUser) {
                return reject('E_NotAuthenticated - User not authenticated')
            } else if (form.authentication.authorizedOnly && !authUser.isPrivileged) {
                return reject('E_NotAuthorized - User not authorized')
            }
        }
        data.fields.authUser = authUser.displayName
        fs.readFile(path.join(__dirname, '..', 'forms', form.mailOptions.template), (err, template) => {
            if (err) {return reject(err.message)}
            const rendered = Mustache.render(template.toString('utf8'), data.fields)
            resolve(rendered)
        })
    })
}

kmhbmailer.retrieveForm = function (data, authUser) {
    return new Promise((resolve, reject) => {
        if (data.formname in forms) {
            let form = Object.assign({}, forms[data.formname])
            if (form.authentication.required) {
                if (!authUser) {
                    return reject('E_NotAuthenticated - User not authenticated')
                } else if (form.authentication.authorizedOnly && !authUser.isPrivileged) {
                    if (form.authentication.authorizedOnly && !form.authentication.authorizedUsers[authUser._json.sAMAccountName.toLowerCase()])
                    return reject('E_NotAuthorized - User not authorized')
                }
            }
            if (form['mailOptions']['showCC'] === true) {
                form['showCC'] = true
            }
            delete form['mailOptions']
            delete form['authentication']
            resolve(form)
        } else {
            reject('E_NotFound - Form not found')
        }
    })
}

module.exports = kmhbmailer