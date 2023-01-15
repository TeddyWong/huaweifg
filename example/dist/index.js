'use strict';
exports.handler = function (event, context, callback) {
    console.log(`${JSON.stringify(event, null, 2)}`);
    const result = {
        body: `${JSON.stringify(event, null, 2)}`,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Accept",
            "Access-Control-Allow-Methods": "GET"
        },
        statusCode: 200,
        isBase64Encoded: false
    };
    callback(null, result);
    return;
}

exports.initializer = function (context, callback) {
    console.log('initializer start');
    callback(null, '');
};