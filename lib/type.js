/**
 * vType
 * 1.0.4
 */
'use strict';
const rangeType  = {
  RANGE      : 'range',
  DATERANGE  : 'dateRange',
  INTRANGE   : 'intRange',
  FLOATRANGE : 'floatRange', // 不推荐 直接用numberRange会更好吧
  NUMBERRANGE: 'numberRange',
};
const rangeTypes = [];
for (const key in rangeType) {
  rangeTypes.push(rangeType[key]);
}
const vType = {
  ALL    : 'all', // can combine mutil type
  STRING : 'string',
  ARRAY  : 'array',
  DATE   : 'date',
  INT    : 'int',
  FLOAT  : 'float',
  LETTER : 'letter',
  NUMBER : 'number',
  IP     : 'ip',
  EMAIL  : 'email',
  PHONE  : 'phone',
  URL    : 'url',
  JSON   : 'json',
  BOOL   : 'bool',
  BOOLEAN: 'boolean',
  NULL   : 'null', // null 不应该作为类型，只有 null 才接收实际上就没有任何意义了
};
for (const key in rangeType) {
  vType[key] = rangeType[key];
}

// must {true,false}
// range {min,max,not,in}

module.exports = {
  vType,
  rangeType,
  rangeTypes,
};
