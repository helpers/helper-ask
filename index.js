'use strict';

var isObject = require('isobject');
var merge = require('mixin-deep');
var get = require('get-value');
var ask = require('ask-when');

/**
 * Async helper that prompts the user and uses the answer as
 * context for rendering templates.
 *
 * ```html
 * <%%= ask('author.name') %>
 * ```
 * @param {Object} `app`
 * @return {Function} Returns the helper function
 * @api public
 */

module.exports = function(app) {
  return function(name, message, options, cb) {
    var args = [].slice.call(arguments, 1);
    cb = args.pop();

    if (typeof cb !== 'function') {
      throw new TypeError('expected a callback function');
    }

    app = app || this.app;
    var last = args[args.length - 1];
    var opts = {};

    if (isObject(last)) {
      options = args.pop();
    }

    last = args[args.length - 1];
    if (typeof last === 'string') {
      opts.message = args.pop();
    }

    options = merge({}, this.options, this.context, opts, options);
    options.save = false;

    ask.when(this.app, name, options, function(err, answers) {
      if (err) {
        cb(err);
        return;
      }
      app.data(answers);
      cb(null, get(answers, name));
    });
  };
};
