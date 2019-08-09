/* eslint-disable no-lonely-if */
/**
 * 处理方法
 * @type {validators}
 * 3.1.0
 */
'use strict';
const v   = require('validator');
const _   = require('lodash');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });

const NUMBER_MAX = 10000000000000000;
const STRING_MAX = 10000000;

module.exports = validators;

// range 增加reg的正则匹配 已加
// eslint-disable-next-line max-statements
function validators(str, type, range, desc) {
  const localData = this.localeData ? this.localeData() : {
    em_type  : _.template('${desc?desc+"\'s ":""}`${str}` is not `${type}`'),
    em_minmax: _.template(
      '${desc?desc+"\'s ":""}${opDesc} must ${min?minOp+" `"+min+"`":""}${min&&max?" and ":" "}${max?maxOp+" `"+max+"`":""}'),
    em_reg   : _.template('${desc?desc+"\'s ":""}value(`${str}`) dont match ${regexp}'),
    em_in    : _.template('${desc?desc+"\'s ":""}value(`${str}`) must in (`${values.join("`,`")}`)'),
    em_schema: _.template('${desc?desc+"\'s ":""}value(`${str}`) dont match schema(`${JSON.stringify(schema)}`)'),
  };
  range = range || {};

  const errmsg    = [];
  let success   = true;
  let extmsg;
  let checkType = true;// type都错了后面in和reg的判断就没必要了
  switch (type) {
    case 'all':
    case 'array':
      // if (range) {
      //  if ((range.in !== undefined && !v.isIn(str, range.in))) {
      //    success = false;
      //  }
      // }
      break;
    case 'string':
      if (range && range.min === undefined) {
        range.min = 0;
      }
      if (range && (range.max === undefined || range.max > STRING_MAX)) {
        range.max = STRING_MAX;
      }
      if (range && !v.isLength(str, range.min, range.max)) {
        success = false;
        errmsg.push(localData.em_minmax({
          desc,
          type,
          opDesc: 'length',
          minOp : '>=',
          min   : range.min,
          maxOp : '<=',
          max   : range.max,
        }));
      }
      break;
    case 'date': {
      let date = new Date(str);
      if (_.isNaN(date.getTime())) {
        date = new Date(Number(str));
      }
      if (_.isNaN(date.getTime())) {
        success = false;
        checkType = false;
        errmsg.push(localData.em_type({
          desc,
          str,
          type,
        }));
      } else if (range) {
        let min;
        let max;
        if (range.min) {
          min = new Date(range.min);
          if (_.isNaN(min.getTime())) {
            min = new Date(Number(range.min));
          }
          if (_.isNaN(min.getTime())) {
            min = null;
          }
        }
        if (range.max) {
          max = new Date(range.max);
          if (_.isNaN(max.getTime())) {
            max = new Date(Number(range.max));
          }
          if (_.isNaN(max.getTime())) {
            max = null;
          }
        }
        if ((range.min !== undefined && date.getTime() < min.getTime())
              || (range.max !== undefined && date.getTime() > max.getTime())) {
          success = false;
          errmsg.push(localData.em_minmax({
            desc,
            type,
            opDesc: 'date',
            minOp : 'after',
            min   : range.min,
            maxOp : 'before',
            max   : range.max,
          }));
        }
      }
      break;
    }
    case 'int': {
      const retInt = vNumber(v.isInt, type, str, range);
      success = retInt.success;
      errmsg.push(retInt.errmsg);
      break;
    }
    case 'float': {
      const retFloat = vNumber(v.isFloat, type, str, range);
      success = retFloat.success;
      errmsg.push(retFloat.errmsg);
      break;
    }
    case 'number': {
      const retNumeric = vNumber(v.isNumeric, type, str, range);
      success = retNumeric.success;
      errmsg.push(retNumeric.errmsg);
      break;
    }
    case 'letter':
      if (!v.isAlpha(str)) {
        success = false;
        checkType = false;
        errmsg.push(localData.em_type({
          desc,
          str,
          type,
        }));
      } else {
        if (range && range.min === undefined) {
          range.min = 0;
        }
        if (range && (range.max === undefined || range.max > STRING_MAX)) {
          range.max = STRING_MAX;
        }
        if (range && !v.isLength(str, range.min, range.max)) {
          success = false;
          errmsg.push(localData.em_minmax({
            desc,
            type,
            opDesc: 'length',
            minOp : '>=',
            min   : range.min,
            maxOp : '<=',
            max   : range.max,
          }));
        }
      }
      break;
    case 'ip':
      if (!v.isIP(str)) {
        success = false;
        checkType = false;
        errmsg.push(localData.em_type({
          desc,
          str,
          type,
        }));
      } else if (range && (range.min !== undefined || range.max !== undefined)) {
        const strval = ip2number(str);
        const min    = range.min ? (v.isIP(range.min) ? ip2number(range.min) : range.min) : undefined;
        const max    = range.max ? (v.isIP(range.max) ? ip2number(range.max) : range.max) : undefined;
        if ((min && strval < min) || (max && strval > max)) {
          success = false;
          errmsg.push(localData.em_minmax({
            desc,
            type,
            opDesc: 'address',
            minOp : 'after',
            min   : range.min,
            maxOp : 'before',
            max   : range.max,
          }));
        }
      }
      break;
    case 'email':
      if (!v.isEmail(str)) {
        success = false;
        checkType = false;
        errmsg.push(localData.em_type({
          desc,
          str,
          type,
        }));
      } else {
        if (range && range.min === undefined) {
          range.min = 0;
        }
        if (range && (range.max === undefined || range.max > STRING_MAX)) {
          range.max = STRING_MAX;
        }
        if (range && !v.isLength(str, range.min, range.max)) {
          success = false;
          errmsg.push(localData.em_minmax({
            desc,
            type,
            opDesc: 'length',
            minOp : '>=',
            min   : range.min,
            maxOp : '<=',
            max   : range.max,
          }));
        }
      }
      break;
    case 'phone':
      if (!v.isMobilePhone(str, 'zh-CN')) {
        success = false;
        checkType = false;
        errmsg.push(localData.em_type({
          desc,
          str,
          type: 'China Phone Number',
        }));
      } else {
        if (range && range.min === undefined) {
          range.min = 0;
        }
        if (range && (range.max === undefined || range.max > STRING_MAX)) {
          range.max = STRING_MAX;
        }
        if (range && !v.isLength(str, range.min, range.max)) {
          success = false;
          errmsg.push(localData.em_minmax({
            desc,
            type,
            opDesc: 'length',
            minOp : '>=',
            min   : range.min,
            maxOp : '<=',
            max   : range.max,
          }));
        }
      }
      break;
    case 'url':
      if (!v.isURL(str)) {
        success = false;
        checkType = false;
        errmsg.push(localData.em_type({
          desc,
          str,
          type: 'Url',
        }));
      } else {
        if (range && range.min === undefined) {
          range.min = 0;
        }
        if (range && (range.max === undefined || range.max > STRING_MAX)) {
          range.max = STRING_MAX;
        }
        if (range && !v.isLength(str, range.min, range.max)) {
          success = false;
          errmsg.push(localData.em_minmax({
            desc,
            type,
            opDesc: 'length',
            minOp : '>=',
            min   : range.min,
            maxOp : '<=',
            max   : range.max,
          }));
        }
      }
      break;
    case 'json':
      if (!v.isJSON(str)) {
        success = false;
        checkType = false;
        errmsg.push(localData.em_type({
          desc,
          str,
          type,
        }));
      } else {
        // JSON 可以通过 schema 来限制 JSON 的数据结构
        if (range && range.schema && !ajv.validate(range.schema, JSON.parse(str))) {
          // console.log(ajv.errors)
          success = false;
          errmsg.push(localData.em_schema({
            desc,
            type,
            str,
            schema: range.schema,
          }));
          extmsg = ajv.errors;
        }
      }
      break;
    case 'null':
      if (str !== 'null') {
        success = false;
        checkType = false;
        errmsg.push(localData.em_type({
          desc,
          str,
          type: 'null value',
        }));
      }
      break;
    case 'bool':
      if (!v.isBoolean(str)) {
        success = false;
        checkType = false;
        errmsg.push(localData.em_type({
          desc,
          str,
          type,
        }));
      }
      break;
    default:
      success = false;
  }
  // common check : reg
  if (checkType && range && (range.reg !== undefined && !(str.match(range.reg) && str.match(range.reg)[0] === str))) {
    success = false;
    errmsg.push(localData.em_reg({
      desc,
      str,
      regexp: range.reg,
    }));
  }
  if (checkType && range && (range.in !== undefined && !v.isIn(str, range.in))) {
    success = false;
    errmsg.push(localData.em_in({
      desc,
      str,
      values: range.in,
    }));
  }
  return {
    success,
    errmsg,
    extmsg: extmsg || undefined,
  };

  /**
   * func to validator number
   * @param {Function} func = {v.isInt,v.isFloat,v.isNumeric}
   * @param {String} type = {int,float,number}
   * @param {String} str
   * @param {Object} range
   * @returns {boolean}
   */
  /* eslint-disable no-shadow */
  function vNumber(func, type, str, range) {
    let success   = true;
    let checkType = true;
    let errmsg;
    // 先验证类型
    if (!func(str)) {
      errmsg = localData.em_type({
        desc,
        str,
        type,
      });
      checkType = false;
      success = false;
    }
    // 再验证类型范围
    // if (range && range.min === undefined) {
    //   range.min = 0;
    // }
    if (range && (range.min === undefined || range.min < -NUMBER_MAX)) {
      range.min = -NUMBER_MAX;
    }
    if (range && (range.max === undefined || range.max > NUMBER_MAX)) {
      range.max = NUMBER_MAX;
    }
    if (success && checkType && range && (range.min !== undefined || range.max !== undefined)) {
      if (range && range.min !== undefined && range.min > Number(str)) {
        success = false;
      }
      if (success && range && range.max !== undefined && range.max < Number(str)) {
        success = false;
      }
      if (!success) {
        errmsg = localData.em_minmax({
          desc,
          type,
          opDesc: 'value',
          minOp : '>=',
          min   : range.min,
          maxOp : '<=',
          max   : range.max,
        });
      }
    }
    return { success, errmsg };
  }
}


/**
 * change ip2number
 * @param {String} str
 * @returns {Number}
 */
function ip2number(str) {
  const strArr = str.split('.');
  // eslint-disable-next-line no-bitwise
  return (Number(strArr[0]) << 24) + (Number(strArr[1]) << 16) + (Number(strArr[2]) << 8) + (Number(strArr[3]));
}
