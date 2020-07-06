
/**
 * 3.5.1
 */
'use strict';
// const Promise = require('bluebird');
const getparams = require('./lib/getparams');
const type      = require('./lib/type');

const Locales = require('./lib/locales');

module.exports = Valparams;

/* eslint-disable max-len */

/**
 * example use
 * ---
 * ```js
 * // 可以全局定义
 * const Valparams = require('path/to/Valparams[/index]');
 * Valparams.locale('zh-cn');
 *
 * function list(req, res, next) {
 *   let validater = Valparams.setParams(req, {
 *     sysID : {alias:'sid',type: 'int', required: true, desc: '所属系统id'},
 *     page  : {type: 'int', required: false, defValue: 1,range:{min:0}, desc: '页码'},
 *     size  : {type: 'int', required: false, defValue: 30, desc: '页面大小'},
 *     offset: {type: 'int', required: false, defValue: 0, desc: '位移'}
 *   }, {
 *     choices : [{fields: ['sysID', 'page'], count: 1, force: false}],
 *   });
 *   if (validater.err && validater.err.length) {
 *     console.log(validater.err);
 *   }
 *   else {
 *     console.log(validater);
 *     //{ query: { page: 1, size: 30 },
 *     //  body: {},
 *     //  params: { sysID: 2 },
 *     //  all: { sysID: 2, page: 1, size: 30 },
 *     //  err: null }
 *     //  raw: { query: { page: 1, size: 30 },
 *     //         body: {},
 *     //         params: { sid: 2 },
 *     //       }
 *     //}
 *     //do something
 *   }
 * }
 * ```
 *
 */
function Valparams() {
  this.query = {};
  this.body = {};
  this.params = {};
  this.headers = {};
  this.cookies = {};
  this.signedCookies = {};
  this.all = {};
  this.raw = { query: {}, body: {}, params: {}, headers: {}, cookies: {}, signedCookies: {}, all: {} };
  this.err = null;
}

Valparams.defineLocale = Locales.defineLocale;
Valparams.updateLocale = Locales.updateLocale;
Valparams.locale = Locales.getSetGlobalLocale;
Valparams.localeData = Locales.getLocale;
Valparams.locales = Locales.listLocales;

// 默认用英文
Valparams.locale('en');

/**
 * @typedef ParamsConfig
 * @type {Object}
 * @property {'headers'|'cookies'|'signedCookies'|'params'|'query'|'body'}  [from] 来源，如果存在 alias | key 同名的情况下，需要用该参数来确定区别来源
 * @property {string}  [alias] 参数别名，定义该值，前端就用该值传参数来而不是pname
 * @property {string}  type    参数类型
 * @property {boolean} [required] 参数是否必选
 * @property {Object}  [range]    参数范围限制
 * @property {Array}   [range.in]     在指定值列表中
 * @property {*}       [range.min]    最小值|最短|最早（不同 type 参数 含义有所差异）
 * @property {*}       [range.max]    最大值|最长|最晚（不同 type 参数 含义有所差异）
 * @property {RegExp}  [range.reg]    符合指定正则表达式
 * @property {Object}  [range.schema] jsonSchema，针对JSON类型参数有效，使用ajv对参数进行格式控制
 * @property {*}       [defValue] 默认值，没传参数或参数验证出错时生效，此时会将该值赋值到相应参数上
 * @property {boolean} [trim]          是否去掉参数前后空格字符，默认false
 * @property {boolean} [allowEmptyStr] 是否允许空串变量 默认不允许， 即 XXXX?YYY= 这种路由 YYY这个参数是否接受
 * @property {boolean} [allowNull] 是否允许 Null 值变量 默认不允许，开启时 传递 x=null 或 x='null' 时，可以跳过类型检查，将 null 值直接赋予 x 参数
 * @property {boolean} [signed] from=cookies 用，cookie 是否已签名加密，此时也等价于 from=signedCookies
 * @property {string}  [desc] 参数描述 用于出错返回的提示
 */

