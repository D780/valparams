/**
 * 3.5.0
 */
'use strict';
// const Promise = require('bluebird');
const getparams = require('./lib/getparams');
const type      = require('./lib/type');

const Locales = require('./lib/locales');

module.exports = Valparams;

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
 * @type {Valparams}
 */
function Valparams() {
  this.query  = {};
  this.body   = {};
  this.params = {};
  this.all    = {};
  this.raw    = {query: {}, body: {}, params: {}};
  this.err    = null;
}

Valparams.defineLocale = Locales.defineLocale;
Valparams.updateLocale = Locales.updateLocale;
Valparams.locale       = Locales.getSetGlobalLocale;
Valparams.localeData   = Locales.getLocale;
Valparams.locales      = Locales.listLocales;

// 默认用英文
Valparams.locale('en');

/**
 * ###配置参数格式并进行检测
 * @param {Object} req
 * @param {Object} params {pname:{alias,type,required,range:{in,min,max,reg},defValue,allowEmptyStr,desc[,detail]}}
 * @param {String} params.pname 参数名，同时也是验证后使用的变量名
 * @param {String} params.pname.alias 参数别名，定义该值，前端就用该值传参数来而不是pname
 * @param {String} params.pname.type 参数类型
 * @param {String} params.pname.required 参数是否必选
 * @param {String} params.pname.range 参数范围限制 可用{in,min,max,reg} 分别对应 包含 最小 最大 正则
 *                                        其中minmax对于不同类型有不同的意思，比如int是值大小，string是字符串长度
 * @param {String} params.pname.defValue 参数变量
 * @param {String} params.pname.allowEmptyStr 是否允许空串变量 默认不允许， 即 XXXX?YYY= 这种路由 YYY这个参数是否接受，默认这种情况认为没有传该参数
 * @param {String} params.pname.desc 参数描述 用于出错返回的提示
 * @param {Object} options [{choices:[{fields,count,force}],equals:[],compares:[]]
 */
Valparams.prototype.setParams = function (req, params, options) {
  let validate = params;
  if (!validate) {
    //都没有赋空
    validate = {};
  }
  const ret   = getparams.getValParams.bind(Valparams)({req: req, validate: validate, all: true, options});
  this.query  = ret.ret.query;
  this.body   = ret.ret.body;
  this.params = ret.ret.params;
  this.all    = ret.ret.all;
  this.raw    = ret.ret.raw;
  this.err    = ret.err;
};

Valparams.setParams = function (req, params, options) {
  let validate = params;
  if (!validate) {
    //都没有赋空
    validate = {};
  }
  return getparams.getValParams.bind(Valparams)({req: req, validate: validate, all: true, options});
};

Valparams.setParamsAsync = function (req, params, options) {
  let validate = params;
  if (!validate) {
    //都没有赋空
    validate = {};
  }
  const ret = getparams.getValParams.bind(Valparams)({req: req, validate: validate, all: true, options});
  return new Promise(function (resolve, reject) {
    if (ret.err) {
      return reject(ret.err);
    }
    else {
      return resolve(ret.ret);
    }
  });
};

Valparams.vType = type.vType;
