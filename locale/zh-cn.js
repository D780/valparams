'use strict';

const Valparams = require('../index');
const _         = require('lodash');

module.exports = Valparams.defineLocale('zh-cn', {
  em_type  : _.template('${desc?desc+" 的值 ":""}`${str}` 的类型不是 `${type}`'),
  em_minmax: opt => {
    const descMap  = { 'length': '长度', 'value': '数值', 'date': '日期', 'address': 'IP地址' };
    const minOpMap = { '>=': '大于等于', '>': '大于' };
    const maxOpMap = { '<=': '少于等于', '<': '少于' };
    opt.opDesc = descMap[opt.opDesc];
    let minStr;
    if (opt.min && opt.max) {
      return _.template('${desc?desc+" 的":""}${opDesc} 必须 在 ${min} 和 ${max} 之间')(opt);
    }
    opt.minOp = minOpMap[opt.minOp];
    opt.maxOp = maxOpMap[opt.maxOp];
    if (opt.minOp === 'after') {
      minStr = _.template('${min!==undefined?"在 `"+min+"` 之后":""}');
    } else {
      minStr = _.template('${min!==undefined?minOp+" `"+min+"`":""}');
    }
    let maxStr;
    if (opt.maxOp === 'before') {
      maxStr = _.template('${max!==undefined?"在 `"+max+"` 之前":""}');
    } else {
      maxStr = _.template('${max!==undefined?maxOp+" `"+max+"`":""}');
    }
    opt.minStr = minStr(opt);
    opt.maxStr = maxStr(opt);
    return _.template('${desc?desc+" 的":""}${opDesc} 必须 ${minStr}${min&&max?" 并且 ":" "}${maxStr}')(opt);
  },
  em_reg           : _.template('${desc?desc+" 的":""}值 `${str}` 与 (${regexp}) 不匹配'),
  em_in            : _.template('${desc?desc+" 的":""}值 `${str}` 必须在 [`${values.join("`、`")}`] 中'),
  em_schema        : _.template('${desc?desc+" 的":""}值 `${str}` 与指定结构 (`${JSON.stringify(schema)}`) 冲突'),
  em_required      : _.template('${desc?desc:"该参数"}不能为空'),
  em_range_relation: _.template('${desc?desc+" 的":""}数值关系存在冲突'),
  em_choices       : _.template('${force?"需要":"至少"}从 [`${fields.join("`、`")}`] 中 选取 ${count} 个参数'),
  em_equals        : _.template('[`${fields.join("`、`")}`] 参数必须是相等的'),
  em_compares      : _.template('[`${fields.join("`、`")}`] 参数必须是递增的'),
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
    _.map(opt.then, (thenField, idx) => {
      if (typeof thenField === 'object') {
        opt.then[idx] = `${thenField.total} 中${thenField.force ? '需要' : '至少'}选 ${thenField.count} 参数（${thenField.fields.join('、')}）`;
      }
    });
    return _.template(
      '当传了 ${when.join("`、`")} 时, ${then.length?"必须传 `"+then.join("`、`")+"` 参数":""}${then.length&&not.length?", 同时 ":""}${not.length?"不能传 `"+not.join("`、`")+"` 参数":""}')(
      opt);
  },
});
