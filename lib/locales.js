/**
 * Locales
 * 国际化工具
 * 1.0.0
 */
'use strict';

const _              = require('lodash');
const Locale         = require('./locale');
const aliasedRequire = require;


class Locales {
}

Locales._baseConfig = {};
Locales._localesMap = {};
Locales._locale = undefined;

function normalizeLocale(key) {
  return key ? key.toLowerCase().replace('_', '-') : key;
}

function absFloor(number) {
  if (number < 0) {
    // -0 -> 0
    return Math.ceil(number) || 0;
  }

  return Math.floor(number);
}

function toInt(argumentForCoercion) {
  const coercedNumber = Number(argumentForCoercion);
  let value         = 0;
  if (coercedNumber !== 0 && isFinite(coercedNumber)) {
    value = absFloor(coercedNumber);
  }
  return value;
}

function compareArrays(array1, array2, dontConvert) {
  const len        = Math.min(array1.length, array2.length);
  const lengthDiff = Math.abs(array1.length - array2.length);
  let diffs      = 0;
  let i;
  for (i = 0; i < len; i++) {
    if ((dontConvert && array1[i] !== array2[i])
        || (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
      diffs++;
    }
  }
  return diffs + lengthDiff;
}


// pick the locale from the array
// try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
// substring from most specific to least,
// but move to the next array item if it's a more specific variant than the current root
Locales.chooseLocale = names => {
  let i = 0;
  let j;
  let next;
  let locale;
  let split;

  while (i < names.length) {
    split = normalizeLocale(names[i]).split('-');
    j = split.length;
    next = normalizeLocale(names[i + 1]);
    next = next ? next.split('-') : null;
    while (j > 0) {
      locale = Locales.loadLocale(split.slice(0, j).join('-'));
      if (locale) {
        return locale;
      }
      if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
        // the next array item is better than a shallower substring of this one
        break;
      }
      j--;
    }
    i++;
  }
  return null;
};

Locales.loadLocale = name => {
  if (!Locales._localesMap[name] && (typeof module !== 'undefined') && module && module.exports) {
    try {
      aliasedRequire(`../locale/${name}`);
    } catch (e) {
      // pass
    }
  }
  return Locales._localesMap[name];
};

Locales.defineLocale = (name, config) => {
  if (config) {
    let parentConfig = Locales._baseConfig;
    config.name = name;
    if (Locales._localesMap[name]) {
      parentConfig = Locales._localesMap[name]._config;
    } else if (config.parentLocale) {
      if (Locales._localesMap[config.parentLocale]) {
        parentConfig = Locales._localesMap[config.parentLocale]._config;
      }
    }
    Locales._localesMap[name] = new Locale(_.assign({}, parentConfig, config));
    return Locales._localesMap[name];
  }

  // useful for testing
  delete Locales._localesMap[name];
  return null;
};

Locales.updateLocale = (name, config) => {
  if (config) {
    let locale       = Locales._baseConfig;
    let tmpLocale    = Locales._baseConfig;
    let parentConfig = Locales._baseConfig;
    // MERGE
    tmpLocale = Locales._localesMap(name);
    if (tmpLocale) {
      parentConfig = tmpLocale._config;
    }
    config = _.assign({}, parentConfig, config);
    locale = new Locale(config);
    locale.parentLocale = Locales._localesMap[name];
    Locales._localesMap[name] = locale;

    // backwards compat for now: also set the locale
    Locales.getLocale(name);
  } else {
    // pass null for config to unupdate, useful for tests
    // eslint-disable-next-line no-lonely-if
    if (Locales._localesMap[name]) {
      if (Locales._localesMap[name].parentLocale) {
        Locales._localesMap[name] = Locales._localesMap[name].parentLocale;
      } else if (Locales._localesMap[name]) {
        delete Locales._localesMap[name];
      }
    }
  }
  return Locales._localesMap[name];
};

// returns locale data
Locales.getLocale = key => {
  let locale;
  if (!key) {
    return Locales._locale;
  }
  if (!_.isArray(key)) {
    locale = Locales.loadLocale(key);
    if (locale) {
      return locale;
    }
    key = [key];
  }
  return Locales.chooseLocale(key);
};

Locales.listLocales = () => {
  return _.keys(Locales._localesMap);
};

Locales.getSetGlobalLocale = (key, values) => {
  let data;
  if (key) {
    if (_.isUndefined(values)) {
      data = Locales.getLocale(key);
    } else {
      data = Locales.defineLocale(key, values);
    }

    if (data) {
      // moment.duration._locale = moment._locale = data;
      Locales._locale = data;
    }
  }

  return Locales._locale;
};

module.exports = Locales;
