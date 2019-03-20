'use strict';
/**
 * Locale
 * Class
 * 1.0.0
 */

const _ = require('lodash');

class Locale {
  constructor(config) {
    if (config) {
      this.set(config);
    }
  }

  set(config) {
    let prop;
    let i;
    for (i in config) {
      prop = config[i];
      if (_.isFunction(prop)) {
        this[i] = prop;
      } else {
        this[`_${i}`] = prop;
      }
    }
    this._config = config;
  }
}

module.exports = Locale;
