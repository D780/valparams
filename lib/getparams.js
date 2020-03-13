/* eslint-disable no-lonely-if */

'use strict';

/**
 * getValParams
 * 该工具不能处理query和body或params同时出现同一个变量的情况
 * 如 XXX/:aid?aid=3
 * 这种情况可能会出异常,也不推荐这么用吧（感觉也不会有这么用的吧）
 * 3.8.0
 */
/* eslint-disable global-require */
/* eslint-disable max-statements */
/* eslint-disable max-depth */
/* eslint-disable no-unused-expressions */
/* eslint-disable max-len */

const v = require('validator');
const _ = require('lodash');

const vType      = require('./type').vType;
const rangeTypes = require('./type').rangeTypes;

// 运算符使用 sequelize@4 的 Symbol 样式
let Op;
try {
  const Sequelize = require('sequelize');
  Op = Sequelize.Op;
} catch (err) {
  Op = {
    eq           : '$eq',
    ne           : '$ne',
    gte          : '$gte',
    gt           : '$gt',
    lte          : '$lte',
    lt           : '$lt',
    not          : '$not',
    is           : '$is',
    in           : '$in',
    notIn        : '$notIn',
    like         : '$like',
    notLike      : '$notLike',
    iLike        : '$iLike',
    notILike     : '$notILike',
    regexp       : '$regexp',
    notRegexp    : '$notRegexp',
    iRegexp      : '$iRegexp',
    notIRegexp   : '$notIRegexp',
    between      : '$between',
    notBetween   : '$notBetween',
    overlap      : '$overlap',
    contains     : '$contains',
    contained    : '$contained',
    adjacent     : '$adjacent',
    strictLeft   : '$strictLeft',
    strictRight  : '$strictRight',
    noExtendRight: '$noExtendRight',
    noExtendLeft : '$noExtendLeft',
    and          : '$and',
    or           : '$or',
    any          : '$any',
    all          : '$all',
    values       : '$values',
    col          : '$col',
    placeholder  : '$placeholder',
    join         : '$join',
    raw          : '$raw',
  };
}

let validators = require('./validators');

module.exports = {
  getParams,
  getValParams,
};

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
 * @property {boolean} [allowEmptyStr] 是否允许空串变量 默认不允许，即 XXXX?YYY= 这种路由 YYY这个参数是否接受
 * @property {boolean} [allowNull] 是否允许 Null 值变量 默认不允许，开启时 传递 x=null 或 x='null' 时，可以跳过类型检查，将 null 值直接赋予 x 参数
 * @property {boolean} [signed] from=cookies 用，cookie 是否已签名加密，此时也等价于 from=signedCookies
 * @property {string}  [desc] 参数描述 用于出错返回的提示
 */

/**
 * 获取参数
 * @param {Object} req
 * @param {string} req.method 请求方法
 * @param {Object} [req.params]  params
 * @param {Object} [req.query]   query
 * @param {Object} [req.body]    body
 * @param {Object} [req.headers] headers
 * @param {Object} [req.cookies] cookies
 * @param {Object} [req.signedCookies] signedCookies
 * @param {boolean} all
 * @returns {{ params: Object, query: Object, body: Object, headers: Object, cookies: Object, signedCookies: Object, all: Object }}
 */
function getParams(req, all) {
  const val = { query: {}, body: {}, params: {}, headers: {}, cookies: {}, signedCookies: {}, all: {} };
  if (all) {
    // 获取全部参数
    for (const k in req.query) {
      val.query[k] = req.query[k];
      val.all[`query.${k}`] = req.query[k];
    }
    for (const k in req.body) {
      val.body[k] = req.body[k];
      val.all[`body.${k}`] = req.body[k];
    }
  } else {
    if (req.method === 'GET') {
      for (const k in req.query) {
        val.query[k] = req.query[k];
        val.all[`query.${k}`] = req.query[k];
      }
    } else {
      for (const k in req.body) {
        val.body[k] = req.body[k];
        val.all[`body.${k}`] = req.body[k];
      }
    }
  }
  // 所有method都应该获取req.params
  for (const k in req.params) {
    val.params[k] = req.params[k];
    val.all[`params.${k}`] = req.params[k];
  }
  // 获取 headers、cookies、signedCookies 参数
  for (const k in req.headers) {
    val.headers[k] = req.headers[k];
    val.all[`headers.${k}`] = req.headers[k];
  }
  // cookie 分是否签名两种
  for (const k in req.cookies) {
    val.cookies[k] = req.cookies[k];
    val.all[`cookies.${k}`] = req.cookies[k];
  }
  for (const k in req.signedCookies) {
    val.signedCookies[k] = req.signedCookies[k];
    val.all[`signedCookies.${k}`] = req.signedCookies[k];
  }

  return val;
}

