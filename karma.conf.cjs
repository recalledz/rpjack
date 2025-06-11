// Gracefully load Puppeteer path, fallback to system Chrome if needed
let chromePath;
try {
  chromePath = require('puppeteer').executablePath();
  process.env.CHROME_BIN = chromePath;
} catch (err) {
  console.warn("⚠️ Puppeteer not found, using system Chrome if available.");
}

module.exports = function (config) {
  config.set({
    basePath: '',
    hostname: '127.0.0.1',

    frameworks: ['mocha', 'chai', 'commonjs'],

    files: [
      'test/**/*.test.cjs'
    ],

    preprocessors: {
      'test/**/*.test.js': ['commonjs']
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
      require('karma-commonjs'),
      require('karma-chrome-launcher')
    ]
  });
};
