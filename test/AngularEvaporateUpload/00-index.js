describe('AngularEvaporateUpload', function () {
  'use strict';
  var AngularEvaporate;
  var AngularEvaporateUpload;

  angular.mock.module.sharedInjector();
  before(angular.mock.module('angular-evaporate'));
  before(angular.mock.inject(['AngularEvaporate', 'AngularEvaporateUpload',
    function (_AngularEvaporate, _AngularEvaporateUpload) {
      AngularEvaporate = _AngularEvaporate;
      AngularEvaporateUpload = _AngularEvaporateUpload;
    }
  ]));

  describe('> index', function () {

    var FILE = {
      type: 'image/png',
      name: 'true%^$file name.ext'
    };

    var ae;

    before(function () {
      ae = new AngularEvaporate({
        bucket: 'motoroller',
        aws_key: 'AKIAI6HJQ7BXS3WOAP5A',
        signerUrl: '/signer',
        logging: false
      });
    });

    it('generates name if not exists', function () {
      var upload = new AngularEvaporateUpload(ae, { file: FILE });
      assert.equal(upload.name, FILE.name);
    });

    it('preserves name if exists', function () {
      var name = 'newname.nxt';
      var upload = new AngularEvaporateUpload(ae, { file: FILE, name: name });
      assert.equal(upload.name, name);
    });

    it('gets type if available', function () {
      var upload = new AngularEvaporateUpload(ae, { file: FILE });
      assert.equal(upload.contentType, FILE.type);
    });

    it('sets type to \'binary/octet-stream\' by default', function () {
      var file = angular.copy(FILE);
      delete file.type;
      var upload = new AngularEvaporateUpload(ae, { file: file });
      assert.equal(upload.contentType, 'binary/octet-stream');
    });

    it('calculates url', function () {
      var upload = new AngularEvaporateUpload(ae, { file: FILE });
      assert.equal(upload.$url, ae.$url + upload.name);
    });

    it('extends default config', function () {
      ae.$config.foo = 'bar';
      var upload = new AngularEvaporateUpload(ae, { file: FILE });
      assert.equal(upload.foo, 'bar');
    });

    it('default config has lower priority', function () {
      var upload = new AngularEvaporateUpload(ae, { file: FILE, foo: 'notbar' });
      assert.equal(upload.foo, 'notbar');
      delete ae.$config.foo;
    });
  });
});
