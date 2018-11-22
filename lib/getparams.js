'use strict';
/**
 * getValParams
 * 该工具不能处理query和body或params同时出现同一个变量的情况
 * 如 XXX/:aid?aid=3
 * 这种情况可能会出异常,也不推荐这么用吧（感觉也不会有这么用的吧）
 * 3.7.0
 */
const v = require('validator');
const _ = require('lodash');

const vType      = require('./type').vType;
const rangeTypes = require('./type').rangeTypes;

// 运算符使用 sequelize@4 的 Symbol 样式
let Op;
try {
  const Sequelize = require('sequelize');
  Op              = Sequelize.Op;
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
    raw          : '$raw'
  };
}

let validators = require('./validators');

module.exports = {
  getParams,
  getValParams
};

/**
 * 获取参数
 * @param req
 * @param all
 * @returns {{}}
 */
function getParams(req, all) {
  const val = {query: {}, body: {}, params: {}, all: {}};
  if (all) {
    //获取全部参数
    for (const k in req.query) {
      val.query[k] = req.query[k];
      val.all[k]   = req.query[k];
    }
    for (const k in req.body) {
      val.body[k] = req.body[k];
      val.all[k]  = req.body[k];
    }
    for (const k in req.params) {
      val.params[k] = req.params[k];
      val.all[k]    = req.params[k];
    }
  }
  else {
    if (req.method === 'GET') {
      val.query = req.query;
      val.all   = req.query;
    }
    else {
      val.body = req.body;
      val.all  = req.body;
    }
    //所有method都应该获取req.params
    for (const k in req.params) {
      val.params[k] = req.params[k];
      val.all[k]    = req.params[k];
    }
  }
  return val;
}

/**
 * 获取通过验证的参数  改用对象形式验证参数
 * @param {object} params  {req,all,validate,options,json}
 * @param fn
 * @returns {*}
 */
