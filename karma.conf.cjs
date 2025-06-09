module.exports = function(config) {
  config.set({
    frameworks: ['mocha', 'chai', 'esm'],
    files: [
      { pattern: 'test/**/*.test.js', type: 'module' },
      { pattern: '*.js', included: false, type: 'module' }
    ],
    esm: {
      nodeResolve: true
    },
    browsers: ['ChromeHeadless'],
    singleRun: true,
    plugins: [
      require('karma-mocha'),
      require('karma-chai'),
      require('karma-chrome-launcher'),
      require('@open-wc/karma-esm')
    ]
  });
};
