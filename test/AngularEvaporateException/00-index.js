describe('AngularEvaporateException', function () {
  'use strict';
  var AngularEvaporateException;

  angular.mock.module.sharedInjector();
  before(module('angular-evaporate'));
  before(inject(['AngularEvaporateException',
    function (_AngularEvaporateException) {
      AngularEvaporateException = _AngularEvaporateException;
    }
  ]));

  describe('> index', function () {
    var CODE = 'EX_CODE';
    var MESSAGE = 'ex message';
    var exception;

    before(function () {
      exception = new AngularEvaporateException(CODE, MESSAGE);
    });

    it('saves arguments', function () {
      assert.equal(exception.code, CODE);
      assert.equal(exception.message, MESSAGE);
    });

    it('prints nicely', function () {
      assert.equal(exception.toString(), 'AngularEvaporateException: [' + CODE + '] ' + MESSAGE);
    });
  });
});
