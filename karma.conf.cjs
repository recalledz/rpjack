process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function(config) {
  config.set({
    hostname: '127.0.0.1', // Force IPv4 instead of ::1
    frameworks: ['mocha', 'chai', 'esm'],
    files: [
      { pattern: 'test/**/*.test.js', type: 'module' },
      { pattern: '*.js', included: false, type: 'module' }
    ],
    esm: {
      nodeResolve: true
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
      require('karma-mocha'),
      require('karma-chai'),
      require('karma-chrome-launcher'),
      require('@open-wc/karma-esm')
    ]
  });
};
