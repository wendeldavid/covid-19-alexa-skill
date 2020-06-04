var http = require('http');

const AWS = require('aws-sdk');

const s3SigV4Client = new AWS.S3({
    signatureVersion: 'v4'
});

module.exports.getS3PreSignedUrl = function getS3PreSignedUrl(s3ObjectKey) {

    const bucketName = process.env.S3_PERSISTENCE_BUCKET;
    const s3PreSignedUrl = s3SigV4Client.getSignedUrl('getObject', {
        Bucket: bucketName,
        Key: s3ObjectKey,
        Expires: 60*1 // the Expires is capped for 1 minute
    });
    console.log(`Util.s3PreSignedUrl: ${s3ObjectKey} URL ${s3PreSignedUrl}`);
    return s3PreSignedUrl;

}

function httpGet(query, callback) {
    var options = {
        host: 'brasil.io',
        path: '/' + encodeURIComponent(query),
        method: 'GET',
    };

    var req = http.request(options, res => {
        res.setEncoding('utf8');
        var responseString = "";
        
        //accept incoming data asynchronously
        res.on('data', chunk => {
            responseString = responseString + chunk;
        });
        
        //return the data when streaming is complete
        res.on('end', () => {
            console.log(responseString);
            callback(responseString);
        });

    });
    req.end();
}

const getAllStates = function(callback) {
    const reqOptions = {
        host: 'brasil.io',
        path: '/' + encodeURIComponent('/api/dataset/covid19/caso/data?is_last=True&place_type=state'),
        method: 'GET'
    };
    
    return new Promise((resolve, reject) => {
        const covidReq = http.request(reqOptions, (response) => {
            const covidData = [];
            response.on('data', (data) => {
                covidData.push(data);
            });
            response.on('end', (end) => {
                const responseString = covidData.join('');
                resolve(responseString);
            });
        });
        covidReq.on('error', (error) => {
            reject(error);
        });
        covidReq.end();
    });
}


