/* global angular, Evaporate, evaporateOptions */
;(function (Evaporate, evaporateOptions) {
  'use strict';

  angular
    .module('evaporate', [])

    .factory('eva', [function () {
      return {
        _: new Evaporate(evaporateOptions),
        urlBase: 'http://' + evaporateOptions.bucket + '.s3.amazonaws.com/'
      };
    }])

    .directive('evaporate', ['eva', function (eva) {

      function link (scope, element) {

        function foo () {}

        function indexOf (arr, obj) {
          var imax = arr.length;
          for (var i = 0; i < imax; i++) if (angular.equals(arr[i], obj)) return i;
          return -1;
        }

        // allocate eva's data
        if (!scope.data) scope.data = {};

        // apply defaults for input parameters
        var data = scope.data,
            dir = data.dir ? (data.dir + '/') : '',
            timestampSeparator = data.timestampSeparator || '$',
            headersCommon = data.headersCommon || {},
            headersSigned = data.headersSigned || {},
            onFileProgress = (typeof data.onFileProgress === 'function' ? data.onFileProgress : foo),
            onFileComplete = (typeof data.onFileComplete === 'function' ? data.onFileComplete : foo),
            onFileError = (typeof data.onFileError === 'function' ? data.onFileError : foo);

        // expose some info for parent scope
        data.ready = false;
        data.files = [];

        // ready..
        if (eva._.supported) {

          // ..steady..
          element.bind('change', function (event) {

            // process added files
            angular.forEach(event.target.files, function (file) {

              // process file attrs
              file.started = Date.now();
              file.path_ = dir + file.started + timestampSeparator + file.name;
              file.url = eva.urlBase + file.path_;

              // queue file for upload
              eva._.add({

                // filename, relative to bucket
                name: file.path_,

                // content
                file: file,

                // headers
                contentType: file.type || 'binary/octet-stream',
                notSignedHeadersAtInitiate: headersCommon,
                xAmzHeadersAtInitiate:      headersSigned,

                // event callbacks
                complete: function () {

                  // check file as completed
                  file.completed = true;

                  // execute user's callback
                  onFileComplete(file);

                  // update ui
                  scope.$apply();
                },
                progress: function (progress) {

                  // update progress
                  file.progress = Math.round(progress * 10000) / 100;
                  file.timeLeft = Math.round(
                    (100 - file.progress) / file.progress *
                    (Date.now() - file.started) / 1000
                  );

                  // execute user's callback
                  onFileProgress(file);

                  // update ui
                  scope.$apply();
                },
                error: function (message) {

                  // remove file from the queue
                  var index = indexOf(data.files, file);
                  if (index !== -1) data.files.splice(index, 1);

                  // execute user's callback
                  onFileError(file, message);

                  // update ui
                  scope.$apply();
                }
              });

              // expose file data to model
              data.files.push(file);
            });

            // update ui
            scope.$apply();
          });

          // ..go!
          data.ready = true;
        }
      }

      return {
        restrict: 'A',
        link: link,
        scope: {
          data: '=evaModel'
        }
      };
    }]);

})(Evaporate, evaporateOptions);
