const request = require('request')

const vmstool = {}

vmstool.getCDR = function (data) {
    const options = {
        url: 'https://voip.ms/api/v1/rest.php',
        qs: {
            api_username: data.acctemail,
            api_password: data.acctpass,
            method: 'getCDR',
            date_from: data.datefrom,
            date_to: data.dateto,
            timezone: '-5',
            answered: '1',
            noanswer: '0',
            busy: '0',
            failed: '0',
            calltype: data.acctphone,
            callbilling: 'billed'
        }
    }
    return new Promise((resolve, reject) => {
        request(options, function (error, response, body) {
            if (error) return reject(error)
            if (response.statusCode !== 200) return reject(response.statusMessage)
            body = JSON.parse(body)
            if (body.status !== 'success') return reject(body.status)
            return resolve(body)
        });
    })
}

module.exports = vmstool