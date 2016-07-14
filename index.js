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
  var cached = {};

  return function(name, message, options, cb) {
    var args = [].slice.call(arguments, 1);
    cb = args.pop();

    if (typeof cb !== 'function') {
      throw new TypeError('expected a callback function');
    }

    if (cached.hasOwnProperty(name)) {
      var answer = get(cached, name);
      if (typeof answer === 'undefined') {
        answer = '';
      }
      cb(null, answer);
      return;
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

    options = merge({}, this.options, options, opts);
    options.data = merge({}, this.context, options.data);
    options.save = false;

    ask.when(this.app, name, options, function(err, answers) {
      if (err) {
        cb(err);
        return;
      }

      var answer = get(answers, name);
      cached[name] = answer;

      app.data(answers);
      cb(null, answer);
    });
  };
};
