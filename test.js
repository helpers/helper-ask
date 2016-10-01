'use strict';

require('mocha');
var assert = require('assert');
var templates = require('templates');
var questions = require('base-questions');
var app;
var ask;

describe('helper-ask', function() {
  beforeEach(function() {
    app = templates();
    app.use(questions());
    ask = require('./')(app);
    app.asyncHelper('ask', ask);
    app.create('pages');
    app.engine('*', require('engine-base'));
    app.option('engine', '*');
  });

  it('should export a function', function() {
    assert.equal(typeof ask, 'function');
  });

  it('should throw an error when invalid args are passed', function(cb) {
    try {
      ask();
      cb(new Error('expected an error'));
    } catch (err) {
      assert.equal(err.message, 'expected a callback function');
      cb();
    }
  });

  it('should not ask when already answered', function(cb) {
    var page = app.page('foo', {content: '<%= ask("author.name") %><%= ask("author.name") %>'});
    app.option('askWhen', 'not-answered');
    app.data('author.name', 'Brian');

    app.render(page, function(err, view) {
      if (err) return cb(err);
      assert.equal(view.content, 'BrianBrian');
      cb();
    });
  });
});
