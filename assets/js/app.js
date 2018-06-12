const m = require('mithril')
const FormBuilder = require('./ui/formbuilder')

m.route.prefix("")

const MainPage = {}

MainPage.view = function () {
    return m('.container', [
        m('.row.align-items-center.mt-2.mb-3.d-print-none', [
            m('.col-auto', m('img.top-logo', {src: '/assets/img/logokmhb.png'})),
            m('.col', [
                m('h2.mb-0.mt-1', 'KMHB Mailer by Jean-François Desrochers'),
                m('p', 'KMHB Mailer takes care of emailing the required forms to the correct recipients. All you have to do is fill them!')
            ])
        ]),
        m('.jumbotron.d-print-none.py-4.px-3', [
            m('h3', 'Welcome to KMHB Mailer!'),
            m('p.lead', 'To use this service, please enter the name of the form in the address bar, like this:'),
            m('.card.mb-2', m('.card-body', m('h4.text-monospace', [location.href, m('span.text-muted.font-italic', '[Name of the Form]')]))),
            m('p.lead', 'If you don\'t know the name of the form, please ask the person who sent it to you.'),
            m('p', 'For any technical issue, please contact the IT Department.')
        ])
    ])
}

m.route(document.getElementById('contents'), '/', {
    '/': MainPage,
    '/:form': FormBuilder
})