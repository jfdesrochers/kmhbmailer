const m = require('mithril')
const {InputField, SelectField, serializeFieldSet, deserializeFieldSet, resetValidation, validateFieldSet, resetFieldSet} = require('../js/utils/forms')

const FormBuilder = {}

FormBuilder.oninit = function (vnode) {
    const self = this
    self.form = vnode.attrs.form
    self.fieldSet = {}
    self.clearError = function () {
        self.error = {message: '', details: ''}
    }
    self.clearError()
    self.isLoading = false

    self.scrollPage = function () {
        window.scrollTo(0,document.body.scrollHeight)
    }

    self.processTags = function (s, fields) {
        return s.replace(/\$\[(\w+)\]/g, function (match, param) {
            return fields[param]
        })
    }

    self.sendEmail = function () {
        self.clearError()
        if (!validateFieldSet(self.fieldSet)) {
            self.error.message = 'Some of your fields contain invalid data. Please make sure you have properly filled the form before you continue.'
            self.error.details = 'EInvalidData'
            return
        }
        const fields = serializeFieldSet(self.fieldSet)
        self.isLoading = true
        let dest = [self.form.mailOptions.destination]
        if (typeof self.form.mailOptions.showCC === 'string') {
            dest.push(fields[self.form.mailOptions.showCC])
        } else if (self.form.mailOptions.showCC === true && fields['mailCC']) {
            dest.push(fields['mailCC'])
        }
        let subject = self.processTags(self.form.mailOptions.subject, fields)
        let textdata = ''
        Object.keys(fields).forEach((o) => {
            textdata += o + ': ' + fields[o] + '\n'
        })
        m.request('api/kmhbmailer.sendMail', {
            method: 'post',
            data: {
                dest: dest,
                subject: subject,
                text: textdata,
                template: self.form.template,
                fields: fields
            }
        }).then((template) => {
            self.isLoading = false
            if (template.status !== 'success') {
                self.error.message = 'Could not load the required files to do this operation. Please try again and contact the IT department if you need further assistance.'
                self.error.details = template.message
            } else {
                resetFieldSet(self.fieldSet)
            }
        }).catch((err) => {
            self.isLoading = false
            self.error.message = 'Could not load the required files to do this operation. Please try again and contact the IT department if you need further assistance.'
            self.error.details = String(err)
            console.log(err)
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
                template: self.form.template,
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
            console.log(err)
        })
    }

    self.resetForm = function () {
        self.clearError()
        resetFieldSet(self.fieldSet)
    }
}

FormBuilder.view = function () {
    const self = this
    return m('.container', m('.row.justify-content-center', m('.col-md-10.col-lg-8', [
        m('.row.align-items-center.mt-2.mb-3.d-print-none', [
            m('.col-auto', m('img.top-logo', {src: '/assets/img/logokmhb.png'})),
            m('.col', [
                m('h2.mb-0.mt-1', self.form.title),
                m('p', self.form.subtitle)
            ])
        ]),
        m('.jumbotron.d-print-none.py-4.px-3', [
            self.form.sections.map((sect) => {
                return [
                    m('h3', sect.title),
                    m('p.lead', sect.subtitle),
                    sect.fields.map((fld) => {
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
                ]
            })
        ]),
        m('.mb-2', [
            (self.form.mailOptions.showCC === true) ? m(InputField, {
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
    ])))
}

const createFormBuilder = function (form) {
    return {view: () => m(FormBuilder, {form: form})}
}

module.exports = createFormBuilder