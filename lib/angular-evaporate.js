;(function () {
  'use strict';
  var MODULE_NAME = 'angular-evaporate';

  // get dependencies
  // from browserify modules or global variables
  var angular;
  var Evaporate;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MODULE_NAME;
    angular = require('angular');
    Evaporate = require('evaporate');
  } else if (typeof window !== 'undefined') {
    angular = window.angular;
    Evaporate = window.Evaporate;
  }

  // build module
  angular.module(MODULE_NAME, [])

    // Evaporate

      .value('Evaporate', Evaporate)

    // AngularEvaporateException

      .factory('AngularEvaporateException', [
        function () {

          /**
           * Defines custom exception.
           * @class
           *
           * @param {String} code
           * @param {String} message
           * @returns {AngularEvaporateException}
           *
           * @property {String} code
           * @property {String} message
           */
          var AngularEvaporateException = function (code, message) {
            if (!(this instanceof AngularEvaporateException))
              return new AngularEvaporateException(code, message);

            this.code = code;
            this.message = message;
          };

          /**
           * Override default toString() fn for the nice console output.
           * @returns {String}
           */
          AngularEvaporateException.prototype.toString = function () {
            return ('AngularEvaporateException: [' + this.code + '] ' + this.message);
          };

          return AngularEvaporateException;
        }
      ])

    // AngularEvaporateUpload

      .factory('AngularEvaporateUpload', ['$timeout', 'AngularEvaporateException',
        function ($timeout, AngularEvaporateException) {

          /**
           * Defines an upload object for the AngularEvaporate uploads queue.
           * @class
           *
           * @param {AngularEvaporate} ae - instance of AngularEvaporate which creates an upload
           * @param {Object} config - config of the requested upload
           * @returns {AngularEvaporateUpload}
           *
           * @property {String} name
           * @property {String} contentType
           *
           * @property {Number} $id - returned by the Evaporate.add()
           * @property {String} $url - full url of the file when it will be uploaded
           *
           * @property {Function} $start
           * @property {Function} $pause
           * @property {Function} $resume
           * @property {Function} $cancel
           *
           * @property {Number} $started
           * @property {Number} $stopped - if either $complete, $cancelled of $error happened
           * @property {Number} $paused
           * @property {Number} $resumed
           * @property {Number} $pausing
           * @property {Number} $cancelled
           * @property {Number} $complete
           * @property {Number} $info
           * @property {Number} $warn
           * @property {Number} $error
           * @property {Number} $progress
           *
           * @property {String} $infoMsg
           * @property {String} $warnMsg
           * @property {String} $errorMsg
           *
           * @property {Number} $percent - current uploading progress
           * @property {Number} $seconds - estimated elapsed time
           * @property {Number} $speed - upload speed
           * @property {String} $speedStr - upload speed in human readable format
           */
          var AngularEvaporateUpload = function (ae, config) {
            if (!(this instanceof AngularEvaporateUpload))
              throw new AngularEvaporateException('INVALID_USAGE', 'constructor called without the new keyword');

            // merge with the default config
            angular.extend(this, ae.$config, config);

            // add computable parameters
            if (!this.name) this.name = ae.$namer(this);
            this.contentType = this.file.type || 'binary/octet-stream';
            this.$url = ae.$url + this.name;

            // proxy callbacks
            [
              'started',
              'paused',
              'resumed',
              'pausing',
              'cancelled',
              'complete',
              'info',
              'warn',
              'error',
              'progress'
            ].forEach(function (name) {

              // save initial if exists
              var fn = (typeof this[name] === 'function') ? this[name] : undefined;

              // proxy
              var that = this;
              this[name] = function () {
                var arg = arguments[0];
                var now = Date.now();
                var duration;

                // save timestamp
                that['$' + name] = now;

                // progress: save percent and estimated time in seconds
                if (name === 'progress') {
                  duration = (now - that.$started) / 1000;
                  that.$percent = Math.round(arg * 10000) / 100;
                  if (that.$percent) {
                    that.$seconds = Math.round((100 - that.$percent) / that.$percent * duration);
                    that.$speed = ae.$speeder(that.file.size * arg / duration);
                  }
                }

                // complete, cancelled, error: set stopped flag
                // info, warn, error: save message
                else if (name === 'complete' || name === 'cancelled') that.$stopped = now;
                else if (name === 'info' || name === 'warn') that['$' + name + 'Msg'] = arg;
                else if (name === 'error') {
                  that.$errorMsg = arg;
                  that.$stopped = now;
                }

                // paused, resumed, pausing: manage dependencies
                else if (name === 'paused') {
                  delete that.$pausing;
                  delete that.$resumed;
                } else if (name === 'resumed') {
                  delete that.$pausing;
                  delete that.$paused;
                } else if (name === 'pausing') {
                  delete that.$paused;
                  delete that.$resumed;
                }

                // run initial fn
                if (fn) fn.apply(that, arguments);

                // update ui
                if (ae.$apply) $timeout(ae.$apply);
              };
            }, this);
          };

          return AngularEvaporateUpload;
        }
      ])

    // AngularEvaporate

      .factory('AngularEvaporate', ['$timeout', 'Evaporate', 'AngularEvaporateUpload', 'AngularEvaporateException',
        function ($timeout, Evaporate, AngularEvaporateUpload, AngularEvaporateException) {

          // constructor

            /**
             * Extends Evaporate.
             * @class
             *
             * @params - same as for new Evaporate()
             * @returns {AngularEvaporate}
             *
             * @property {Array} $uploads - internal list of uploads
             * @property {Object} $config - default config to merge with for an Evaporate.add() fn
             * @property {String} $url - url of the bucket's root directory
             * @property {Function} $namer - custom upload naming function
             *
             * @property {Function} $apply - (optional) binded $scope.$apply() to update UI
             */
            var AngularEvaporate = function (config) {
              if (!(this instanceof AngularEvaporate))
                throw new AngularEvaporateException('INVALID_USAGE', 'constructor called without the new keyword');

              // init Evaporate
              Evaporate.apply(this, arguments);

              // init self
              this.$uploads = [];
              this.$config = {};
              this.$url = (config.aws_url || 'http://s3.amazonaws.com/') + config.bucket + '/';
            };

            // inherit Evaporate
            AngularEvaporate.prototype = Object.create(Evaporate.prototype);
            AngularEvaporate.prototype.constructor = AngularEvaporate;

            /**
             * Default upload naming function.
             * @params {AngularEvaporateUpload}
             * @returns {String} - name of the upload
             */
            AngularEvaporate.prototype.$namer = function (upload) {
              return upload.file.name;
            };

            /**
             * Default upload speed function.
             * @params {Number} - speed in bytes per second
             * @returns {String} - speed in human readable format
            */
            AngularEvaporate.prototype.$speeder = function (speed) {
              var prefix = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
              var pow = Math.floor(Math.log(speed) / Math.log(1024));
              var val = speed / Math.pow(1024, pow);
              return val.toFixed(2).replace('.00', '') + ' ' + prefix[pow] + 'B/s';
            };

          // api

            // individual upload

              /**
               * Create an upload from file and append it to the queue.
               * @params - same as for Evaporate.add()
               * @returns {AngularEvaporateUpload}
               */
              AngularEvaporate.prototype.$enqueue = function () {

                // create an upload
                var upload = new AngularEvaporateUpload(this, arguments[0]);

                //
                upload.$start = this.$start.bind.apply(this.$start, [this, upload].concat(Array.prototype.slice.call(arguments, 1)));
                upload.$dequeue = this.$dequeue.bind(this, upload);

                // append to the list
                this.$uploads.push(upload);

                // update scope
                if (this.$apply) $timeout(this.$apply);

                //
                return upload;
              };

              /**
               * Remove an upload from the queue.
               * @param {AngularEvaporateUpload}
               * @returns {Number} index
               */
              AngularEvaporate.prototype.$dequeue = function (upload) {

                // find it in the list
                var index = this.$uploads.findIndex(function (upload) { return (upload === this); }, upload);
                if (index !== -1) {

                  // and remove
                  this.$uploads.splice(index, 1);

                  // update scope
                  if (this.$apply) $timeout(this.$apply);
                }

                //
                return index;
              };

              /**
               * Start uploading an already queued upload.
               * @param {AngularEvaporateUpload}
               * @returns - same as Evaporate.add()
               */
              AngularEvaporate.prototype.$start = function (upload) {

                // run
                upload.$id = this.add.apply(this, arguments);

                // modify api
                delete upload.$start;
                upload.$pause = this.pause.bind(this, upload.$id);
                upload.$resume = this.resume.bind(this, upload.$id);
                upload.$cancel = this.cancel.bind(this, upload.$id);

                // update scope
                if (this.$apply) $timeout(this.$apply);

                //
                return upload.$id;
              };

              /**
               * Enqueue and immediately start uploading.
               * @params - same as for Evaporate.add()
               * @returns - same as Evaporate.add()
               */
              AngularEvaporate.prototype.$add = function () {
                var upload = this.$enqueue.apply(this, arguments);
                return upload.$start();
              };

            // all uploads

              /**
               * Start all uploads.
               */
              AngularEvaporate.prototype.$startAll = function () {
                this.$uploads.forEach(function (upload) {
                  if (upload.$start) upload.$start();
                });
              };
              
              /**
               * Pause all uploads.
               * @params - same as for Evaporate.pause(), but without an id
               */
              AngularEvaporate.prototype.$pauseAll = function () {
                return this.pause.apply(this, [undefined].concat(Array.prototype.slice.call(arguments)));
              };
              
              /**
               * Resume all uploads.
               * @params - same as for Evaporate.resume(), but without an id
               */
              AngularEvaporate.prototype.$resumeAll = function () {
                return this.resume.apply(this, [undefined].concat(Array.prototype.slice.call(arguments)));
              };
              
              /**
               * Cancel all uploads.
               */
              AngularEvaporate.prototype.$cancelAll = function () {
                this.$uploads.forEach(function (upload) {
                  if (upload.$cancel) upload.$cancel();
                });
              };

              /**
               * Dequeue all uploads.
               */
              AngularEvaporate.prototype.$dequeueAll = function () {

                // flush the queue
                this.$uploads = [];

                // update scope
                if (this.$apply) $timeout(this.$apply);
              };

          return AngularEvaporate;
        }
      ])

    // angular-evaporate

      .directive('angularEvaporate', ['$timeout',
        function ($timeout) {
          return {
            restrict: 'A',
            scope: { ae: '=angularEvaporate' },
            link: function ($scope, $element) {
              $scope.$on('$destroy', function () { $element.unbind('change'); });
              $element.bind('change', function (event) {
                if ($scope.ae && $scope.ae.supported) {

                  // choose behaviour
                  var fn = $scope.ae.$slothmode ? '$enqueue' : '$add';

                  // process files
                  (function processfile (files, i) {

                    // if exists, process it
                    if (files && files[i]) {
                      $scope.ae[fn]({ file: files[i] });
                      $timeout(processfile, 0, false, files, i + 1);
                    }

                    // if not, clear selection
                    else if ($scope.ae.$rinserepeat) $element.val(null);
                  })(event.target.files, 0);
                }
              });
            }
          };
        }
      ]);

})();
