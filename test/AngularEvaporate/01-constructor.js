describe('AngularEvaporate', function () {
  'use strict';
  var Evaporate;
  var AngularEvaporate;
  var AngularEvaporateException;

  angular.mock.module.sharedInjector();
  before(angular.mock.module('angular-evaporate'));
  before(angular.mock.inject(['Evaporate', 'AngularEvaporate', 'AngularEvaporateException',
    function (_Evaporate, _AngularEvaporate, _AngularEvaporateException) {
      Evaporate = _Evaporate;
      AngularEvaporate = _AngularEvaporate;
      AngularEvaporateException = _AngularEvaporateException;
    }
  ]));

  describe('> constructor', function () {

    var CONFIG = {
      bucket: 'motoroller',
      aws_key: 'AKIAI6HJQ7BXS3WOAP5A',
      signerUrl: '/signer',
      logging: false
    };
    var FILE = {
      type: 'image/png',
      name: 'true%^$file ! name.ext'
    };
    var ae;

    it('throws without new', function () {
      assert.throws(AngularEvaporate, AngularEvaporateException);
    });

    it('extends Evaporate', function () {
      ae = new AngularEvaporate(CONFIG);
      assert.instanceOf(ae, Evaporate);
    });

    it('creates valid additional parameters', function () {
      assert.deepEqual(ae.$uploads, []);
      assert.deepEqual(ae.$config, {});
      assert.isUndefined(ae.$apply);

      // filename
      assert.isFunction(ae.$namer);
      assert.equal(ae.$namer({ file: FILE }), FILE.name);

      // bucket's url
      assert.equal(ae.$url, 'http://s3.amazonaws.com/' + CONFIG.bucket + '/');

      // directive
      assert.isUndefined(ae.$slothmode);
      assert.isUndefined(ae.$rinserepeat);
    });
  });
});