/**
 * 获取通过验证的参数  改用对象形式验证参数
 * @param {Object}  params { req, all, validate, options, json }
 * @param {Object} params.req 请求体
 * @param {string} [params.req.method='GET'] 请求方法
 * @param {Object} [params.req.params]  params
 * @param {Object} [params.req.query]   query
 * @param {Object} [params.req.body]    body
 * @param {Object} [params.req.headers] headers
 * @param {Object} [params.req.cookies] cookies
 * @param {Object} [params.req.signedCookies] signedCookies
 * @param {boolean} params.all 是否返回全部数据
 * @param {Object.<string, {from:string, alias:string, type:string, required:boolean, range: {in: Array, min, max, reg:RegExp, schema: Object},
 *                defValue, trim:boolean, allowEmptyStr:boolean, allowNull:boolean, signed:boolean, desc:string}>} params.validate 参数配置  {@link ParamsConfig}
 * @param {Object}  params.options 参数之间关系配置
 * @param {Object[]} params.options.choices 参数挑选规则 | [{fields: ['p22', 'p23', 'p24'], count: 2, force: true}] 表示'p22', 'p23', 'p24' 参数三选二
 * @param {string[]} params.options.choices[].fields 涉及的参数
 * @param {number}   params.options.choices[].count  需要至少传 ${count} 个
 * @param {boolean}  params.options.choices[].force  默认 false，为 true 时，涉及的参数中只能传 ${count} 个, 为 false 时，可以多于 ${count} 个
 * @param {string[]} params.options.equals 相等关系，列表中参数的值必须相等
 * @param {string[]} params.options.compares 大小比较关系，列表中参数的值必须依次变大
 * @param {Object[]} params.options.cases 参数条件判断 | [{when: ['p30'], then: ['p31'], not: ['p32']}] 表示 当传了 p30 就必须传 p31 ,同时不能传p32
 * @param {Object[]} params.options.cases.when 条件, 有俩种写法，1 元素为字符串， 2 元素为对象。元素为字符串时，判断不关心相关字段值，只要有传即可，为对象就要符合相应要求
 * @param {string}   params.options.cases.when[].field 涉及的参数的名（对象）
 * @param {string}   params.options.cases.when[].value 涉及的参数的值（对象）需要参数的值与该值相等才为真
 * @param {string}   params.options.cases.when[] 涉及的参数，（字符串）只要接收到的参数有这个字段即为真
 * @param {string[]} params.options.cases.then 符合 when 条件时，需要必传的参数
 * @param {string[]} params.options.cases.not  符合 when 条件时，不能接收的参数
 * @returns {{ err: { type:string, err:string[] }, ret: { params:Object, query:Object, body:Object, query:Object, all:Object,
 *                                                          raw: { query:Object, body:Object, params:Object, all:Object } } }}
 */
