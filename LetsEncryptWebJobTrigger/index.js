const querystring = require('querystring');
const https = require('https');

const LETSENCRYPT_WEBJOB_USER = process.env['LETSENCRYPT_WEBJOB_USER'];
const LETSENCRYPT_WEBJOB_PASS = process.env['LETSENCRYPT_WEBJOB_PASS'];
const LETSENCRYPT_WEBJOB_APPNAME = process.env['LETSENCRYPT_WEBJOB_APPNAME'];
const LETSENCRYPT_WEBJOB_JOBNAME = process.env['LETSENCRYPT_WEBJOB_JOBNAME'];

function triggerWebJob (logFunc) {    
    return new Promise((resolve, reject) => {
        auth = "Basic " + Buffer.from(LETSENCRYPT_WEBJOB_USER + ":" + LETSENCRYPT_WEBJOB_PASS).toString("base64");
        var options = {
            hostname: LETSENCRYPT_WEBJOB_APPNAME + '.scm.azurewebsites.net',
            port: 443,
            path: '/api/triggeredwebjobs/' + LETSENCRYPT_WEBJOB_JOBNAME + '/run',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': 0
            }
        };
        
        var req = https.request(options, (res) => {
            logFunc('statusCode:', res.statusCode);
            logFunc('headers:', res.headers);
        
            res.on('data', (d) => {
                logFunc(d);
            });
            res.on('end', function () {
                logFunc('end');
                resolve({});
            });
        });
        
        req.on('error', (e) => {
            logFunc(e);
        });
    
        req.end();                
    });
}

module.exports = async function (context, myTimer) {
    var timeStamp = new Date().toISOString();

    if (myTimer.isPastDue) {
        context.log('JavaScript is running late!');
    }
    context.log('trigger function ran!', timeStamp);
    await triggerWebJob(context.log);
    context.log('trigger function finish!', timeStamp);
};