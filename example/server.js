'use strict';
var crypto = require('crypto'),
    app    = require('express')();

// console logger
app.use(require('morgan')('dev'));

// serve static files
app.use('/', require('serve-static')( require('path').join(__dirname, '../') ));

// sign data
app.use('/signer', function (req, res) {
  res.send(crypto
    .createHmac('sha1', process.env.AWS_SECRET_KEY)
    .update(req.query.to_sign)
    .digest('base64')
  );
});

// start server
app.listen(process.env.PORT, function () {
  console.log('listening on port ' + process.env.PORT);
});