const m = require('mithril')
const {InputField, serializeFieldSet, resetValidation, validateFieldSet, resetFieldSet} = require('../utils/forms')

const LoginForm = {}

LoginForm.oninit = function (vnode) {
    const self = this
    self.onLoginSuccess = vnode.attrs.onLoginSuccess
    self.fieldSet = {}
    self.clearError = function () {
        self.error = {message: '', details: ''}
    }
    self.clearError()
    self.isLoading = false

    self.doLogin = function (e) {
        e.preventDefault()
        self.clearError()
        if (!validateFieldSet(self.fieldSet)) {
            self.error.message = 'Some of your fields contain invalid data. Please make sure you have properly filled the form before you continue.'
            self.error.details = ''
            return
        }
        const fields = serializeFieldSet(self.fieldSet)
        self.isLoading = true
        m.request('login', {
            method: 'post',
            data: fields
        }).then((user) => {
            self.isLoading = false
            self.onLoginSuccess(user)
        }).catch((err) => {
            self.isLoading = false
            let msg = err.message ? String(err.message) : String(err)
            if (msg.indexOf('E_NotAuthenticated') > -1) {
                self.error.message = 'The authentication was unsuccessful. Please check your credentials and try again.'
                self.error.details = msg
            } else {
                self.error.message = 'A server error occured. Please try again.'
                self.error.details = msg
                console.error(err)
            }
        })
    }
}

LoginForm.view = function () {
    const self = this
    return m('.container', m('.row.justify-content-center', m('.col-md-10.col-lg-8', [
        m('.row.align-items-center.mt-2.mb-3.d-print-none', [
            m('.col-auto', m('img.top-logo', {src: '/assets/img/logokmhb.png'})),
            m('.col', [
                m('h2.mb-0.mt-1', 'KMHB Mailer'),
                m('p', 'KMHB Mailer takes care of emailing the required forms to the correct recipients. All you have to do is fill them!')
            ])
        ]),
        m('.row.justify-content-center', m('.col-md-10.col-xl-8', m('.jumbotron.d-print-none.py-4.px-3.justify-content-center.text-center', [
            m('h2', 'Login'),
            m('p.lead', 'Please enter your credentials below. They are the same as those you use elsewhere on the network.'),
            m('.mt-3.mb-3', [
                m(InputField, {
                    name: 'username',
                    autofocus: true,
                    fieldSet: self.fieldSet,
                    center: true,
                    label: 'Username',
                    defaultValue: '',
                    regEx: '^.+$',
                    helpText: 'Please enter your username.',
                    errorText: 'Please enter a valid username.',
                    disabled: self.isLoading
                }),
                m(InputField, {
                    name: 'password',
                    fieldSet: self.fieldSet,
                    center: true,
                    label: 'Password',
                    type: 'password',
                    defaultValue: '',
                    regEx: '^.+$',
                    helpText: 'Please enter your password.',
                    errorText: 'Please enter a password.',
                    disabled: self.isLoading
                }),
                m('button.btn.btn-primary', {onclick: self.doLogin, disabled: self.isLoading}, 'Login'),
                self.error.message !== '' ? m('.alert.alert-danger.d-print-none.mt-2', [
                    m('h4.alert-heading', 'Error'),
                    m('p', self.error.message),
                    m('hr.mb-1'),
                    m('small.mb-0.text-muted', self.error.details)
                ]) : self.isLoading ? m('.row.justify-content-center.d-print-none.mb-5.mt-5', m('.col-8.text-center.font-weight-bold', [
                    m('p', 'Logging you in, please wait...'),
                    m('.progress', m('.progress-bar.progress-bar-striped.progress-bar-animated.bg-info', {style: 'width: 100%;'}))
                ])) : ''
            ]),
            m('p', 'For any technical issue, please contact the IT Department.')
        ])))
    ])))
}

module.exports = LoginForm