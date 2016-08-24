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

      .factory('AngularEvaporate', ['$timeout', 'Evaporate', 'AngularEvaporateException',
        function ($timeout, Evaporate, AngularEvaporateException) {

          // init

            var AngularEvaporate = function () {
              if (!(this instanceof AngularEvaporate))
                throw new AngularEvaporateException('INVALID_USAGE', 'constructor called without the new keyword');

              // init Evaporate
              Evaporate.apply(this, arguments);

              // ugly overriding, caused by the fact that
              // Evaporate defines its methods in every instance instead of using a prototype
              this.$add = this.add;
              delete this.add;

              // init self
              this.$uploads = [];
            };

          // inherit Evaporate

            AngularEvaporate.prototype = Object.create(Evaporate.prototype);
            AngularEvaporate.prototype.constructor = AngularEvaporate;

          // default data

            AngularEvaporate.prototype.$config = {};

            AngularEvaporate.prototype.$apply = function () {};

            AngularEvaporate.prototype.$name = function (upload) {
              return (upload.addAt + '-' + upload.file.name);
            };

          // custom API

            AngularEvaporate.prototype.setConfig = function (config) {
              var $config = angular.copy(config);
              if (!$config.contentType) $config.contentType = 'binary/octet-stream';
              this.$config = $config;
            };

            AngularEvaporate.prototype.setApply = function (apply) {
              this.$apply = apply;
            };

            AngularEvaporate.prototype.setNamer = function (namer) {
              this.$namer = namer;
            };

            AngularEvaporate.prototype.getUploads = function () {
              return this.$uploads;
            };

            AngularEvaporate.prototype.getUploadById = function (id) {
              if (!id) return undefined;
              else return this.$uploads.find(function (upload) {
                return (upload.id === id);
              });
            };

          // override API

            AngularEvaporate.prototype.add = function (config) {

              // merge default and current config
              var upload = angular.extend({}, this.$config, config);

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
                      (100 - upload.percent) / upload.percent *
                      (now - upload.startedAt) / 1000
                    );
                  }

                  // info, warn, error: save message
                  if (name === 'info' || name === 'warn' || name === 'error') {
                    upload['$' + name + 'Msg'] = arg;
                  }

                  // run initial fn
                  if (fn) fn.apply(upload, arguments);

                  // update ui
                  $timeout($apply);
                };
              });

              // run
              upload.$id = this.$add.apply(this, arguments);

              // bind id to API
              upload.pause = this.pause.bind(this, upload.$id);
              upload.resume = this.resume.bind(this, upload.$id);
              upload.cancel = this.cancel.bind(this, upload.$id);

              // append to the list
              this.$uploads.push(upload);

              //
              return upload.$id;
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
