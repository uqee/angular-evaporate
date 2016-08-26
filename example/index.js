/* global angular, console */
'use strict';
angular
  .module('myApp', ['angular-evaporate'])
  .controller('myCtrl', ['$window', '$scope', 'AngularEvaporate',
    function ($window, $scope, AngularEvaporate) {

      // allow using Math in bindings
      $scope.Math = $window.Math;

      // create an AngularEvaporate instance
      // any input parameters accepted by an Evaporate() constructor are allowed
      $scope.ae = new AngularEvaporate({
        bucket: 'motoroller',
        aws_key: 'AKIAI6HJQ7BXS3WOAP5A',
        signerUrl: '/signer',
        logging: false
      });

      // teach AngularEvaporate to update your scope when needed
      $scope.ae.$apply = $scope.$apply.bind($scope);

      // (optionally) set the default upload config
      // any options accepted by Evaporate.add() function will do
      $scope.ae.$config = {
        notSignedHeadersAtInitiate: { 'Cache-Control': 'max-age=3600' },
        xAmzHeadersAtInitiate: { 'x-amz-acl': 'public-read' },

        // all native callbacks are wrapped up to automatically take care of status parameters
        // inside every callback <this> points to the current upload instance (AngularEvaporateUpload)
        complete: function (xhr, awsObjectKey) {
          console.log('Upload #%f is complete, awsObjectKey = %s', this.$id, awsObjectKey);
        }
      };

      // (optionally) set custom naming function
      // should return a string representing a filename from a bucket's root
      // <upload> is the instance of AngularEvaporateUpload
      // <this> is the instance of AngularEvaporate
      $scope.ae.$namer = function (upload) {
        return (
          'angular-evaporate/' +
          this.$config.xAmzHeadersAtInitiate['x-amz-acl'] + '/' +
          (new Date()).toISOString().slice(11, 19) + '--' + upload.file.name
        );
      };

      // (optional) tweak directive's behaviour
      // all defaults are <false>
      $scope.ae.$slothmode = true; // whether to start uploading immediately
      $scope.ae.$rinserepeat = true; // whether to allow selecting same files again
    }
  ]);
