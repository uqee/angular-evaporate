/* global angular, Evaporate */
;(function (angular, Evaporate) {
  'use strict';
  angular.module('evaporate', [])

    // Evaporate

      .value('Evaporate', Evaporate)

    // AngularEvaporateException

      .factory('AngularEvaporateException', [
        function () {

          var AngularEvaporateException = function (code, message) {
            if (!(this instanceof AngularEvaporateException))
              return new AngularEvaporateException(code, message);

            this.code = code;
            this.message = message;
          };

          AngularEvaporateException.prototype.toString = function () {
            return ('AngularEvaporateException: [' + this.code + '] ' + this.message);
          };

          return AngularEvaporateException;
        }
      ])

    // AngularEvaporate

      /*

        AngularEvaporate.prototype:

          $namer: default (upload -> filename) fn
          $queue: fn to save upload to the list, but don't start uploading yet
          $add: proxied Evaporate.add() fn

        AngularEvaporate:

          $namer: custom (upload -> filename) fn
          $config: default config to merge with for an $add() fn
          $uploads: internal list of uploads

        upload:

          $id: id returned by Evaporate.add() fn

          $start: fn available as a result of $queue(upload)
          $pause
          $resume
          $cancel

          $startedAt
          $pausedAt
          $resumedAt
          $pausingAt
          $cancelledAt
          $completeAt
          $infoAt
          $warnAt
          $errorAt
          $progressAt

          $infoMsg
          $warnMsg
          $errorMsg

          $percent: current uploading progress
          $seconds: estimated elapsed time

      */

      .factory('AngularEvaporate', ['$timeout', 'Evaporate', 'AngularEvaporateException',
        function ($timeout, Evaporate, AngularEvaporateException) {

          // init

            var AngularEvaporate = function () {
              if (!(this instanceof AngularEvaporate))
                throw new AngularEvaporateException('INVALID_USAGE', 'constructor called without the new keyword');

              // init Evaporate
              Evaporate.apply(this, arguments);

              // init self
              var _config;
              Object.defineProperty(this, '$config', {
                enumerable: true,
                configurable: false,
                get: function () { return _config; },
                set: function (config) {
                  _config = angular.copy(config);
                  if (!_config.contentType) _config.contentType = 'binary/octet-stream';
                }
              });

              // set data
              this.$config = {};
              this.$uploads = [];
            };

          // inherit Evaporate

            AngularEvaporate.prototype = Object.create(Evaporate.prototype);
            AngularEvaporate.prototype.constructor = AngularEvaporate;

          // defaults

            AngularEvaporate.prototype.$namer = function (upload) {
              return upload.file.name;
            };

          // api

            AngularEvaporate.prototype.$add = function () {

              // merge with the default config
              var upload = angular.extend({}, this.$config, arguments[0]);

              // set a name if not passed
              if (!upload.name) upload.name = this.$namer(upload);

              // proxy callbacks
              var $apply = this.$apply;
              ['started', 'paused', 'resumed', 'pausing', 'cancelled', 'complete', 'info', 'warn', 'error', 'progress'].forEach(function (name) {

                // save initial if exists
                var fn = (typeof upload[name] === 'function') ? upload[name] : undefined;

                // proxy
                upload[name] = function () {
                  var arg = arguments[0];
                  var now = Date.now();

                  // save timestamp
                  upload['$' + name + 'At'] = now;

                  // progress: save percent and estimated time in seconds
                  if (name === 'progress') {
                    upload.$percent = Math.round(arg * 10000) / 100;
                    upload.$seconds = Math.round(
                      (100 - upload.$percent) / upload.$percent *
                      (now - upload.$startedAt) / 1000
                    );
                  }

                  // info, warn, error: save message
                  else if (name === 'info' || name === 'warn' || name === 'error') {
                    upload['$' + name + 'Msg'] = arg;
                  }

                  // run initial fn
                  if (fn) fn.apply(upload, arguments);

                  // update ui
                  if ($apply) $timeout($apply);
                };
              });

              // run
              upload.$id = this.$add.apply(this, arguments);

              // bind id to API
              upload.$pause = this.pause.bind(this, upload.$id);
              upload.$resume = this.resume.bind(this, upload.$id);
              upload.$cancel = this.cancel.bind(this, upload.$id);

              // append to the list
              this.$uploads.push(upload);

              //
              return upload.$id;
            };

            AngularEvaporate.prototype.$queue = function (upload) {
              upload.$start = this.add.bind.apply(this.add, [this].concat(Array.prototype.slice.call(arguments)));
              this.$uploads.push(upload);
            };

          return AngularEvaporate;
        }
      ])

    // evaporate

    .directive('evaporate', ['AngularEvaporate',
      function (AngularEvaporate) {
        return {
          restrict: 'A',
          scope: {
            configNew: '=configNew',
            configAdd: '=configAdd',
            uploads: '=uploads'
          },
          link: function ($scope, $element) {

            // init
            var ae = new AngularEvaporate($scope.configNew);

            // expose uploads
            $scope.uploads = ae.getUploads();

            // watch default config changes
            $scope.$watch('configAdd', function (curr, prev) {
              if (curr !== prev) ae.setConfig(curr);
            });

            // process files
            $element.bind('change', function (event) {
              angular.forEach(event.target.files, function (file) {
                ae.add({ file: file });
              });
            });
          }
        };
      }
    ]);

})(angular, Evaporate);
