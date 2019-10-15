// Generate by [js2dts@0.3.3](https://github.com/whxaxes/js2dts#readme)

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
declare class Valparams {
  constructor();
  static defineLocale(name: any, config: any): any;
  static updateLocale(name: any, config: any): any;
  static locale(key: any, values: any): any;
  static localeData(key: any): any;
  static locales(): any;
  /**
   * static setParams
   *
   * 下面参数说明说明中 `panme` 是键，`panme_XXX` 是对象值的对应的字段 `XXX`
   *
   * @param {Object} req
   * @param {Object} params { pname: {alias, type, required, range: {in, min, max, reg, schema }, defValue, trim, allowEmptyStr, desc[, detail] } }
   * @param {String}  params.pname 参数名，同时也是验证后使用的变量名
   * @param {String}  params.pname_alias 参数别名，定义该值，前端就用该值传参数来而不是pname
   * @param {String}  params.pname_type 参数类型
   * @param {Boolean} params.pname_required 参数是否必选
   * @param {Object}  params.pname_range 参数范围限制
   * @param {Object}  params.pname_range.in     在指定值列表中
   * @param {Object}  params.pname_range.min    最小值|最短|最早（不同 type 参数 含义有所差异）
   * @param {Object}  params.pname_range.max    最大值|最长|最晚（不同 type 参数 含义有所差异）
   * @param {Object}  params.pname_range.reg    符合指定正则表达式
   * @param {Object}  params.pname_range.schema jsonSchema，针对JSON类型参数有效，使用ajv对参数进行格式控制
   * @param {*}       params.pname_defValue 默认值，没传参数或参数验证出错时生效，此时会将该值赋值到相应参数上
   * @param {Boolean} params.pname_trim          是否去掉参数前后空格字符，默认false
   * @param {Boolean} params.pname_allowEmptyStr 是否允许空串变量 默认不允许， 即 XXXX?YYY= 这种路由 YYY这个参数是否接受，默认这种情况认为没有传该参数
   * @param {String}  params.pname_desc 参数描述 用于出错返回的提示
   * @param {Object}  options 参数之间关系配置
   * @param {Object[]} options.choices 参数挑选规则 | [{fields: ['p22', 'p23', 'p24'], count: 2, force: true}] 表示'p22', 'p23', 'p24' 参数三选二
   * @param {String[]} options.choices[].fields 涉及的参数
   * @param {Number}   options.choices[].count  需要至少传 ${count} 个
   * @param {Boolean}  options.choices[].force  默认 false，为 true 时，涉及的参数中只能传 ${count} 个, 为 false 时，可以多于 ${count} 个
   * @param {String[]} options.equals 相等关系，列表中参数的值必须相等
   * @param {String[]} options.compares 大小比较关系，列表中参数的值必须依次变大
   * @param {Object[]} options.cases 参数条件判断 | [{when: ['p30'], then: ['p31'], not: ['p32']}] 表示 当传了 p30 就必须传 p31 ,同时不能传p32
   * @param {Object[]} options.cases.when 条件, 有俩种写法，1 元素为字符串， 2 元素为对象。元素为字符串时，判断不关心相关字段值，只要有传即可，为对象就要符合相应要求
   * @param {String}   options.cases.when[].field 涉及的参数的名（对象）
   * @param {String}   options.cases.when[].value 涉及的参数的值（对象）需要参数的值与该值相等才为真
   * @param {String}   options.cases.when[] 涉及的参数，（字符串）只要接收到的参数有这个字段即为真
   * @param {String[]} options.cases.then 符合 when 条件时，需要必传的参数
   * @param {String[]} options.cases.not  符合 when 条件时，不能接收的参数
   *
   * @returns {{ err: { type: String, err: String[] }, ret: { params: Object, query: Object, body: Object, query: Object, all: Object,
   *                                                          raw: { query: Object, body: Object, params: Object, all: Object } } }}
   */
  static setParams(req: any, params: _Valparams.T101, options: _Valparams.T105): _Valparams.T109;
  /**
   * static setParamsAsync
   *
   * 下面参数说明说明中 `panme` 是键，`panme_XXX` 是对象值的对应的字段 `XXX`
   *
   * @param {Object} req
   * @param {Object} params { pname: {alias, type, required, range: {in, min, max, reg, schema }, defValue, trim, allowEmptyStr, desc[, detail] } }
   * @param {String}  params.pname 参数名，同时也是验证后使用的变量名
   * @param {String}  params.pname_alias 参数别名，定义该值，前端就用该值传参数来而不是pname
   * @param {String}  params.pname_type 参数类型
   * @param {Boolean} params.pname_required 参数是否必选
   * @param {Object}  params.pname_range 参数范围限制
   * @param {Object}  params.pname_range.in     在指定值列表中
   * @param {Object}  params.pname_range.min    最小值|最短|最早（不同 type 参数 含义有所差异）
   * @param {Object}  params.pname_range.max    最大值|最长|最晚（不同 type 参数 含义有所差异）
   * @param {Object}  params.pname_range.reg    符合指定正则表达式
   * @param {Object}  params.pname_range.schema jsonSchema，针对JSON类型参数有效，使用ajv对参数进行格式控制
   * @param {*}       params.pname_defValue 默认值，没传参数或参数验证出错时生效，此时会将该值赋值到相应参数上
   * @param {Boolean} params.pname_trim          是否去掉参数前后空格字符，默认false
   * @param {Boolean} params.pname_allowEmptyStr 是否允许空串变量 默认不允许， 即 XXXX?YYY= 这种路由 YYY这个参数是否接受，默认这种情况认为没有传该参数
   * @param {String}  params.pname_desc 参数描述 用于出错返回的提示
   * @param {Object}  options 参数之间关系配置
   * @param {Object[]} options.choices 参数挑选规则 | [{fields: ['p22', 'p23', 'p24'], count: 2, force: true}] 表示'p22', 'p23', 'p24' 参数三选二
   * @param {String[]} options.choices[].fields 涉及的参数
   * @param {Number}   options.choices[].count  需要至少传 ${count} 个
   * @param {Boolean}  options.choices[].force  默认 false，为 true 时，涉及的参数中只能传 ${count} 个, 为 false 时，可以多于 ${count} 个
   * @param {String[]} options.equals 相等关系，列表中参数的值必须相等
   * @param {String[]} options.compares 大小比较关系，列表中参数的值必须依次变大
   * @param {Object[]} options.cases 参数条件判断 | [{when: ['p30'], then: ['p31'], not: ['p32']}] 表示 当传了 p30 就必须传 p31 ,同时不能传p32
   * @param {Object[]} options.cases.when 条件, 有俩种写法，1 元素为字符串， 2 元素为对象。元素为字符串时，判断不关心相关字段值，只要有传即可，为对象就要符合相应要求
   * @param {String}   options.cases.when[].field 涉及的参数的名（对象）
   * @param {String}   options.cases.when[].value 涉及的参数的值（对象）需要参数的值与该值相等才为真
   * @param {String}   options.cases.when[] 涉及的参数，（字符串）只要接收到的参数有这个字段即为真
   * @param {String[]} options.cases.then 符合 when 条件时，需要必传的参数
   * @param {String[]} options.cases.not  符合 when 条件时，不能接收的参数
   *
   * @returns {{ err: { type: String, err: String[] }, ret: { params: Object, query: Object, body: Object, query: Object, all: Object,
   *                                                          raw: { query: Object, body: Object, params: Object, all: Object } } }}
   */
  static setParamsAsync(req: any, params: _Valparams.T101, options: _Valparams.T105): _Valparams.T109;
  static vType: _Valparams.T110;
  query: any;
  body: any;
  params: any;
  all: any;
  raw: any;
  err: any;
}
declare const _Valparams: typeof Valparams;
declare namespace _Valparams {
  export interface T100 {
    in: any;
    min: any;
    max: any;
    reg: any;
    schema: any;
  }
  export interface T101 {
    pname: string;
    pname_alias: string;
    pname_type: string;
    pname_required: boolean;
    pname_range: _Valparams.T100;
    pname_defValue: any;
    pname_trim: boolean;
    pname_allowEmptyStr: boolean;
    pname_desc: string;
  }
  export interface T102 {
    fields: string[];
    count: number;
    force: boolean;
  }
  export interface T103 {
    field: string;
    value: string;
  }
  export interface T104 {
    when: _Valparams.T103[];
    then: string[];
    not: string[];
  }
  export interface T105 {
    choices: _Valparams.T102[];
    equals: string[];
    compares: string[];
    cases: _Valparams.T104[];
  }
  export interface T106 {
    type: string;
    err: string[];
  }
  export interface T107 {
    query: any;
    body: any;
    params: any;
    all: any;
  }
  export interface T108 {
    params: any;
    query: any;
    body: any;
    all: any;
    raw: _Valparams.T107;
  }
  export interface T109 {
    err: _Valparams.T106;
    ret: _Valparams.T108;
  }
  export interface T110 {
    ALL: string;
    STRING: string;
    ARRAY: string;
    DATE: string;
    INT: string;
    FLOAT: string;
    LETTER: string;
    NUMBER: string;
    IP: string;
    EMAIL: string;
    PHONE: string;
    URL: string;
    JSON: string;
    BOOL: string;
    NULL: string;
  }
}
export = _Valparams;