function getValParams(params) {
  const dealParamsFunc = dealParams.bind(this);
  const localData = this.localeData ? this.localeData() : {
    em_range_relation: _.template('${desc?desc+"\'s ":""}relationship of values has error'),
    em_choices       : _.template('must choice ${force?"":"at least "}${count} from [`${fields.join("`,`")}`]'),
    em_equals        : _.template('[`${fields.join("`,`")}`] must be equal'),
    em_compares      : _.template('[`${fields.join("`,`")}`] must be progressive increase'),
    em_cases         : opt => {
      opt.when = opt.when || [];
      opt.then = opt.then || [];
      opt.not = opt.not || [];
      _.map(opt.when, (whenField, idx) => {
        if (typeof whenField === 'string' || _.isUndefined(whenField.value)) {
          opt.when[idx] = `${whenField.field}` || `${whenField}`;
        } else {
          opt.when[idx] = `${whenField.field} = ${whenField.value}`;
        }
      });
      return _.template(
        'when pass ${when.join("`,`")}, ${then.length?"must pass params: `"+then.join("`,`")+"`":""}${then.length&&not.length?",and ":""}${not.length?" cann\'t pass params: `"+not.join("`,`")+"`":""}')(
        opt);
    },
  };

  const req       = params.req;
  req.method = req.method || 'GET';
  const method    = req.method;
  const all       = params.all || true;
  const validate  = params.validate;
  const options   = params.options || {};
  const val       = getParams(req, all);
  const allParams = val.all;
  let errParams   = [];
  const retParams = {
    query        : {},
    body         : {},
    params       : {},
    headers      : {},
    cookies      : {},
    signedCookies: {},
    all          : {},
    raw          : val,
  };
  const keymap    = {};
  const keymapR    = {};
  // if (!Array.isArray(validate)) {
  //   validate = _.map(validate, (value, key) => ({ key, ...value }));
  // }
  // 参数验证
  // for (const idx in validate) {
  for (const key in validate) {
    // const validateItem = validate[idx];
    // const key = validateItem.key;
    const validateItem = validate[key];
    validateItem.desc = validateItem.desc || key;
    // 一些默认选项
    // type string
    // required false
    // alias 默认是键名 即key 设置了别名外部输入参数就只能用别名
    // 讨论 应该只能用别名还是两者均能用？
    // 160421想法 应该两个均能用：缩写用于query 全称用于post
    // 180809想法 只能用其一：不产生歧义，采用严格点的方式
    //
    if (validateItem.trim === undefined) {
      validateItem.trim = false;
    }
    if (validateItem.type === undefined) {
      validateItem.type = 'string';
    }
    if (validateItem.required === undefined) {
      // 兼容旧参数must
      if (validateItem.must !== undefined) {
        validateItem.required = validateItem.must;
      } else {
        validateItem.required = false;
      }
    }
    // from === 'cookies' && signed  ==>  from === 'signedCookies'
    if (validateItem.from === 'cookies' && validateItem.signed) {
      validateItem.from = 'signedCookies';
    }
    const alias    = validateItem.alias || key;
    const paramKey = getParamKey(allParams, alias, validateItem.from, method);
    keymap[paramKey] = key;
    keymapR[key] = paramKey;
    if (rangeTypes.indexOf(validateItem.type) >= 0) {
      const aliasMin = `${paramKey}>`;
      const aliasMax = `${paramKey}<`;
      // keymap[key] = key;
      const type     = validateItem.type === 'range' ? 'all' : validateItem.type.replace('Range', '');
      let ret;
      let success    = false;
      const errmsg     = [];
      // 是否必选和默认值不在dealParams判断，后面得到ret的时候判断
      const resulteq = dealParamsFunc({
        desc         : validateItem.desc,
        value        : allParams[paramKey],
        allowEmptyStr: validateItem.allowEmptyStr || false,
        allowNull    : validateItem.allowNull || false,
        type,
        range        : validateItem.range,
        required     : false,
        defValue     : undefined,
        trim         : validateItem.trim,
      });
      if (resulteq.success && resulteq.value !== undefined) {
        ret = resulteq.value;
        errmsg.push({ key, type, value: allParams[paramKey], err: resulteq.errmsg });
      }
      success = success || resulteq.success;
      if (ret === undefined) {
        if (allParams[aliasMin]) {
          ret = ret || {};
          let value   = allParams[aliasMin];
          let equalgt = false;
          if (/^:/.test(value)) {
            equalgt = true;
            value = allParams[aliasMin].slice(1);
          }
          const resultgt = dealParamsFunc({
            desc         : validateItem.desc,
            value,
            allowEmptyStr: validateItem.allowEmptyStr || false,
            allowNull    : validateItem.allowNull || false,
            type,
            range        : validateItem.range,
            required     : false,
            defValue     : undefined,
            trim         : validateItem.trim,
          });
          if (resultgt.success && resultgt.value !== undefined) {
            if (equalgt) {
              ret[Op.gte] = resultgt.value;
            } else {
              ret[Op.gt] = resultgt.value;
            }
          }
          success ? success = resultgt.success : 1;
          !resultgt.success ? errmsg.push({
            key: aliasMin + (equalgt ? '=' : ''),
            type,
            value,
            err: resultgt.errmsg,
          }) : 1;
        }
        if (allParams[aliasMax]) {
          ret = ret || {};
          let value   = allParams[aliasMax];
          let equallt = false;
          if (/^:/.test(value)) {
            equallt = true;
            value = allParams[aliasMax].slice(1);
          }
          const resultlt = dealParamsFunc({
            desc         : validateItem.desc,
            value,
            allowEmptyStr: validateItem.allowEmptyStr || false,
            allowNull    : validateItem.allowNull || false,
            type,
            range        : validateItem.range,
            required     : false,
            defValue     : undefined,
            trim         : validateItem.trim,
          });
          if (resultlt.success && resultlt.value !== undefined) {
            if (equallt) {
              ret[Op.lte] = resultlt.value;
            } else {
              ret[Op.lt] = resultlt.value;
            }
          }
          success ? success = resultlt.success : 1;
          !resultlt.success ? errmsg.push({
            key: aliasMax + (equallt ? '=' : ''),
            type,
            value,
            err: resultlt.errmsg,
          }) : 1;
        }
        if (success && ret) {
          // 简单判断成功了，这里还要检测>=6&&<=4这种矛盾的情况
          if (!(ret[Op.gte] && ret[Op.lte] && ret[Op.gte] === ret[Op.lte])) {
            const gtData = ret[Op.gte] || ret[Op.gt];
            const ltData = ret[Op.lte] || ret[Op.lt];
            if (gtData && ltData && gtData >= ltData) {
              errmsg.push(localData.em_range_relation({ desc: validateItem.desc }));
              success = false;
            }
          }
        }
      }
      if (ret !== undefined) {
        retParams.all[key] = ret;
      }
      if (!success) {
        errParams.push({ key, desc: validateItem.desc, type: validateItem.type, err: errmsg });
      }
    } else {
      // const alias    = validateItem.alias || key;
      // keymap[key] = alias;
      const result = dealParamsFunc({
        desc         : validateItem.desc,
        value        : allParams[paramKey],
        allowEmptyStr: validateItem.allowEmptyStr || false,
        allowNull    : validateItem.allowNull || false,
        type         : validateItem.type,
        range        : validateItem.range,
        required     : validateItem.required,
        defValue     : validateItem.defValue,
        trim         : validateItem.trim,
      });
      if (result.success) {
        if (result.value !== undefined) {
          retParams.all[key] = result.value;
        }
      } else {
        const err = {
          key,
          desc : validateItem.desc,
          type : validateItem.type,
          value: allParams[paramKey],
          err  : result.errmsg };
        if (result.extmsg) {
          err.ext = result.extmsg;
        }
        errParams.push(err);
      }
    }
  }

  // 参数关系验证
  // M 选 N 关系
  if (options.choices && options.choices.length) {
    const errList = [];
    _.map(options.choices, choice => {
      if (Array.isArray(choice)) {
        choice = { fields: choice, force: false, count: 1 };
      }
      choice.count = Number(choice.count) || 1;
      if (choice.count) {
        const flag = checkChoice(retParams.all, choice);
        if (!flag) {
          const emOpts    = {
            fields: choice.fields,
            count : choice.count,
            force : choice.force,
          };
          emOpts.fields = _.map(choice.fields, field => {
            return validate[field] ? validate[field].desc : field;
          });
          errList.push(localData.em_choices(emOpts));
        }
      }
    });
    if (errList.length) {
      errParams.push({ type: 'choices', err: errList });
    }
  }
  // 相等关系
  if (options.equals && options.equals.length) {
    const errList = [];
    _.map(options.equals, fields => {
      if (fields.length >= 2) {
        const flag = checkEquals(retParams.all, fields);
        if (!flag) {
          const emFields = _.map(fields, field => {
            return validate[field] ? validate[field].desc : field;
          });
          errList.push(localData.em_equals({ fields: emFields }));
        }
      }
    });
    if (errList.length) {
      errParams.push({ type: 'equals', err: errList });
    }
  }
  // 比较关系
  if (options.compares && options.compares.length) {
    const errList = [];
    _.map(options.compares, fields => {
      if (fields.length >= 2) {
        const flag = checkCompare(retParams.all, fields);
        if (!flag) {
          const emFields = _.map(fields, field => {
            return validate[field] ? validate[field].desc : field;
          });
          errList.push(localData.em_compares({ fields: emFields }));
        }
      }
    });
    if (errList.length) {
      errParams.push({ type: 'compares', err: errList });
    }
  }
  // 条件关系
  if (options.cases && options.cases.length) {
    const errList = [];
    _.map(options.cases, caseInfo => {
      const flag = checkCase(retParams.all, caseInfo);
      if (!flag) {
        const emOpt  = {};
        emOpt.when = _.map(caseInfo.when, whenField => {
          if (typeof whenField === 'string') {
            return validate[whenField] ? validate[whenField].desc : whenField;
          }
          return {
            field: validate[whenField.field] ? validate[whenField.field].desc : whenField.field,
            value: whenField.value,
          };
        });
        emOpt.then = _.filter(_.map(caseInfo.then, thenField => {
          if (typeof thenField === 'string') {
            return validate[thenField] ? validate[thenField].desc : thenField;
          }
          if (typeof thenField === 'object' && thenField.choice) {
            const fields = _.map(thenField.choice.fields, field => validate[field].desc);
            return {
              total: fields.length,
              count: thenField.choice.count,
              force: thenField.choice.force,
              fields,
            };
          }
        }));
        emOpt.not = _.map(caseInfo.not, notField => {
          return validate[notField] ? validate[notField].desc : notField;
        });
        errList.push(localData.em_cases(emOpt));
      }
    });
    if (errList.length) {
      errParams.push({ type: 'cases', err: errList });
    }
  }

  if (!errParams.length) {
    errParams = null;
  }
  // 处理 retParams 里面的 query、body、params、headers、cookies、signedCookies
  for (const key in retParams.all) {
    const paramKey = keymapR[key];
    const paramCategory = paramKey.split('.')[0];
    retParams[paramCategory][key] = retParams.all[key];
  }
  return { err: errParams, ret: retParams };
}

