process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function (config) {
  config.set({
    basePath: '',
    hostname: '127.0.0.1',

    frameworks: ['esm', 'mocha', 'chai'],

    files: [
      { pattern: 'test/**/*.test.js', type: 'module' },
      { pattern: '*.js', included: false, type: 'module' }
    ],

    esm: {
      nodeResolve: true,
      preserveSymlinks: true,
      compatibility: 'none'
    },

    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu']
      }
    },

    browsers: ['ChromeHeadlessNoSandbox'],
    singleRun: true,
    browserNoActivityTimeout: 30000,
    captureTimeout: 30000,

    plugins: [
      require('karma-esm'),
      require('karma-mocha'),
      require('karma-chai'),
      require('karma-chrome-launcher')
    ]
  });
};
