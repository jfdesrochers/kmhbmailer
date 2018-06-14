const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const MemoryStore = require('memorystore')(session)
const favicon = require('serve-favicon')
var passport = require('passport')
var ActiveDirectoryStrategy = require('passport-activedirectory')
const app = express()
const path = require('path')
const env = require('./env.json')

const actions = require('./server/actions')

app.use('/assets', express.static('assets'))
app.use(favicon(path.join(__dirname, 'assets', 'img', 'favicon.ico')))
app.use(session({
    store: new MemoryStore({
        checkPeriod: 86400000
    }),
    secret: env.SESSIONSECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(bodyParser.json({limit: '5mb'}))
app.use(passport.initialize())
app.use(passport.session())

passport.use(new ActiveDirectoryStrategy({
    integrated: false,
    ldap: {
        url: env.LDAP_URL,
        baseDN: env.LDAP_DN,
        username: env.LDAP_USER,
        password: env.LDAP_PASS
    }
}, function (profile, ad, done) {
    ad.isUserMemberOf(profile._json.dn, 's KMHBMailer Privileged', function (err, isMember) {
        if (err) return done(err)
        profile.isPrivileged = isMember
        return done(null, profile)
    })
}))
  
passport.serializeUser(function (user, done) {
    done(null, user)
})

passport.deserializeUser(function (user, done) {
    done(null, user)
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})

app.post('/login', (req, res) => {
    passport.authenticate('ActiveDirectory', (err, user, info) => {
        if (err) {
            if (err.name === 'InvalidCredentialsError') {
                return res.status(401).json({status: 'error', message: 'E_NotAuthenticated - Not Authenticated'})
            } else {
                console.error(err)
                return res.status(500).json({status: 'error', message: err.message})
            }
        }
        if (!user) {
            return res.status(401).json({status: 'error', message: 'E_NotAuthenticated - Not Authenticated'})
        }
        req.logIn(user, (err) => {
            if (err) {
                console.error(err)
                return res.status(500).json({status: 'error', message: err.message})
            }
            let authUser = {
                'displayName': user.displayName,
                'firstName': user.name.givenName,
                'lastName': user.name.familyName,
                'email': user._json.mail,
                'jobTitle': user._json.title,
                'accountName': user._json.sAMAccountName
            }
            return res.json({status: 'success', data: authUser})
        })
    })(req, res)
})

app.post('/api/:endpoint', (req, res) => {
    res.contentType = 'application/json'
    let endpoint = (req.params.endpoint || '').split('.')
    let authUser = null
    if (req.isAuthenticated) {
        authUser = req.user
    }
    if (endpoint.length !== 2) {
        return res.status(400).json({'status': 'error', 'message': 'E_MalformedRequest - The request is not properly formed.'})
    }
    if (!(endpoint[0] in actions) || !(endpoint[1] in actions[endpoint[0]])) {
        return res.status(400).json({'status': 'error', 'message': 'E_EndpointNotFound - Wrong endpoint.'})
    }
    actions[endpoint[0]][endpoint[1]](req.body, authUser).then((data) => {
        res.json({'status': 'success', 'data': data})
    }).catch((err) => {
        res.status(500).json({status: 'error', 'message': err})
    })
})

const port = process.env.PORT || 8082

app.listen(port, function () {
    console.log(`Server started at port ${port}...`)
})