/**
 * 获取参数名称（带 from）
 * @param {Object} allParams - 所有参数
 * @param {string} key  - 键名
 * @param {string} from - 来源
 * @param {string} method - 请求方法
 * @returns {*}
 */
function getParamKey(allParams, key, from, method) {
  // 如果有设置 from，则直接返回对应 from 的参数
  // 否则优先获取 params
  // 若无则根据 method 决定优先级，GET 取 query > body，其他取 body > query
  // 即 headers、cookies、signedCookies 是必须指定了 from 才会获取
  if (from && ['params', 'body', 'query', 'headers', 'cookies', 'signedCookies'].indexOf(from) >= 0) {
    return `${from}.${key}`;
  }
  if (!_.isUndefined(allParams[`params.${key}`])) {
    return `params.${key}`;
  }
  if (method === 'GET') {
    if (!_.isUndefined(allParams[`query.${key}`])) {
      return `query.${key}`;
    }
    if (!_.isUndefined(allParams[`body.${key}`])) {
      return `body.${key}`;
    }
    return `query.${key}`;
  }

  if (!_.isUndefined(allParams[`body.${key}`])) {
    return `body.${key}`;
  }
  if (!_.isUndefined(allParams[`query.${key}`])) {
    return `query.${key}`;
  }
  return `body.${key}`;
}

