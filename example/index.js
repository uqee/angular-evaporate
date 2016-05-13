/* global angular, console */
'use strict';
angular
  .module('app', ['evaporate'])
  .controller('AppCtrl', ['$scope',
    function ($scope) {

      // it's absolutely essential to config the module beforehand
      // these options are passed directly into EvaporateJS itself
      // for details look at: https://github.com/TTLabs/EvaporateJS
      $scope.evaConfigInit = {
        bucket: 'motoroller',
        aws_key: 'AKIAI6HJQ7BXS3WOAP5A',
        signerUrl: '/signer',
        logging: false
      };

      $scope.evaConfigAdd = {

        // headers which should (headersSigned) and should not (headersCommon) be signed by your private key
        // for details, visit http://docs.aws.amazon.com/AmazonS3/latest/API/RESTObjectPUT.html
        notSignedHeadersAtInitiate: {
          'Cache-Control': 'max-age=3600'
        },
        xAmzHeadersAtInitiate: {
          'x-amz-acl': 'public-read'
        },

        // custom callbacks for onProgress and onComplete events
        info: function (msg) { console.log(msg); }
        /*
        onFileprogress: function (file) {
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
        */
      };

      // this variable is used like a model for particular directive
      // all parameters here are optional
      $scope.evaConfigName = {

        // bucketUrl
        
        // every file will get the following link on s3:
        // http://<your_bucket>.s3.amazonaws.com/<this_value>/<upload_datetime>$<filename_with_extension>
        // if you want to put the files into nested folder, just use dir: 'path/to/your/folder'
        // if not specified, default value being used is: '' (matches bucket's root directory)
        directoryName: '/tmp/',

        useTimestamp: true,
        useFilename: true,

        // You can pick a different separator string that goes in between upload_datetime and filename_with_extension:
        // http://<your_bucket>.s3.amazonaws.com/<dir>/<upload_datetime><this_value><filename_with_extension>
        // if not specified, the default value being used is: '$'
      timestampSeparator: '-'
      };

      //
      $scope.evaModel = {};
    }
  ]);