/**
 * setParams
 *
 * @param {Object} req
 * @param {string} req.method 请求方法
 * @param {Object} [req.params]  params
 * @param {Object} [req.query]   query
 * @param {Object} [req.body]    body
 * @param {Object} [req.headers] headers
 * @param {Object} [req.cookies] cookies
 * @param {Object} [req.signedCookies] signedCookies
 * @param {Object.<string, {from:string, alias:string, type:string, required:boolean, range: {in: Array, min, max, reg:RegExp, schema},
 *                defValue, trim:boolean, allowEmptyStr:boolean, allowNull:boolean, signed:boolean, desc:string}>} params 参数配置  {@link ParamsConfig}
 * @param {Object}  options 参数之间关系配置
 * @param {Object[]} options.choices 参数挑选规则 | [{fields: ['p22', 'p23', 'p24'], count: 2, force: true}] 表示'p22', 'p23', 'p24' 参数三选二
 * @param {string[]} options.choices[].fields 涉及的参数
 * @param {number}   options.choices[].count  需要至少传 ${count} 个
 * @param {boolean}  options.choices[].force  默认 false，为 true 时，涉及的参数中只能传 ${count} 个, 为 false 时，可以多于 ${count} 个
 * @param {string[]} options.equals 相等关系，列表中参数的值必须相等
 * @param {string[]} options.compares 大小比较关系，列表中参数的值必须依次变大
 * @param {Object[]} options.cases 参数条件判断 | [{when: ['p30'], then: ['p31'], not: ['p32']}] 表示 当传了 p30 就必须传 p31 ,同时不能传p32
 * @param {Object[]} options.cases.when 条件, 有俩种写法，1 元素为字符串， 2 元素为对象。元素为字符串时，判断不关心相关字段值，只要有传即可，为对象就要符合相应要求
 * @param {string}   options.cases.when[].field 涉及的参数的名（对象）
 * @param {string}   options.cases.when[].value 涉及的参数的值（对象）需要参数的值与该值相等才为真
 * @param {string}   options.cases.when[] 涉及的参数，（字符串）只要接收到的参数有这个字段即为真
 * @param {string[]} options.cases.then 符合 when 条件时，需要必传的参数
 * @param {string[]} options.cases.not  符合 when 条件时，不能接收的参数
 */
Valparams.prototype.setParams = function(req, params, options) {
  let validate = params;
  if (!validate) {
    // 都没有赋空
    validate = {};
  }
  const ret   = getparams.getValParams.bind(Valparams)({ req, validate, all: true, options });
  this.query = ret.ret.query;
  this.body = ret.ret.body;
  this.params = ret.ret.params;
  this.headers = ret.ret.headers;
  this.cookies = ret.ret.cookies;
  this.signedCookies = ret.ret.signedCookies;
  this.all = ret.ret.all;
  this.raw = ret.ret.raw;
  this.err = ret.err;
};

/**
 * static setParams
 *
 * @param {Object} req
 * @param {string} req.method 请求方法
 * @param {Object} [req.params]  params
 * @param {Object} [req.query]   query
 * @param {Object} [req.body]    body
 * @param {Object} [req.headers] headers
 * @param {Object} [req.cookies] cookies
 * @param {Object} [req.signedCookies] signedCookies
 * @param {Object.<string, {from:string, alias:string, type:string, required:boolean, range: {in: Array, min, max, reg:RegExp, schema},
 *                defValue, trim:boolean, allowEmptyStr:boolean, allowNull:boolean, signed:boolean, desc:string}>} params 参数配置  {@link ParamsConfig}
 * @param {Object}  options 参数之间关系配置
 * @param {Object[]} options.choices 参数挑选规则 | [{fields: ['p22', 'p23', 'p24'], count: 2, force: true}] 表示'p22', 'p23', 'p24' 参数三选二
 * @param {string[]} options.choices[].fields 涉及的参数
 * @param {number}   options.choices[].count  需要至少传 ${count} 个
 * @param {boolean}  options.choices[].force  默认 false，为 true 时，涉及的参数中只能传 ${count} 个, 为 false 时，可以多于 ${count} 个
 * @param {string[]} options.equals 相等关系，列表中参数的值必须相等
 * @param {string[]} options.compares 大小比较关系，列表中参数的值必须依次变大
 * @param {Object[]} options.cases 参数条件判断 | [{when: ['p30'], then: ['p31'], not: ['p32']}] 表示 当传了 p30 就必须传 p31 ,同时不能传p32
 * @param {Object[]} options.cases.when 条件, 有俩种写法，1 元素为字符串， 2 元素为对象。元素为字符串时，判断不关心相关字段值，只要有传即可，为对象就要符合相应要求
 * @param {string}   options.cases.when[].field 涉及的参数的名（对象）
 * @param {string}   options.cases.when[].value 涉及的参数的值（对象）需要参数的值与该值相等才为真
 * @param {string}   options.cases.when[] 涉及的参数，（字符串）只要接收到的参数有这个字段即为真
 * @param {string[]} options.cases.then 符合 when 条件时，需要必传的参数
 * @param {string[]} options.cases.not  符合 when 条件时，不能接收的参数
 *
 * @returns {{ err: { type:string, err:string[] }[], ret: { params:Object, query:Object, body:Object, query:Object, headers:Object, cookies:Object, signedCookies:Object, all:Object,
 *                                                          raw: { query:Object, body:Object, params:Object, headers:Object, cookies:Object, signedCookies:Object, all:Object } } }}
 */