/**
 * 获取参数值
 * @param {Object} allParams - 所有参数
 * @param {string} key  - 键名
 * @param {string} from - 来源
 * @param {string} method - 请求方法
 * @returns {*}
 */
function getParamValue(allParams, key, from, method) {
  // 如果有设置 from，则直接返回对应 from 的参数
  // 否则优先获取 params
  // 若无则根据 method 决定优先级，GET 取 query > body，其他取 body > query
  // 即 headers、cookies、signedCookies 是必须指定了 from 才会获取
  if (from && ['params', 'body', 'query', 'headers', 'cookies', 'signedCookies'].indexOf(from) >= 0) {
    return allParams[`${from}.${key}`];
  }
  if (!_.isUndefined(allParams[`params.${key}`])) {
    return allParams[`params.${key}`];
  }
  if (method === 'GET') {
    if (!_.isUndefined(allParams[`query.${key}`])) {
      return allParams[`query.${key}`];
    }
    if (!_.isUndefined(allParams[`body.${key}`])) {
      return allParams[`body.${key}`];
    }
    return allParams[`query.${key}`];
  }

  if (!_.isUndefined(allParams[`body.${key}`])) {
    return allParams[`body.${key}`];
  }
  if (!_.isUndefined(allParams[`query.${key}`])) {
    return allParams[`query.${key}`];
  }
  return allParams[`body.${key}`];
}

