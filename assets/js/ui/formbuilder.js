const m = require('mithril')
const {InputField, SelectField, serializeFieldSet, deserializeFieldSet, resetValidation, validateFieldSet, resetFieldSet} = require('../utils/forms')
const LoginForm = require('./login')

const FormBuilder = {}

// Conditions of format: {'fieldname': {'op': 'val'}}
// op can be: eq, neq, gt, lt, gte, lte
const processConditions = function (conditions, fieldset) {
    if (!conditions) return true
    return conditions.every((c) => {
        let fieldname = Object.keys(c)[0]
        if (!fieldset[fieldname]) return false
        let op = Object.keys(c[fieldname])[0]
        let val = c[fieldname][op]
        let s = fieldset[fieldname].value
        switch (op) {
            case 'eq':  return (s === val)
            case 'neq': return (s !== val)
            case 'gt': return (s > val)
            case 'lt': return (s < val)
            case 'gte': return (s >= val)
            case 'lte': return (s <= val)
        }
    })
}

FormBuilder.oninit = function (vnode) {
    const self = this
    self.formname = m.route.param('form')
    self.clearError = function () {
        self.error = {message: '', details: ''}
    }
    self.clearError()
    self.isLoading = false
    self.sendSuccess = false

    self.scrollPage = function () {
        window.scrollTo(0,document.body.scrollHeight)
    }

    self.retrieveForm = function (user) {
        self.form = null
        self.clearError()
        self.loginUser = user || {}
        self.fieldSet = {}
        self.loginRequired = false
        m.request('api/kmhbmailer.retrieveForm', {
            method: 'post',
            data: {
                formname: self.formname
            }
        }).then((res) => {
            if (res.status === 'success') {
                self.form = res.data
            } else {
                self.error.message = 'A server error occured while retrieving your form. Please try again or contact the IT department if your need further assistance.'
                self.error.details = res.message
                console.error(res.message)
            }
        }).catch((err) => {
            const msg = err.message ? String(err.message) : String(err)
            if (msg.indexOf('E_NotFound') > -1) {
                m.route.set('/')
            } else if (msg.indexOf('E_NotAuthenticated') > -1) {
                self.loginRequired = true
            } else if (msg.indexOf('E_NotAuthorized') > -1) {
                self.error.message = 'Sorry, but you are not authorized to use this form. If you believe this is a mistake, please contact your supervisor.'
                self.error.details = msg
            } else {
                self.error.message = 'A server error occured while retrieving your form. Please try again or contact the IT department if your need further assistance.'
                self.error.details = msg
            }
            console.error(err)
        })
    }

    self.retrieveForm()

    self.sendEmail = function () {
        self.clearError()
        if (!validateFieldSet(self.fieldSet)) {
            self.error.message = 'Some of your fields contain invalid data. Please make sure you have properly filled the form before you continue.'
            self.error.details = ''
            return
        }
        const fields = serializeFieldSet(self.fieldSet)
        self.isLoading = true
        let textdata = ''
        Object.keys(fields).forEach((o) => {
            textdata += o + ': ' + fields[o] + '\n'
        })
        m.request('api/kmhbmailer.sendMail', {
            method: 'post',
            data: {
                formname: self.formname,
                text: textdata,
                fields: fields
            }
        }).then((template) => {
            self.isLoading = false
            if (template.status !== 'success') {
                self.error.message = 'Could not load the required files to do this operation. Please try again and contact the IT department if you need further assistance.'
                self.error.details = template.message
            } else {
                resetFieldSet(self.fieldSet)
                self.sendSuccess = true
            }
        }).catch((err) => {
            self.isLoading = false
            self.error.message = 'Could not load the required files to do this operation. Please try again and contact the IT department if you need further assistance.'
            self.error.details = String(err)
            console.error(err)
        })
    }

    self.generatePreview = function () {
        self.clearError()
        if (!validateFieldSet(self.fieldSet)) {
            self.error.message = 'Some of your fields contain invalid data. Please make sure you have properly filled the form before you continue.'
            self.error.details = 'EInvalidData'
            return
        }
        const fields = serializeFieldSet(self.fieldSet)
        self.isLoading = true
        m.request('api/kmhbmailer.renderPreview', {
            method: 'post',
            data: {
                formname: self.formname,
                fields: fields
            }
        }).then((template) => {
            self.isLoading = false
            if (template.status !== 'success') {
                self.error.message = 'Could not load the required files to do this operation. Please try again and contact the IT department if you need further assistance.'
                self.error.details = template.message
            } else {
                let frame = document.getElementById('template')
                frame.onload = () => frame.contentWindow.print()
                frame.contentWindow.document.open()
                frame.contentWindow.document.write(template.data)
                frame.contentWindow.document.close()
            }
        }).catch((err) => {
            self.isLoading = false
            self.error.message = 'Could not load the required files to do this operation. Please try again and contact the IT department if you need further assistance.'
            self.error.details = String(err)
            console.error(err)
        })
    }

    self.resetForm = function () {
        self.clearError()
        resetFieldSet(self.fieldSet)
    }
}

