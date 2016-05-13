/* global console, angular, Evaporate */
;(function (angular, Evaporate) {
  'use strict';
  angular
    .module('evaporate', [])
    .directive('evaporate', [
      function () {

        function logError (err) {
          if (console && console.error) {
            console.error('ERROR @ angular-evaporate:', err);
          }
        }

        function getBucketUrl (bucket, awsUrl) {
          if (!bucket) return null;
          else if (!awsUrl) return ('https://' + bucket + '.s3.amazonaws.com');
          else {
            var splitted = awsUrl.split('://');
            return (splitted[0] + '://' + bucket + '.' + splitted[1]);
          }
        }

        function setConfig (configInit, configAdd, configName) {

          // init
          if (!configInit || typeof configInit !== 'object') throw 'invalid configInit';
          if (!configInit.bucket) throw 'missing configInit.bucket';
          if (!configInit.aws_key) throw 'missing configInit.aws_key';
          if (!configInit.signerUrl) throw 'missing configInit.signerUrl';

          // add
          if (!configAdd || typeof configAdd !== 'object') throw 'invalid configAdd';

          // name
          if (!configName || typeof configName !== 'object') throw 'invalid configName';
          if (!configName.bucketUrl) configName.bucketUrl = getBucketUrl(configInit.bucket, configInit.aws_url);
          if (!configName.directoryName) configName.directoryName = '';
          if (!configName.useTimestamp && !configName.useFilename) configName.useTimestamp = true;
          if (!configName.timestampSeparator) configName.timestampSeparator = '__';
        }

        function getBucketPath (fileName, fileStarted, configName) {
          var path = '';
          if (configName.directoryName) path += configName.directoryName;
          if (configName.useTimestamp) path += fileStarted;
          if (configName.useTimestamp && configName.useFilename) path += configName.timestampSeparator;
          if (configName.useFilename) path += fileName;
          return path;
        }

        function init ($scope, $element) { console.log('init');

          // clear
          $element.unbind('change');

          // set config
          try { setConfig($scope.configInit, $scope.configAdd, $scope.configName); }
          catch (err) { return logError(err); }

          // set model
          if (!$scope.model) $scope.model = {};

          // get lib
          var evaporate = new Evaporate($scope.configInit);
          $scope.model.supported = evaporate.supported;

          // init
          if (evaporate.supported) { console.log($scope);
            $element.bind('change', function (event) {

              // clear already uploaded files
              $scope.model.files = [];

              // process added files
              angular.forEach(event.target.files, function (file) {

                // expose some data
                file.started = Date.now();
                file.bucketUrl = $scope.configName.bucketUrl;
                file.bucketPath = getBucketPath(file.name, file.started, $scope.configName); console.log(file.bucketPath);
                file.url = file.bucketUrl + file.bucketPath; console.log(file.url);

                // queue file for upload
                var id = evaporate.add(
                  angular.merge({},

                    // data
                    {
                      name: file.bucketPath,
                      file: file,
                      contentType: file.type || 'binary/octet-stream'
                    },

                    // config
                    $scope.configAdd,

                    // wrapped callbacks
                    {
                      complete: function () {

                        // check
                        file.complete = true;

                        // fire user's callback
                        if (typeof $scope.configAdd.complete === 'function') {
                          $scope.configAdd.complete.apply(this, arguments);
                        }

                        // update ui
                        $scope.$digest();
                      },

                      cancelled: function () {

                        // check
                        file.cancelled = true;

                        // fire user's callback
                        if (typeof $scope.configAdd.cancelled === 'function') {
                          $scope.configAdd.cancelled.apply(this, arguments);
                        }

                        // update ui
                        $scope.$digest();
                      },

                      info: function (message) {

                        // check
                        file.info = message;

                        // fire user's callback
                        if (typeof $scope.configAdd.info === 'function') {
                          $scope.configAdd.info.apply(this, arguments);
                        }

                        // update ui
                        $scope.$digest();
                      },

                      warn: function (message) {

                        // check
                        file.warn = message;

                        // fire user's callback
                        if (typeof $scope.configAdd.warn === 'function') {
                          $scope.configAdd.warn.apply(this, arguments);
                        }

                        // update ui
                        $scope.$digest();
                      },

                      error: function (message) {

                        // check
                        file.error = message;

                        // fire user's callback
                        if (typeof $scope.configAdd.error === 'function') {
                          $scope.configAdd.error.apply(this, arguments);
                        }

                        // update ui
                        $scope.$digest();
                      },

                      progress: function (progress) {

                        // update progress
                        file.progress = Math.round(progress * 10000) / 100;
                        file.timeLeft = Math.round(((100 - file.progress) / file.progress) * ((Date.now() - file.started) / 1000));

                        // fire user's callback
                        if (typeof $scope.configAdd.progress === 'function') {
                          $scope.configAdd.progress.apply(this, arguments);
                        }

                        // update ui
                        $scope.$digest();
                      }
                    }
                  )
                );

                // expose cancel function
                file.cancel = evaporate.cancel.bind(evaporate, id);

                // push file to model
                $scope.model.files.push(file);
              });

              // update ui
              $scope.$digest();
            });
          }
        }

        function link ($scope, $element) {
          var onAttrChange = function (previous, current) { if (current !== previous) init($scope, $element); };
          $scope.$watch('configInit', onAttrChange, true);
          $scope.$watch('configAdd', onAttrChange, true);
          $scope.$watch('configName', onAttrChange, true);
          init($scope, $element);
        }
        
        return {
          restrict: 'A',
          scope: {
            configInit: '=evaConfigInit',
            configAdd: '=evaConfigAdd',
            configName: '=evaConfigName',
            model: '=evaModel'
          },
          link: link
        };
      }
    ]);
})(angular, Evaporate);