function getValParams(params, fn) {
  dealParams    = dealParams.bind(this);
  let localData = this.localeData ? this.localeData() : {
    em_range_relation: _.template('${desc?desc+"\'s ":""}relationship of values has error'),
    em_choices       : _.template('must choice ${force?"":"at least "}${count} from [`${fields.join("`,`")}`]'),
    em_equals        : _.template('[`${fields.join("`,`")}`] must be equal'),
    em_compares      : _.template('[`${fields.join("`,`")}`] must be progressive increase'),
    em_cases         : (opt) => {
      opt.when = opt.when || [];
      opt.then = opt.then || [];
      opt.not  = opt.not || [];
      _.map(opt.when, (whenField, idx) => {
        if (typeof whenField === 'string') {
          whenField = {field: whenField};
        }
        else {
          opt.when[idx] = `${whenField.field} = ${whenField.value}`;
        }
      });
      return _.template(
        'when pass ${when.join("`,`")}, ${then.length?"must pass params: "+then.join("`,`"):""}${then.length&&not.length?",and ":""}${not.length?" cann\'t pass params: "+not.join("`,`"):""}')(
        opt);
    }
  };

  const req       = params.req;
  const all       = params.all || true;
  const validate  = params.validate;
  const options   = params.options || {};
  const val       = getParams(req, all);
  const allParams = val.all;
  let errParams   = [];
  const retParams = {
    query: {}, body: {}, params: {}, all: {},
    raw  : {query: {}, body: {}, params: {}, all: {}}
  };
  const keymap    = {};
  // 参数验证
  for (let key in validate) {
    validate[key].desc = validate[key].desc || key;
    //一些默认选项
    //type string
    //required false
    //alias 默认是键名 即key 设置了别名外部输入参数就只能用别名
    // 讨论 应该只能用别名还是两者均能用？
    // 160421想法 应该两个均能用：缩写用于query 全称用于post
    // 180809想法 只能用其一：不产生歧义，采用严格点的方式
    //
    if (validate[key].trim === undefined) {
      validate[key].trim = false;
    }
    if (validate[key].type === undefined) {
      validate[key].type = 'string';
    }
    if (validate[key].required === undefined) {
      // 兼容旧参数must
      if (validate[key].must !== undefined) {
        validate[key].required = validate[key].must;
      }
      else {
        validate[key].required = false;
      }
    }
    if (rangeTypes.indexOf(validate[key].type) >= 0) {
      const aliasMin = key + '>';
      const aliasMax = key + '<';
      keymap[key]    = key;
      const type     = validate[key].type === 'range' ? 'all' : validate[key].type.replace('Range', '');
      let ret;
      let success    = false;
      let errmsg     = [];
      //是否必选和默认值不在dealParams判断，后面得到ret的时候判断
      const resulteq = dealParams({
        desc         : validate[key].desc,
        value        : allParams[key],
        allowEmptyStr: validate[key].allowEmptyStr || false,
        type         : type,
        range        : validate[key].range,
        required     : false,
        defValue     : undefined,
        trim         : validate[key].trim
      });
      if (resulteq.success && resulteq.value !== undefined) {
        ret = resulteq.value;
        errmsg.push({key, type, value: allParams[key], err: resulteq.errmsg});
      }
      success = success || resulteq.success;
      if (ret === undefined) {
        if (allParams[aliasMin]) {
          ret         = ret || {};
          let value   = allParams[aliasMin];
          let equalgt = false;
          if (/^:/.test(value)) {
            equalgt = true;
            value   = allParams[aliasMin].slice(1);
          }
          const resultgt = dealParams({
            desc         : validate[key].desc,
            value        : value,
            allowEmptyStr: validate[key].allowEmptyStr || false,
            type         : type,
            range        : validate[key].range,
            required     : false,
            defValue     : undefined,
            trim         : validate[key].trim
          });
          if (resultgt.success && resultgt.value !== undefined) {
            if (equalgt) {
              ret[Op.gte] = resultgt.value;
            }
            else {
              ret[Op.gt] = resultgt.value;
            }
          }
          success ? success = resultgt.success : 1;
          !resultgt.success ? errmsg.push({
            key: aliasMin + (equalgt ? '=' : ''),
            type,
            value,
            err: resultgt.errmsg
          }) : 1;
        }
        if (allParams[aliasMax]) {
          ret         = ret || {};
          let value   = allParams[aliasMax];
          let equallt = false;
          if (/^:/.test(value)) {
            equallt = true;
            value   = allParams[aliasMax].slice(1);
          }
          const resultlt = dealParams({
            desc         : validate[key].desc,
            value        : value,
            allowEmptyStr: validate[key].allowEmptyStr || false,
            type         : type,
            range        : validate[key].range,
            required     : false,
            defValue     : undefined,
            trim         : validate[key].trim
          });
          if (resultlt.success && resultlt.value !== undefined) {
            if (equallt) {
              ret[Op.lte] = resultlt.value;
            }
            else {
              ret[Op.lt] = resultlt.value;
            }
          }
          success ? success = resultlt.success : 1;
          !resultlt.success ? errmsg.push({
            key: aliasMax + (equallt ? '=' : ''),
            type,
            value,
            err: resultlt.errmsg
          }) : 1;
        }
        if (success && ret) {
          //简单判断成功了，这里还要检测>=6&&<=4这种矛盾的情况
          if (!(ret[Op.gte] && ret[Op.lte] && ret[Op.gte] === ret[Op.lte])) {
            let gtData = ret[Op.gte] || ret[Op.gt];
            let ltData = ret[Op.lte] || ret[Op.lt];
            if (gtData && ltData && gtData >= ltData) {
              errmsg.push(localData.em_range_relation({desc}));
              success = false;
            }
          }
        }
      }
      if (ret !== undefined) {
        retParams.all[key] = ret;
      }
      if (!success) {
        errParams.push({key, desc: validate[key].desc, type: validate[key].type, err: errmsg});
      }
    }
    else {
      let alias    = validate[key].alias || key;
      keymap[key]  = alias;
      const result = dealParams({
        desc         : validate[key].desc,
        value        : allParams[alias],
        allowEmptyStr: validate[key].allowEmptyStr || false,
        type         : validate[key].type,
        range        : validate[key].range,
        required     : validate[key].required,
        defValue     : validate[key].defValue,
        trim         : validate[key].trim
      });
      if (result.success) {
        if (result.value !== undefined) {
          retParams.all[key] = result.value;
        }
      }
      else {
        errParams.push(
          {key, desc: validate[key].desc, type: validate[key].type, value: allParams[alias], err: result.errmsg});
      }
    }
  }

  // 参数关系验证
  // M 选 N 关系
  if (options.choices && options.choices.length) {
    let errList = [];
    _.map(options.choices, (choice) => {
      if (Array.isArray(choice)) {
        choice = {fields: choice, force: false, count: 1};
      }
      choice.count = +choice.count || 1;
      if (choice.count) {
        let cnt = 0;
        for (let i = 0; i < choice.fields.length; i++) {
          if (!_.isUndefined(retParams.all[choice.fields[i]])) {
            cnt++;
          }
        }
        let flag = false;
        if (choice.force) {
          if (cnt !== choice.count) {
            flag = true;
          }
        }
        else {
          if (cnt < choice.count) {
            flag = true;
          }
        }
        if (flag) {
          let emOpts    = {
            fields: choice.fields,
            count : choice.count,
            force : choice.force
          };
          emOpts.fields = _.map(choice.fields, (field) => {
            return validate[field].desc;
          });
          errList.push(localData.em_choices(emOpts));
        }
      }
    });
    if (errList.length) {
      errParams.push({type: 'choices', err: errList});
    }
  }
  // 相等关系
  if (options.equals && options.equals.length) {
    let errList = [];
    _.map(options.equals, (fields) => {
      if (fields.length >= 2) {
        let flag  = true;
        let value = retParams.all[fields[0]];
        for (let i = 1; i < fields.length; i++) {
          if (_.isUndefined(retParams.all[fields[i]])) {
            continue;
          }
          if (retParams.all[fields[i]] !== value) {
            flag = false;
            break;
          }
        }
        if (!flag) {
          let emFields = _.map(fields, (field) => {
            return validate[field].desc;
          });
          errList.push(localData.em_equals({fields: emFields}));
        }
      }
    });
    if (errList.length) {
      errParams.push({type: 'equals', err: errList});
    }
  }
  // 比较关系
  if (options.compares && options.compares.length) {
    let errList = [];
    _.map(options.compares, (fields) => {
      if (fields.length >= 2) {
        let flag  = true;
        let value = retParams.all[fields[0]];
        for (let i = 1; i < fields.length; i++) {
          if (_.isUndefined(retParams.all[fields[i]])) {
            continue;
          }
          if (retParams.all[fields[i]] < value) {
            flag = false;
            break;
          }
          value = retParams.all[fields[i]];
        }
        if (!flag) {
          let emFields = _.map(fields, (field) => {
            return validate[field].desc;
          });
          errList.push(localData.em_compares({fields: emFields}));
        }
      }
    });
    if (errList.length) {
      errParams.push({type: 'compares', err: errList});
    }
  }
  // 条件关系
  if (options.cases && options.cases.length) {
    let errList = [];
    _.map(options.cases, (caseInfo) => {
      let flag = true;
      let hit  = true;
      if (caseInfo.when) {
        for (let i = 0; i < caseInfo.when.length; i++) {
          let whenField = caseInfo.when[i];
          if (typeof whenField === 'string') {
            // 只要检测是否存在值
            whenField = {field: whenField};
          }
          // 需要判断值是否符合条件
          if (_.isUndefined(retParams.all[whenField.field])) {
            hit = false;
            break;
          }
          else {
            if (whenField.value && retParams.all[whenField.field] !== whenField.value) {
              hit = false;
              break;
            }
          }
        }
        if (hit) {
          if (caseInfo.then) {
            for (let i = 0; i < caseInfo.then.length; i++) {
              let thenField = caseInfo.then[i];
              if (_.isUndefined(retParams.all[thenField])) {
                flag = false;
                break;
              }
            }
          }
          if (flag && caseInfo.not) {
            for (let i = 0; i < caseInfo.not.length; i++) {
              let notField = caseInfo.not[i];
              if (!_.isUndefined(retParams.all[notField])) {
                flag = false;
                break;
              }
            }
          }
        }
      }
      if (!flag) {
        let emOpt  = {};
        emOpt.when = _.map(caseInfo.when, (whenField) => {
          if (typeof whenField === 'string') {
            return validate[whenField].desc;
          }
          else {
            return validate[whenField.field].desc;
          }
        });
        emOpt.then = _.map(caseInfo.then, (thenField) => {
          return validate[thenField].desc;
        });
        emOpt.not  = _.map(caseInfo.not, (notField) => {
          return validate[notField].desc;
        });
        errList.push(localData.em_cases(emOpt));
      }
    });
    if (errList.length) {
      errParams.push({type: 'cases', err: errList});
    }
  }

  if (!errParams.length) {
    errParams = null;
  }
  //处理retParams里面的query和body、params
  const method = req.method;
  for (const item in retParams.all) {
    retParams.raw.all[keymap[item]] = retParams.all[item];
    let flag                        = false;
    if (val.query[keymap[item]] !== undefined) {
      retParams.query[item]             = retParams.all[item];
      retParams.raw.query[keymap[item]] = retParams.all[item];
      flag                              = true;
    }
    if (val.body[keymap[item]] !== undefined) {
      retParams.body[item]             = retParams.all[item];
      retParams.raw.body[keymap[item]] = retParams.all[item];
      flag                             = true;
    }
    if (val.params[keymap[item]] !== undefined) {
      retParams.params[item]             = retParams.all[item];
      retParams.raw.params[keymap[item]] = retParams.all[item];
      flag                               = true;
    }
    if (!flag) {
      //flag为false的时候说明这个参数存在于all里面但不存在与querybodyparams，也就是说这个参数属于可选参数,并且有·默认值·
      //此时根据method来赋值给query或body， get->query, other(post,patch,delete)->body
      if (method === 'GET') {
        retParams.query[item]     = retParams.all[item];
        retParams.raw.query[item] = retParams.all[item];
        flag                      = true;
      }
      else {
        retParams.body[item]     = retParams.all[item];
        retParams.raw.body[item] = retParams.all[item];
        flag                     = true;
      }
    }
  }
  return {err: errParams, ret: retParams};
}


