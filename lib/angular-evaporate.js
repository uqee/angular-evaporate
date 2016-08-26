/* global angular, Evaporate */
;(function (angular, Evaporate) {
  'use strict';
  angular.module('angular-evaporate', [])

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

                // save timestamp
                that['$' + name] = now;

                // progress: save percent and estimated time in seconds
                if (name === 'progress') {
                  that.$percent = Math.round(arg * 10000) / 100;
                  that.$seconds = Math.round(
                    (100 - that.$percent) / that.$percent *
                    (now - that.$started) / 1000
                  );
                }

                // info, warn, error: save message
                else if (name === 'info' || name === 'warn' || name === 'error') {
                  that['$' + name + 'Msg'] = arg;
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

          // api

            /**
             * Create an upload from file and append it to the queue.
             * @params - same as for Evaporate.add()
             * @returns {AngularEvaporateUpload}
             */
            AngularEvaporate.prototype.$enqueue = function () {

              // create an upload
              var upload = new AngularEvaporateUpload(this, arguments[0]);

              //
              upload.$start = this.$start.bind.apply(this.$start, [upload].concat(Array.prototype.slice.call(arguments)));
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

              // cancel uploading if already started
              if (upload.$id) upload.$cancel();

              // find it in the list
              var index = this.$uploads.findIndex(function (upload) { return (upload === this.upload); }, upload);
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
             * Enqueue and immediately start uploading.
             * @params - same as for Evaporate.add()
             * @returns - same as Evaporate.add()
             */
            AngularEvaporate.prototype.$add = function () {
              var upload = this.$enqueue.apply(this, arguments);
              return upload.$start();
            };

            /**
             * Start uploading an already queued upload.
             * @param {AngularEvaporateUpload}
             * @returns - same as Evaporate.add()
             */
            AngularEvaporate.prototype.$start = function (upload) {

              // run
              upload.$id = this.add.apply(this, arguments);

              // bind id to API
              upload.$pause = this.pause.bind(this, upload.$id);
              upload.$resume = this.resume.bind(this, upload.$id);
              upload.$cancel = this.cancel.bind(this, upload.$id);

              // update scope
              if (this.$apply) $timeout(this.$apply);

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

              // arr: list of uploads
              arrUploads: '=aeArrUploads',

              // obj: config for new Evaporate(config)
              objConfConstructor: '=aeObjConfConstructor',

              // (optional) obj: config for Evaporate.add(config)
              objConfUpload: '=aeObjConfUpload',

              // (optional) fn: custom naming function
              fnCustomNaming: '=aeFnCustomNaming',

              // (optional) bool: explicitly start uploading
              isLazyStart: '=aeIsLazyStart',

              // (optional) bool: allow to upload same files again
              isRinseRepeat: '=aeIsRinseRepeat',

              // bool: expose this flag to the upper scope
              isSupported: '=aeIsSupported'
            },

            link: function ($scope, $element) {
              var ae;

              // set configs

                // new Evaporate(config)
                $scope.$watch('objConfConstructor', function (curr, prev) {
                  ae = new AngularEvaporate(curr);

                  // configure
                  if ($scope.objConfUpload) ae.$config = $scope.objConfUpload;
                  if ($scope.fnCustomNaming) ae.$namer = $scope.fnCustomNaming;
                  ae.$apply = $scope.$apply.bind($scope);

                  // expose data to scope
                  $scope.isSupported = ae.supported;
                  $scope.arrUploads = ae.$uploads;
                }, true);

                // Evaporate.add(config)
                $scope.$watch('objConfUpload', function (curr, prev) {
                  ae.$config = curr;
                }, true);

                // naming function
                $scope.$watch('fnCustomNaming', function (curr, prev) {
                  ae.$namer = curr;
                }, false);

              // manage event listener

                // bind
                $element.bind('change', function (event) {

                  // process selected files
                  angular.forEach(event.target.files, function (file) {
                    if (ae && ae.supported) {
                      var upload = { file: file };
                      if (!$scope.isLazyStart) ae.$add(upload);
                      else ae.$enqueue(upload);
                    }
                  });

                  // optionally clear selection
                  if ($scope.isRinseRepeat) $element.val(null);
                });

                // unbind
                $scope.$on('$destroy', function () {
                  $element.unbind('change');
                });

            }
          };
        }
      ]);

})(angular, Evaporate);
