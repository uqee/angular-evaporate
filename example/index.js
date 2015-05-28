/* global angular, console */
'use strict';
angular
  .module('app', ['evaporate'])
  .controller('AppCtrl', ['$scope', function ($scope) {

    // this variable is used like a model for particular directive
    // all parameters here are optional
    $scope.evaData = {
      
      // every file will get the following link on s3:
      // http://<your_bucket>.s3.amazonaws.com/<this_value>/<upload_datetime>$<filename_with_extension>
      // if you want to put the files into nested folder, just use dir: 'path/to/your/folder'
      // if not specified, default value being used is: '' (matches bucket's root directory)
      dir: 'tmp',

      // You can pick a different separator string that goes in between upload_datetime and filename_with_extension:
      // http://<your_bucket>.s3.amazonaws.com/<dir>/<upload_datetime><this_value><filename_with_extension>
      // if not specified, the default value being used is: '$'
      timestampSeparator: '_',

      // headers which should (headersSigned) and should not (headersCommon) be signed by your private key
      // for details, visit http://docs.aws.amazon.com/AmazonS3/latest/API/RESTObjectPUT.html
      headersCommon: {
        'Cache-Control': 'max-age=3600'
      },
      headersSigned: {
        'x-amz-acl': 'public-read'
      },

      // custom callbacks for onProgress and onComplete events
      onFileProgress: function (file) {
        console.log(
          'onProgress || name: %s, uploaded: %f%, remaining: %d seconds',
          file.name,
          file.progress,
          file.timeLeft
        );
      },
      onFileComplete: function (file) {
        console.log('onComplete || name: %s', file.name);
      },
      onFileError: function (file, message) {
        console.log('onError || message: %s', message);
      }
    };
  }]);