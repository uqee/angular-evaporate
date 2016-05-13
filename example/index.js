/* global angular, console */
'use strict';
angular
  .module('app', ['evaporate'])
  .controller('AppCtrl', ['$scope',
    function ($scope) {

      // these options are passed directly into the new Evaporate() constructor
      // for a list of available options, look at https://github.com/TTLabs/EvaporateJS
      $scope.evaConfigInit = {
        bucket: 'motoroller',
        aws_key: 'AKIAI6HJQ7BXS3WOAP5A',
        signerUrl: '/signer',
        logging: false
      };

      // these options are passed into the evaporate.add() function
      // for a list of available options, look at https://github.com/TTLabs/EvaporateJS
      $scope.evaConfigAdd = {

        // e.g. some headers
        // for details, visit http://docs.aws.amazon.com/AmazonS3/latest/API/RESTObjectPUT.html
        notSignedHeadersAtInitiate: {
          'Cache-Control': 'max-age=3600'
        },
        xAmzHeadersAtInitiate: {
          'x-amz-acl': 'public-read'
        },

        // all native callbacks are wrapped to automatically adjust status parameters,
        // expose the corresponding file (as a first function parameter) and update scopes
        // for a full list of callback parameters, look at https://github.com/TTLabs/EvaporateJS
        progress: function (file) { console.log('onProgress || name: %s, uploaded: %f%, remaining: %d seconds', file.name, file.progress, file.timeLeft); },
        complete: function (file) { console.log('onComplete || name: %s', file.name); },
        error: function (file, message) { console.log('onError || message: %s', message); }
      };

      // file naming options
      // this is the local angular-evaporate's feature, all parameters here are optional
      $scope.evaConfigName = {

        // bucket url will normally be calculated from the configInit.aws_url and configInit.bucket parameters
        // generally it looks like '<aws_url>/<bucket>', which for us-east-1 region becomes 'http://s3.amazonaws.com/<bucket>'
        // you can specify your own value, though
        // bucketUrl: 'http://who-knows-what.s3.amazonaws.com/awesomebucket',
        
        // generally, every file will get the following link on s3:
        // <aws_url>/<bucket_name>/<directory_name>/<generated_filename>
        // if you want to put the files into nested folder, just use directory name: 'path/to/your/folder/'
        // if not specified, default value being used is: '' (matches bucket's root directory)
        directoryName: 'tmp/',

        // generated filename looks like: <timestamp><timestamp_separator><filename_with_extension>, e.g. 1463145583436-whysoserious.jpg
        // you can omit any (but not every) part of the name
        useTimestamp: true,
        useFilename: true,
        timestampSeparator: '-' // that's a default value anyway
      };

      // this variable is used like a model for particular directive
      // when directive is linked this object contains options
      $scope.evaModel = {

        // evaporate.supported flag value
        // supported: boolean

        // current list of files
        // files: Array

          // every file contains
          // started: timestamp of the moment, the file was added to the list
          // bucketUrl: string, root of the bucket
          // bucketPath: string, file path relative to the bucket
          // url: string, full url by which the file can be accessed
          // complete: boolean
          // cancelled: boolean
          // info: string, a message from the previous info callback
          // warn: string, a message from the previous warn callback
          // error: string, a message from the previous error callback
          // progress: real, current upload progress in percent (max 2 decimals after the dot)
          // timeLeft: int, estimate in seconds
          // cancel: function, call to abort/cancel an upload
      };
    }
  ]);