Valparams.setParams = function(req, params, options) {
  let validate = params;
  if (!validate) {
    // 都没有赋空
    validate = {};
  }
  return getparams.getValParams.bind(Valparams)({ req, validate, all: true, options });
};

/**
 * static setParamsAsync
 *
 * @param {Object} req
 * @param {string} req.method 请求方法
 * @param {Object} [req.params]  params
 * @param {Object} [req.query]   query
 * @param {Object} [req.body]    body
 * @param {Object} [req.headers] headers
 * @param {Object} [req.cookies] cookies
 * @param {Object} [req.signedCookies] signedCookies
 * @param {Object.<string, {from:string, alias:string, type:string, required:boolean, range: {in: Array, min, max, reg:RegExp, schema},
 *                defValue, trim:boolean, allowEmptyStr:boolean, allowNull:boolean, signed:boolean, desc:string}>} params 参数配置  {@link ParamsConfig}
 * @param {Object}  options 参数之间关系配置
 * @param {Object[]} options.choices 参数挑选规则 | [{fields: ['p22', 'p23', 'p24'], count: 2, force: true}] 表示'p22', 'p23', 'p24' 参数三选二
 * @param {string[]} options.choices[].fields 涉及的参数
 * @param {number}   options.choices[].count  需要至少传 ${count} 个
 * @param {boolean}  options.choices[].force  默认 false，为 true 时，涉及的参数中只能传 ${count} 个, 为 false 时，可以多于 ${count} 个
 * @param {string[]} options.equals 相等关系，列表中参数的值必须相等
 * @param {string[]} options.compares 大小比较关系，列表中参数的值必须依次变大
 * @param {Object[]} options.cases 参数条件判断 | [{when: ['p30'], then: ['p31'], not: ['p32']}] 表示 当传了 p30 就必须传 p31 ,同时不能传p32
 * @param {Object[]} options.cases.when 条件, 有俩种写法，1 元素为字符串， 2 元素为对象。元素为字符串时，判断不关心相关字段值，只要有传即可，为对象就要符合相应要求
 * @param {string}   options.cases.when[].field 涉及的参数的名（对象）
 * @param {string}   options.cases.when[].value 涉及的参数的值（对象）需要参数的值与该值相等才为真
 * @param {string}   options.cases.when[] 涉及的参数，（字符串）只要接收到的参数有这个字段即为真
 * @param {string[]} options.cases.then 符合 when 条件时，需要必传的参数
 * @param {string[]} options.cases.not  符合 when 条件时，不能接收的参数
 *
 * @returns {{ err: { type:string, err:string[] }[], ret: { params:Object, query:Object, body:Object, query:Object, headers:Object, cookies:Object, signedCookies:Object, all:Object,
 *                                                          raw: { query:Object, body:Object, params:Object, headers:Object, cookies:Object, signedCookies:Object, all:Object } } }}
 */
Valparams.setParamsAsync = function(req, params, options) {
  let validate = params;
  if (!validate) {
    // 都没有赋空
    validate = {};
  }
  const ret = getparams.getValParams.bind(Valparams)({ req, validate, all: true, options });
  return new Promise(function(resolve, reject) {
    if (ret.err) {
      return reject(ret.err);
    }

    return resolve(ret.ret);
  });
};

Valparams.vType = type.vType;
