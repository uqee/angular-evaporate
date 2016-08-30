describe('AngularEvaporate', function () {
  'use strict';
  var Evaporate;
  var AngularEvaporate;
  var AngularEvaporateUpload;
  var AngularEvaporateException;

  angular.mock.module.sharedInjector();
  before(angular.mock.module('angular-evaporate'));
  before(angular.mock.inject(['Evaporate', 'AngularEvaporate', 'AngularEvaporateUpload', 'AngularEvaporateException',
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
    var xhr;
    var upload;

    before(function () {
      ae = new AngularEvaporate(CONFIG);
      xhr = sinon.useFakeXMLHttpRequest();
    });

    after(function () {
      xhr.restore();
    });

    it('is present', function () {
      assert.isFunction(ae.$enqueue);
      assert.isFunction(ae.$dequeue);
      assert.isFunction(ae.$start);
      assert.isFunction(ae.$add);
      assert.isFunction(ae.$startAll);
      assert.isFunction(ae.$pauseAll);
      assert.isFunction(ae.$resumeAll);
      assert.isFunction(ae.$cancelAll);
      assert.isFunction(ae.$dequeueAll);
    });

    it('add: returns an upload id and starts immediately', function (done) {
      assert.equal(ae.$add({ file: FILE, started: done }), 0);
    });

    it('queue: contains 1 upload', function () {
      assert.equal(ae.$uploads.length, 1);
      upload = ae.$uploads[0];
    });

    it('upload: start fn was removed', function () {
      assert.isUndefined(upload.$start);
    });

    it('upload: dequeue fn is still available', function () {
      assert.isFunction(upload.$dequeue);
    });

    it('upload: binded functions are created', function () {
      assert.isFunction(upload.$pause);
      assert.isFunction(upload.$resume);
      assert.isFunction(upload.$cancel);
    });

    it('cancel: does not remove an upload from the queue', function () {
      upload.$cancel();
      assert.equal(ae.$uploads.length, 1);
      assert.strictEqual(upload, ae.$uploads[0]);
    });

    it('upload: has correct status flags', function () {
      assert.isNumber(upload.$started);
      assert.isNumber(upload.$cancelled);
      assert.isNumber(upload.$stopped);
    });

    it('dequeue: removes from a queue', function () {
      upload.$dequeue();
      assert.equal(ae.$uploads.length, 0);
    });

    it('enqueue: returns an upload', function () {
      upload = ae.$enqueue({ file: FILE });
      assert.instanceOf(upload, AngularEvaporateUpload);
    });

    it('upload: has start and dequeue functions', function () {
      assert.isFunction(upload.$start);
      assert.isFunction(upload.$dequeue);
    });

    it('queue: contains a new upload', function () {
      assert.equal(ae.$uploads.length, 1);
      assert.strictEqual(upload, ae.$uploads[0]);
    });

    it('enqueue: accepts the same file again', function () {
      upload = ae.$enqueue({ file: FILE });
      assert.instanceOf(upload, AngularEvaporateUpload);
    });

    it('queue: contains 2 uploads', function () {
      assert.equal(ae.$uploads.length, 2);
      assert.strictEqual(upload, ae.$uploads[1]);
      assert.notStrictEqual(upload, ae.$uploads[0]);
    });

    it('start: returns an upload id', function () {
      assert.equal(ae.$start(ae.$uploads[1]), 1);
    });

    it('cancelAll: queue still contains 2 uploads', function () {
      ae.$cancelAll();
      assert.equal(ae.$uploads.length, 2);
    });

    it('dequeue: accepts started upload, index returned', function () {
      var upload = ae.$uploads[1];
      assert.equal(ae.$dequeue(upload), 1);
      assert.equal(ae.$uploads.length, 1);
      upload.$cancel();
    });

    it('dequeue: accepts not started upload, index returned', function () {
      assert.equal(ae.$dequeue(ae.$uploads[0]), 0);
      assert.equal(ae.$uploads.length, 0);
    });
  });
});
