const express = require('express')
const bodyParser = require('body-parser')
const favicon = require('serve-favicon')
const app = express()
const path = require('path')

const actions = require('./server/actions')

app.use('/assets', express.static('assets'))
app.use(favicon(path.join(__dirname, 'assets', 'img', 'favicon.ico')))
app.use(bodyParser.json({limit: '5mb'}))

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})

app.post('/api/:endpoint', (req, res) => {
    res.contentType = 'application/json'
    let endpoint = (req.params.endpoint || '').split('.')
    if (endpoint.length !== 2) {
        return res.status(400).json({'status': 'error', 'message': 'The request is not properly formed.'})
    }
    if (!(endpoint[0] in actions) || !(endpoint[1] in actions[endpoint[0]])) {
        return res.status(400).json({'status': 'error', 'message': 'Wrong endpoint.'})
    }
    actions[endpoint[0]][endpoint[1]](req.body).then((data) => {
        res.json({'status': 'success', 'data': data})
    }).catch((err) => {
        res.status(500).json({status: 'error', 'message': err})
    })
})

const port = process.env.PORT || 8081

app.listen(port, function () {
    console.log(`Server started at port ${port}...`)
})