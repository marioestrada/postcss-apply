'use strict';

var fs = require('fs');
var path = require('path');
var test = require('tape');
var postcss = require('postcss');
var Promise = require('es6-promise').Promise; // eslint-disable-line
var plugin = require('../');
var pluginName = require('../package.json').name;

function read(name) {
  return fs.readFileSync(path.join(__dirname, 'fixture', name), 'utf8');
}

test('control', function (assert) {
  assert.plan(10);

  var input = read('control/input.css');
  var expected = read('control/expected.css');
  var css;

  // No opts.
  css = postcss([plugin]).process(input).css;
  assert.equal(css, expected);

  // PostCSS legacy API.
  css = postcss([plugin.postcss]).process(input).css;
  assert.equal(css, expected);

  // PostCSS API.
  var processor = postcss();
  processor.use(plugin);
  processor.process(input).then(function (result) {
    assert.equal(result.css, expected);

    assert.ok(result.messages.length);

    assert.equal(
      result.messages[0].type,
      'warning'
    );

    assert.equal(
      result.messages[0].text,
      'Custom properties sets are only allowed on `:root` rules.'
    );

    assert.equal(
      result.messages[1].type,
      'warning'
    );

    assert.equal(
      result.messages[1].text,
      'No custom properties set declared for `this-should-warn`.'
    );

    assert.equal(processor.plugins[0].postcssPlugin, pluginName);
    assert.ok(processor.plugins[0].postcssVersion);
  });
});
