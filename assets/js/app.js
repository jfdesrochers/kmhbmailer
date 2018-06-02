const m = require('mithril')

const VMSTool = require('../vmstool')

m.route.prefix("")

m.route(document.getElementById('contents'), '/vmstool', {
    '/vmstool': VMSTool
})