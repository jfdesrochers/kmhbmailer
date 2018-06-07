const m = require('mithril')
const {InputField, SelectField} = require('../js/utils/forms')

const FormBuilder = {}

FormBuilder.oninit = function (vnode) {
    const self = this
    self.form = vnode.attrs.form
    self.fieldSet = {}
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
                            fieldSet: self.fieldSet
                        })) : m(InputField, Object.assign(fld, {
                            key: fld.name,
                            fieldSet: self.fieldSet
                        }))
                    })
                ]
            })
        ]),
        m('.mb-2', [
            (self.form.mailOptions.showCC) ? m(InputField, {
                name: 'mailCC',
                fieldSet: self.fieldSet,
                label: 'Send a copy of the form to the following email address',
                defaultValue: '',
                regEx: /^(([A-Z|a-z|0-9](\.|_){0,1})+[A-Z|a-z|0-9]\@([A-Z|a-z|0-9])+((\.){0,1}[A-Z|a-z|0-9]){2}\.[a-z]{2,3})?$/,
                helpText: 'Please enter an email address (optional).',
                errorText: 'Please enter a valid email address.'
            }) : '',
            m('button.btn.btn-primary.mr-2', 'Send Email'),
            m('button.btn.btn-success', 'Print or Preview'),
            m('button.btn.btn-danger.float-right', 'Reset Form'),
        ]),
        m('p', 'For any technical issue, please contact the IT Department.')
    ])))
}

const createFormBuilder = function (form) {
    return {view: () => m(FormBuilder, {form: form})}
}

module.exports = createFormBuilder