/**
 * 参数处理
 * @param {Object} options
 * @param {string} options.value 参数值
 * @param {string} options.type  参数类型
 * @param {Object} options.range 参数范围
 * @param {boolean} options.required 是否必选
 * @param {*} options.defValue 默认值
 * @param {Object} options.trim
 * @returns {{ success: boolean, value: undefined, errmsg: (*|undefined), extmsg: (*|undefined) }}
 */
function dealParams(options) {
  validators = validators.bind(this);
  const localData = this.localeData ? this.localeData() : {
    em_required: _.template('${desc?desc:"params"} is required'),
  };

  let value          = options.value;
  const allowEmptyStr = options.allowEmptyStr;
  const allowNull = options.allowNull;
  const desc          = options.desc || '';
  const type          = options.type;
  const range         = options.range;
  const required      = options.required;
  const defValue      = options.defValue;
  const trim          = options.trim;
  if (value === '' && !allowEmptyStr) {
    value = undefined;
  }

  if (value && trim) {
    value = _.trim(value);
  }
  let ret;
  let success = true;
  let errmsg;
  let extmsg;
  if (allowNull && (value === 'null' || value === null)) {
    ret = null;
  } else if (/* value !== null &&*/ value !== undefined /* && value !== ''*/) {
    if (typeof value === 'object' && !(value instanceof Date)) {
      value = JSON.stringify(value);
    } else {
      value = `${value}`;
    }

    const checkResult = validators(value, type, range, desc);
    if (checkResult.success) {
      // 验证成功,转换成对应的类型
      switch (type) {
        case vType.DATE: {
          let date = new Date(value);
          if (_.isNaN(date.getTime())) {
            date = new Date(Number(value));
          }
          ret = v.toDate(date.toISOString());
          break;
        }
        case vType.INT:
          ret = v.toInt(value);
          break;
        case vType.FLOAT:
          ret = v.toFloat(value);
          break;
        case vType.NUMBER:
          ret = Number(value);
          break;
        case vType.JSON:
          ret = JSON.parse(value);
          break;
        case vType.BOOL:
        case vType.BOOLEAN:
          ret = v.toBoolean(value);
          break;
        case vType.ARRAY:
          ret = value.split(',');
          break;
        case vType.NULL:
          ret = null;
          break;
        default :
          ret = value;
          break;
      }
    } else {
      // 验证失败，若有默认值赋值，否则记录错误
      // 160422CHANGE 不管参数可选必选，除非有默认值，否则传了就应该符合我们设置的条件，
      // 没有指定参数
      // if (required === false) {
      //   //参数可选pass，有默认值则赋值
      //   if (defValue !== undefined) {
      //     ret = defValue;
      //   }
      // }
      // else {
      // 参数必选，无默认值则记录错误
      if (defValue !== undefined) {
        ret = defValue;
      } else {
        errmsg = checkResult.errmsg;
        extmsg = checkResult.extmsg;
        success = false;
      }
      // }
    }
  } else {
    // 没有指定参数
    if (required === false) {
      // 参数可选 pass，有默认值则赋值
      if (defValue !== undefined) {
        ret = defValue;
      }
    } else {
      // 参数必选，无默认值则记录错误
      // 160422CHANGE 参数必选就必须传，默认值无效
      // if (defValue !== undefined) {
      //   ret = defValue;
      // }
      // else {
      errmsg = [localData.em_required({ desc })];
      success = false;
      // }
    }
  }
  return {
    success,
    value : success ? ret : undefined,
    errmsg: errmsg || undefined,
    extmsg: extmsg || undefined,
  };
}