/**
 * 参数处理
 * @param options
 * @param options.value
 * @param options.type
 * @param options.range
 * @param options.required
 * @param options.defValue
 * @param options.trim
 * @returns {{success: boolean, value: undefined, errmsg: (*|undefined)}}
 */
function dealParams(options) {
  validators    = validators.bind(this);
  let localData = this.localeData ? this.localeData() : {
    em_required: _.template('${desc?desc:"params"} is required')
  };

  let value         = options.value;
  let allowEmptyStr = options.allowEmptyStr;
  let desc          = options.desc || '';
  let type          = options.type;
  let range         = options.range;
  let required      = options.required;
  let defValue      = options.defValue;
  let trim          = options.trim;
  if (value === '' && !allowEmptyStr) {
    value = undefined;
  }

  if (value && trim) {
    value = _.trim(value);
  }
  let ret;
  let success = true;
  let errmsg;
  if (/*value !== null &&*/ value !== undefined /*&& value !== ''*/) {
    value = '' + value;

    let checkResult = validators(value, type, range, desc);
    if (checkResult.success) {
      //验证成功,转换成对应的类型
      switch (type) {
        case  vType['DATE']:
          let date = new Date(value);
          if (_.isNaN(date.getTime())) {
            date = new Date(+value);
          }
          ret = v.toDate(date.toISOString());
          break;
        case  vType['INT']:
          ret = v.toInt(value);
          break;
        case  vType['FLOAT']:
          ret = v.toFloat(value);
          break;
        case  vType['NUMBER']:
          ret = +value;
          break;
        case  vType['JSON']:
          ret = JSON.parse(value);
          break;
        case  vType['BOOL']:
          ret = v.toBoolean(value);
          break;
        case  vType['NULL']:
          ret = null;
          break;
        default :
          ret = value;
          break;
      }
    }
    else {
      //验证失败，若有默认值赋值，否则记录错误
      //160422CHANGE 不管参数可选必选，除非有默认值，否则传了就应该符合我们设置的条件，
      //没有指定参数
      // if (required === false) {
      //   //参数可选pass，有默认值则赋值
      //   if (defValue !== undefined) {
      //     ret = defValue;
      //   }
      // }
      // else {
      //参数必选，无默认值则记录错误
      if (defValue !== undefined) {
        ret = defValue;
      }
      else {
        errmsg  = checkResult.errmsg;
        success = false;
      }
      // }
    }
  }
  else {
    //没有指定参数
    if (required === false) {
      //参数可选pass，有默认值则赋值
      if (defValue !== undefined) {
        ret = defValue;
      }
    }
    else {
      //参数必选，无默认值则记录错误
      //160422CHANGE 参数必选就必须传，默认值无效
      // if (defValue !== undefined) {
      //   ret = defValue;
      // }
      // else {
      errmsg  = [localData.em_required({desc})];
      success = false;
      // }
    }
  }
  return {
    success: success,
    value  : success ? ret : undefined,
    errmsg : errmsg || undefined
  };
}