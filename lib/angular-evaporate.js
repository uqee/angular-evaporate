/* global console, angular, Evaporate */
;(function (angular, Evaporate) {
  'use strict';
  angular
    .module('evaporate', [])
    .directive('evaporate', [
      function () {

        function logError (err) {
          if (console && console.error) {
            console.error('ERROR @ angular-evaporate', err);
          }
        }

        function getBaseUrl (bucket, awsUrl) {
          if (!bucket) return null;
          else if (!awsUrl) return ('https://' + bucket + '.s3.amazonaws.com/');
          else {
            var splitted = awsUrl.split('://');
            return (splitted[0] + '://' + bucket + '.' + splitted[1] + '/');
          }
        }

        function parseConfig (config) {
          if (!config || typeof config !== 'object') return logError('invalid config');
          if (!config.bucket) return logError('missing config.bucket');
          if (!config.aws_key) return logError('missing config.aws_key');
          if (!config.signerUrl) return logError('missing config.signerUrl');
          return config;
        }

        function parseModel (config, model) {
          var noop = function () {};
          if (!model || typeof model !== 'object') return logError('invalid model');
          if (!model.dir) model.dir = '';
          if (!model.headersCommon) model.headersCommon = {};
          if (!model.headersSigned) model.headersSigned = {};
          if (!model.timestampSeparator) model.timestampSeparator = '$';
          if (typeof model.onFileError !== 'function') model.onFileError = noop;
          if (typeof model.onFileProgress !== 'function') model.onFileProgress = noop;
          if (typeof model.onFileComplete !== 'function') model.onFileComplete = noop;
          if (!model.baseUrl) model.baseUrl = getBaseUrl(config.bucket, config.aws_url);
          model.supported = null;
          model.files = null;
          return model;
        }

        function indexOf (arr, obj) {
          var imax = arr.length;
          for (var i = 0; i < imax; i++) if (angular.equals(arr[i], obj)) return i;
          return -1;
        }

        function getOnChange ($digest, model, evaporate) {
          return function (event) {

            // clear already uploaded files
            model.files = [];

            // process added files
            angular.forEach(event.target.files, function (file) {

              // process file attrs
              file.started = Date.now();
              file.path_ = model.dir + file.started + model.timestampSeparator + file.name;
              file.url = model.baseUrl + file.path_;

              // queue file for upload
              evaporate.add({

                // filename, relative to bucket
                name: file.path_,

                // content
                file: file,

                // headers
                contentType: file.type || 'binary/octet-stream',
                notSignedHeadersAtInitiate: model.headersCommon,
                xAmzHeadersAtInitiate: model.headersSigned,

                // event callbacks
                complete: function () {

                  // check file as completed
                  file.completed = true;

                  // execute user's callback
                  model.onFileComplete(file);

                  // update ui
                  $digest();
                },
                progress: function (progress) {

                  // update progress
                  file.progress = Math.round(progress * 10000) / 100;
                  file.timeLeft = Math.round(
                    (100 - file.progress) / file.progress *
                    (Date.now() - file.started) / 1000
                  );

                  // execute user's callback
                  model.onFileProgress(file);

                  // update ui
                  $digest();
                },
                error: function (message) {

                  // remove file from the queue
                  var index = indexOf(model.files, file);
                  if (index !== -1) model.files.splice(index, 1);

                  // execute user's callback
                  model.onFileError(file, message);

                  // update ui
                  $digest();
                }
              });

              // expose file data to model
              model.files.push(file);
            });

            // update ui
            $digest();
          };
        }

        function init ($scope, $element) {

          // clear
          $element.unbind('change');

          // parse parameters
          if (!parseConfig($scope.config) || !parseModel($scope.config, $scope.model)) return;

          // init
          var evaporate = new Evaporate($scope.config);
          if (evaporate.supported) $element.bind('change', getOnChange($scope.$digest.bind($scope), $scope.model, evaporate));

          // expose data to the scope
          $scope.model.supported = evaporate.supported;
        }

        function link ($scope, $element) {
          var onAttrChange = function (current, previous) { if (current !== previous) init($scope, $element); };
          $scope.$watch('config', onAttrChange, true);
          $scope.$watch('model', onAttrChange, true);
        }
        
        return {
          restrict: 'A',
          scope: {
            config: '=evaConfig',
            model: '=evaModel'
          },
          link: link
        };
      }
    ]);
})(angular, Evaporate);