/**
 * 检查 choice 配置
 * @param {Object} params 参数（retParams.all）
 * @param {Object} choice 配置
 * @returns {boolean}
 */
function checkChoice(params, choice) {
  let flag = true;
  let cnt = 0;
  for (let i = 0; i < choice.fields.length; i++) {
    if (!_.isUndefined(params[choice.fields[i]])) {
      cnt++;
    }
  }
  if (choice.force) {
    if (cnt !== choice.count) {
      flag = false;
    }
  } else if (cnt < choice.count) {
    flag = false;
  }
  return flag;
}

/**
 * 检查 equal 配置
 * @param {Object} params 参数（retParams.all）
 * @param {Object} fields 配置
 * @returns {boolean}
 */
function checkEquals(params, fields) {
  let flag  = true;
  const value = params[fields[0]];
  for (let i = 1; i < fields.length; i++) {
    if (_.isUndefined(params[fields[i]])) {
      continue;
    }
    if (params[fields[i]] !== value) {
      flag = false;
      break;
    }
  }
  return flag;
}

/**
 * 检查 compare 配置
 * @param {Object} params 参数（retParams.all）
 * @param {Object} fields 配置
 * @returns {boolean}
 */
function checkCompare(params, fields) {
  let flag  = true;
  let value = params[fields[0]];
  for (let i = 1; i < fields.length; i++) {
    if (_.isUndefined(params[fields[i]])) {
      continue;
    }
    if (params[fields[i]] < value) {
      flag = false;
      break;
    }
    value = params[fields[i]];
  }
  return flag;
}

/**
 * 检查 case 配置
 * @param {Object} params 参数（retParams.all）
 * @param {Object} caseInfo 配置
 * @returns {boolean}
 */
function checkCase(params, caseInfo) {
  let flag = true;
  let hit  = true;
  if (caseInfo.when) {
    for (let i = 0; i < caseInfo.when.length; i++) {
      let whenField = caseInfo.when[i];
      if (typeof whenField === 'string') {
        // 只要检测是否存在值
        whenField = { field: whenField };
      }
      caseInfo.when[i] = whenField;
      // 需要判断值是否符合条件
      if (_.isUndefined(params[whenField.field])) {
        hit = false;
        break;
      } else if (whenField.value && params[whenField.field] !== whenField.value) {
        hit = false;
        break;
      }
    }
    if (hit) {
      if (caseInfo.then) {
        for (let i = 0; i < caseInfo.then.length; i++) {
          const thenField = caseInfo.then[i];
          if (typeof thenField === 'object' && thenField.choice) {
            let choice = thenField.choice;
            if (Array.isArray(choice)) {
              choice = { fields: choice, force: false, count: 1 };
            }
            choice.count = Number(choice.count) || 1;
            thenField.choice = choice;
            if (choice.count) {
              flag = checkChoice(params, choice);
              if (!flag) {
                break;
              }
            }
          } else {
            if (_.isUndefined(params[thenField])) {
              flag = false;
              break;
            }
          }
        }
      }
      if (flag && caseInfo.not) {
        for (let i = 0; i < caseInfo.not.length; i++) {
          const notField = caseInfo.not[i];
          if (!_.isUndefined(params[notField])) {
            flag = false;
            break;
          }
        }
      }
    }
  }
  return flag;
}
