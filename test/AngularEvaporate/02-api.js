describe('AngularEvaporate', function () {
  'use strict';
  var Evaporate;
  var AngularEvaporate;
  var AngularEvaporateUpload;
  var AngularEvaporateException;

  angular.mock.module.sharedInjector();
  before(angular.mock.module('angular-evaporate'));
  before(angular.mock.inject(['$httpBackend', 'Evaporate', 'AngularEvaporate', 'AngularEvaporateUpload', 'AngularEvaporateException',
    function (_Evaporate, _AngularEvaporate, _AngularEvaporateUpload, _AngularEvaporateException) {
      Evaporate = _Evaporate;
      AngularEvaporate = _AngularEvaporate;
      AngularEvaporateUpload = _AngularEvaporateUpload;
      AngularEvaporateException = _AngularEvaporateException;
    }
  ]));

  describe('> api', function () {
    
    var CONFIG = {
      bucket: 'motoroller',
      aws_key: 'AKIAI6HJQ7BXS3WOAP5A',
      signerUrl: '/signer',
      logging: false
    };
    var FILE = {
      type: 'image/png',
      name: 'true%^$file name.ext'
    };

    var ae;
    before(function () { ae = new AngularEvaporate(CONFIG); });

    it('is present', function () {
      assert.isFunction(ae.$enqueue);
      assert.isFunction(ae.$dequeue);
      assert.isFunction(ae.$start);
      assert.isFunction(ae.$add);
    });

    describe('> add', function () {
      var upload;

      it('returns an upload id', function (done) {
        assert.equal(ae.$add({ file: FILE, started: done }), 0);
      });

      it('uploads queue contains 1 upload', function () {
        assert.equal(ae.$uploads.length, 1);
        upload = ae.$uploads[0];
      });

      it('start fn was removed', function () {
        assert.isUndefined(upload.$start);
      });

      it('dequeue fn is still available', function () {
        assert.isFunction(upload.$dequeue);
      });

      it('binded functions were created', function () {
        assert.isFunction(upload.$pause);
        assert.isFunction(upload.$resume);
        assert.isFunction(upload.$cancel);
      });

      it('cancel doesn\'t remove upload from the queue', function () {
        upload.$cancel();
        assert.equal(ae.$uploads.length, 1);
        assert.strictEqual(upload, ae.$uploads[0]);
      });

      it('dequeue does', function () {
        upload.$dequeue();
        assert.equal(ae.$uploads.length, 0);
      });

      it('upload has correct status flags', function () {
        assert.isNumber(upload.$started);
        assert.isNumber(upload.$cancelled);
        assert.isNumber(upload.$stopped);
      });
    });

    describe('> enqueue', function () {
      var upload;

      it('returns an upload', function () {
        upload = ae.$enqueue({ file: FILE });
        assert.instanceOf(upload, AngularEvaporateUpload);
      });

      it('upload has start and dequeue options', function () {
        assert.isFunction(upload.$start);
        assert.isFunction(upload.$dequeue);
      });

      it('uploads queue contains a new upload', function () {
        assert.equal(ae.$uploads.length, 1);
        assert.strictEqual(upload, ae.$uploads[0]);
      });

      it('same file can be enqueued again', function () {
        upload = ae.$enqueue({ file: FILE });
        assert.instanceOf(upload, AngularEvaporateUpload);
      });

      it('uploads queue contains 2 uploads', function () {
        assert.equal(ae.$uploads.length, 2);
        assert.strictEqual(upload, ae.$uploads[1]);
        assert.notStrictEqual(upload, ae.$uploads[0]);
      });
    });

    describe('> start', function () {

      it('returns an upload id', function () {
        assert.equal(ae.$start(ae.$uploads[1]), 1);
      });
    });

    describe('> dequeue', function () {

      it('can do a started upload, index returned', function () {
        var upload = ae.$uploads[1];
        assert.equal(ae.$dequeue(upload), 1);
        assert.equal(ae.$uploads.length, 1);
        upload.$cancel();
      });

      it('can do not started upload, index returned', function () {
        assert.equal(ae.$dequeue(ae.$uploads[0]), 0);
        assert.equal(ae.$uploads.length, 0);
      });
    });
  });
});
