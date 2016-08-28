'use strict';
var HTTP_PORT = 8080;
var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY || '<PUT_YOUR_VALUE_HERE>';

// create an app
var app = require('express')();

// console logger
app.use(require('morgan')('dev'));

// serve static files
app.use('/', require('serve-static')( require('path').join(__dirname, '../') ));

// sign data
var crypto = require('crypto');
app.use('/signer', function (req, res) {
  res.send(crypto
    .createHmac('sha1', AWS_SECRET_KEY)
    .update(req.query.to_sign)
    .digest('base64')
  );
});

// start server
app.listen(HTTP_PORT, function () {
  console.log('Started! Navigate to http://localhost:' + HTTP_PORT + '/example');
});