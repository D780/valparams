### ValParams 含有

#### 参数验证处理

Valparams.setParams(req, params, options);

| Param | Type | Description | Example |
| --- | --- | --- | --- |
| req | Object | request 对象,这里我们就是取相应的三种请求的参数进行参数验证 | {params, query, body} |
| params | Object | 参数的格式配置 | {sysID : {alias:'sid',type: 'int', required: true, desc: '所属系统id'}} |
| params[pname] | String | 参数名 | 
| params[pname].alias | String | 参数别名，可以使用该参数指定前端使用的参数名称 |
| params[pname].type | String | 参数类型 | 常用可选类型有 int, string, json 等，其他具体可见下文或用 Valparams.vType 进行查询 |
| params[pname].required | Boolean | 是否必须 |
| params[pname].range | Object | 参数范围控制 | {min: '112.80.248.10', max: '112.80.248.72'} |
| params[pname].range.min| ALL | 最小值（对应不同类型有不同含义，如string则为最短长度，ip则为最小的ip） |
| params[pname].range.max  | ALL | 最大值，与min类似 |
| params[pname].range.in | Array | 在XX中，指定参数必须为其中的值 |
| params[pname].range.reg | RegExp | 正则判断，参数需要符合正则 |
| params[pname].range.schema | Object | jsonSchema，针对JSON类型参数有效，使用ajv对参数进行格式控制 | 
| params[pname].defValue | ALL | 默认值，没传参数或参数验证出错时生效，此时会将该值赋值到相应参数上 |
| params[pname].trim | Boolean | 是否去掉参数前后空格字符，默认false |
| params[pname].allowEmptyStr | Boolean | 是否允许接受空字符串，默认false |
| params[pname].desc | String | 参数含义描述 |
| options | Object | 参数关系配置 |
| options.choices | Array | 参数挑选规则 | [{fields: ['p22', 'p23', 'p24'], count: 2, force: true}] 表示'p22', 'p23', 'p24' 参数三选二 |       
| options.choices[].fields | Array | 涉及的参数 |
| options.choices[].count | Number | 需要至少传{count}个 |
| options.choices[].force | Boolean | 默认 false，为true时，涉及的参数中只能传{count}个 |
| options.equals | Array | 参数相等 | [['p20', 'p21'], ['p22', 'p23']] 表示 'p20', 'p21' 两个值需要相等，'p22', 'p23' 两个值需要相等 |
| options.equals[] | Array | 涉及的参数(涉及的参数的值需要是相等的) |
| options.compares | Array | 参数大小关系 |  [['p25', 'p26', 'p27']] 表示 'p25', 'p26', 'p27' 必须符合 'p25' <= 'p26' <= 'p27' |
| options.compares[] | Array | 涉及的参数(涉及的参数的值需要是按顺序从小到大的) |
| options.cases | Object | 参数条件判断 | [{when: ['p30'], then: ['p31'], not: ['p32']}] 表示 当传了 p30 就必须传 p31 ,同时不能传p32|
| options.cases.when | Array | 条件 |
| options.cases.when[] | String | 涉及的参数，（字符串）只要接收到的参数有这个字段即为真 |
| options.cases.when[].field | 涉及的参数的名（对象） | --- |
| options.cases.when[].value | 涉及的参数的值（对象）需要参数的值与该值相等才为真 | --- |
| options.cases.then | Array | 符合when条件时，需要必传的参数 |
| options.cases.not | Array | 符合when条件时，不能接收的参数 |
```js
const Valparams = require('path/to/Valparams[/index]');
Valparams.locale('zh-cn');

function list(req, res, next) { 
  let validater = Valparams.setParams(req, {
    sysID : {alias:'sid',type: 'int', required: true, desc: '所属系统id'},
    page  : {type: 'int', required: false, defValue: 1, range:{min:0}, desc: '页码'},
    size  : {type: 'int', required: false, defValue: 30, desc: '页面大小'},
    offset: {type: 'int', required: false, defValue: 0, desc: '位移'}
  }, {
    choices : [{fields: ['sysID', 'page'], count: 1, force: false}],
  });
  if (validater.err && validater.err.length) {
    console.log(validater.err);
  }
  else {
    console.log(validater);
    //{ query: { page: 1, size: 30 },
    //  body: {},
    //  params: { sysID: 2 },
    //  all: { sysID: 2, page: 1, size: 30 },
    //  err: null }
    //  raw: { query: { page: 1, size: 30 },
    //         body: {},
    //         params: { sid: 2 },
    //       }
    //}
    //do something
  }
}
```

#### 返回支持的类型列表
```js
Valparams.vType = {
  ALL        : 'all',
  STRING     : 'string',
  DATE       : 'date',
  INT        : 'int',
  FLOAT      : 'float',
  LETTER     : 'letter',
  NUMBER     : 'number',
  IP         : 'ip',
  EMAIL      : 'email',
  PHONE      : 'phone',
  URL        : 'url',
  JSON       : 'json',
  BOOL       : 'bool',
  NULL       : 'null',
  RANGE      : 'range',
  DATERANGE  : 'dateRange',
  INTRANGE   : 'intRange',
  FLOATRANGE : 'floatRange',
  NUMBERRANGE: 'numberRange'
};
````

##### 自定义本地化文件
Valparams.defineLocale(key, value);

| Param | Type | Description | Example |
| --- | --- | --- | --- |
| key | String | 语言标识 | zh-cn |
| value | Object | 本地化内容，可配置内容有 em_type,em_minmax,em_reg,em_in,em_schema,em_required,em_range_relation,em_choices,em_equals,em_compares,em_cases | --- |

##### 更新已有本地化文件内容
Valparams.updateLocale(key, value);

参数含义同 defineLocale

##### 获取本地化文件内容
Valparams.localeData(key);

| Param | Type | Description | Example |
| --- | --- | --- | --- |
| key | String | 语言标识 | zh-cn |

##### 列出已加载的本地化文件
Valparams.locales(key);

目前已有 en 、 zh-cn

| Param | Type | Description | Example |
| --- | --- | --- | --- |
| key | String | 语言标识 | zh-cn |

##### 设置使用的本地化文件
Valparams.locale(locale); 
如： `Valparams.locale('zh-cn')`;
