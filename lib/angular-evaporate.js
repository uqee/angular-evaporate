/* global Evaporate */
;(function (Evaporate) {
  'use strict';
  angular
    .module('evaporate', [])

    .directive('evaporate', ['$http',
      function ($http) {

        function link (scope, element, attrs) {
          $http
            .get(attrs.credsUrl)
            
            .success(function (creds) {
              var s3Url = 'https://' + creds.bucket + '.s3.amazonaws.com/',
                  evaporate = new Evaporate({
                    signerUrl: attrs.signerUrl,
                    aws_key: creds.key,
                    bucket:  creds.bucket,
                    logging: false
                  });

              scope.files = [];
              element.bind('change', function (event) {

                angular.forEach(event.target.files, function (file) {
                  var fileKey = attrs.keyPrefix + file.name;
                  file.url = s3Url + fileKey; 
                  file.type = file.type || 'binary/octet-stream';
                  file.started = Date.now();

                  evaporate.add({
                    name: fileKey,
                    file: file,
                    contentType: file.type,
                    xAmzHeadersAtInitiate: { 'x-amz-acl': 'public-read' },
                    complete: function () {
                      file.completed = true;
                      scope.$apply();
                    },
                    progress: function (progress) {
                      file.progress = Math.round(progress * 10000) / 100;
                      file.timeLeft = Math.round(
                        (100 - file.progress) / file.progress *
                        (Date.now() - file.started) / 1000
                      );
                      scope.$apply();
                    }
                  });

                  scope.files.push(file);
                });

                scope.$apply();
              });
            })
            
            .error(function (err) {
              scope.files = undefined;
              console.log('Error loading creds: ' + err);
            });
        }

        return {
          restrict: 'A',
          link: link
        };
      }
    ]);
})(Evaporate);
