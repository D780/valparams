'use strict';

const Valparams = require('../Valparams');
const _         = require('lodash');

module.exports = Valparams.defineLocale('en', {
  em_type  : _.template('${desc?desc+"\'s ":""}`${str}` is not `${type}`'),
  em_minmax: _.template(
    '${desc?desc+"\'s ":""}${opDesc} must ${min?minOp+" `"+min+"`":""}${min&&max?" and ":" "}${max?maxOp+" `"+max+"`":""}'),
  em_reg           : _.template('${desc?desc+"\'s ":""} value(`${str}`) dont match ${regexp}'),
  em_in            : _.template('${desc?desc+"\'s ":""}value(`${str}`) must in [`${values.join("`,`")}`]'),
  em_schema        : _.template('${desc?desc+"\'s ":""}value(`${str}`) dont match schema(`${JSON.stringify(schema)}`)'),
  em_required      : _.template('${desc?desc:"params"} is required'),
  em_range_relation: _.template('${desc?desc+"\'s ":""}relationship of values has error'),
  em_choices       : _.template('must choice ${force?"":"at least "}${count} from [`${fields.join("`,`")}`]'),
  em_equals        : _.template('[`${fields.join("`,`")}`] must be equal'),
  em_compares      : _.template('[`${fields.join("`,`")}`] must be progressive increase'),
  em_cases         : opt => {
    opt.when = opt.when || [];
    opt.then = opt.then || [];
    opt.not = opt.not || [];
    _.map(opt.when, (whenField, idx) => {
      if (typeof whenField === 'string') {
        whenField = { field: whenField };
      } else {
        opt.when[idx] = `${whenField.field} = ${whenField.value}`;
      }
    });
    _.map(opt.then, (thenField, idx) => {
      if (typeof thenField === 'object') {
        opt.then[idx] = `${thenField.total} ${thenField.force ? '' : 'at least '}choice ${thenField.count} parameter (from ${thenField.fields.join(',')})`;
      }
    });
    return _.template(
      'when pass ${when.join("`,`")}, ${then.length?"must pass params: `"+then.join("`,`")+"`":""}${then.length&&not.length?", and":""}${not.length?" cann\'t pass params: `"+not.join("`,`")+"`":""}')(
      opt);
  },
});
