module.exports = function (config) {
  'use strict';
  config.set({
    singleRun: true,
    autoWatch: false,
    basePath : '../',
    files: [
      'node_modules/angular/angular.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'node_modules/evaporate/evaporate.js',
      'lib/angular-evaporate.js',
      'test/**/*.js'
    ],
    frameworks: [
      'mocha',
      'chai',
      'sinon'
    ],
    plugins: [
      'karma-mocha',
      'karma-chai',
      'karma-sinon',
      'karma-mocha-reporter',
      'karma-chrome-launcher'
    ],
    browsers : [
      'Chrome'
    ],
    reporters: [
      'mocha'
    ],
    logLevel: config.LOG_WARN,
    loggers: [{
      type: 'console',
      pattern: '%d{HH:mm:ss} %m'
    }],
    mochaReporter: {
      showDiff: true,
      symbols: {
        success: '+',
        info: '#',
        warning: '!',
        error: '-'
      }
    }
  });
};