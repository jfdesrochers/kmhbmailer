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
            }),
            m('p', 'For any technical issue, please contact the IT Department.')
        ])
    ])))
}

const createFormBuilder = function (form) {
    return {view: () => m(FormBuilder, {form: form})}
}

module.exports = createFormBuilder