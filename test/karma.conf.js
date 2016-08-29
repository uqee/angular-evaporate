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
    browsers : [ 'Chrome' ],
    reporters: [ 'mocha' ],
    frameworks: [ 'mocha', 'chai' ],
    plugins: [
      'karma-mocha',
      'karma-mocha-reporter',
      'karma-chai',
      'karma-chrome-launcher'
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