FormBuilder.view = function () {
    const self = this
    return self.form ? m('.container', m('.row.justify-content-center', m('.col-md-10.col-lg-8', [
        m('.row.align-items-center.mt-2.mb-3.d-print-none', [
            m('.col-auto', m('img.top-logo', {src: '/assets/img/logokmhb.png'})),
            m('.col', [
                m('h2.mb-0.mt-1', self.form.title),
                m('p', self.form.subtitle)
            ])
        ]),
        m('.jumbotron.d-print-none.py-4.px-3', [
            self.form.sections.map((sect) => {
                return processConditions(sect.conditions, self.fieldSet) ? [
                    sect.title ? m('h3', sect.title) : '',
                    sect.subtitle ? m('p.lead', sect.subtitle) : '',
                    sect.fields.filter((fld) => {
                        return processConditions(fld.conditions, self.fieldSet)
                    }).map((fld) => {
                        return ('options' in fld) ? m(SelectField, Object.assign(fld, {
                            key: fld.name,
                            fieldSet: self.fieldSet,
                            disabled: self.isLoading
                        })) : m(InputField, Object.assign(fld, {
                            key: fld.name,
                            fieldSet: self.fieldSet,
                            disabled: self.isLoading
                        }))
                    })
                ] : ''
            })
        ]),
        m('.mb-2', [
            (self.form.showCC === true) ? m(InputField, {
                name: 'mailCC',
                fieldSet: self.fieldSet,
                label: 'Send a copy of the form to the following email address',
                defaultValue: '',
                regEx: /^(([A-Z|a-z|0-9](\.|_){0,1})+[A-Z|a-z|0-9]\@([A-Z|a-z|0-9])+((\.){0,1}[A-Z|a-z|0-9]){2}\.[a-z]{2,3})?$/,
                helpText: 'Please enter an email address (optional).',
                errorText: 'Please enter a valid email address.',
                disabled: self.isLoading
            }) : '',
            self.isLoading ? m('.row.justify-content-center.d-print-none.mb-3', {oncreate: self.scrollPage}, m('.col-8.text-center.font-weight-bold', [
                m('p', 'Your data is loading, please wait for a moment...'),
                m('.progress', m('.progress-bar.progress-bar-striped.progress-bar-animated.bg-info', {style: 'width: 100%;'}))
            ])) : '',
            self.error.message !== '' ? m('.alert.alert-danger.d-print-none', {oncreate: self.scrollPage}, [
                m('h4.alert-heading', 'Error'),
                m('p', self.error.message),
                m('hr.mb-1'),
                m('small.mb-0.text-muted', self.error.details)
            ]) : '',
            self.sendSuccess ? m('.alert.alert-success.d-print-none', {oncreate: () => {
                setTimeout(() => {
                    self.sendSuccess = false
                    m.redraw()
                }, 5000)
                self.scrollPage()
            }}, [
                m('h4.alert-heading', 'Success'),
                m('p', 'The form has been successfully sent to the proper recipients! Thank you!')
            ]) : '',
            m('button.btn.btn-primary.d-print-none.mr-2', {
                disabled: self.isLoading,
                onclick: self.sendEmail
            }, 'Send Email'),
            m('button.btn.btn-success.d-print-none', {
                disabled: self.isLoading,
                onclick: self.generatePreview
            }, 'Print Form'),
            m('button.btn.btn-danger.d-print-none.float-right', {
                disabled: self.isLoading,
                onclick: self.resetForm
            }, 'Reset Form'),
        ]),
        m('p.d-print-none', 'For any technical issue, please contact the IT Department.')
    ]))) : self.loginRequired ? m(LoginForm, {
        onLoginSuccess: (user) => {
            self.loginRequired = false
            self.retrieveForm(user)
        }
    }) : m('.container', m('.row.justify-content-center', m('.col-md-10.col-lg-8', [
        m('.row.align-items-center.mt-2.mb-3.d-print-none', [
            m('.col-auto', m('img.top-logo', {src: '/assets/img/logokmhb.png'})),
            m('.col', [
                m('h2.mb-0.mt-1', 'KMHB Mailer'),
                m('p', 'KMHB Mailer takes care of emailing the required forms to the correct recipients. All you have to do is fill them!')
            ])
        ]),
        m('.jumbotron.d-print-none.py-4.px-3', [
            m('h3', 'Retrieving your form...'),
            self.error.message !== '' ? m('.alert.alert-danger.d-print-none', [
                m('h4.alert-heading', 'Error'),
                m('p', self.error.message),
                m('hr.mb-1'),
                m('small.mb-0.text-muted', self.error.details)
            ]) : m('.row.justify-content-center.d-print-none.mb-5.mt-5', m('.col-8.text-center.font-weight-bold', [
                m('p', 'Your form is loading, please wait for a moment...'),
                m('.progress', m('.progress-bar.progress-bar-striped.progress-bar-animated.bg-info', {style: 'width: 100%;'}))
            ])),
            m('p', 'For any technical issue, please contact the IT Department.')
        ])
    ])))
}

module.exports = FormBuilder