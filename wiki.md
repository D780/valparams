

example use
---
```js
// 可以全局定义
const Valparams = require('path/to/Valparams[/index]');
Valparams.locale('zh-cn');

function list(req, res, next) { 
  let validater = Valparams.setParams(req, {
    sysID : {alias:'sid',type: 'int', required: true, desc: '所属系统id'},
    page  : {type: 'int', required: false, defValue: 1,range:{min:0}, desc: '页码'},
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
````
---
validater.setParams 
use case - [ supported type example ]
```js
   params = {
      p1 : {type: 'int', range: {min: 5, max: 9}/*,allowEmptyStr: true, required: true*/},      p2 : {type: 'string', desc: '测试类型string'},
      p3 : {type: 'string', desc: '测试类型Arr'},
      p4 : {type: 'numberRange', desc: '测试范围参数'},
      p5 : {
        type : 'json',
        range: {
          schema: {
            properties: {
              a: {type: ['number', 'string']},
              b: {type: ['number']}
            },
            required  : ['a']
          }
        },
        desc : '测试json参数 schema限制 使用ajv处理，具体可以直接看其官网的说明，之后有空再整理一份比较常用的完整例子'
      },
      p6 : {type: 'ip', range: {min: '112.80.248.10', max: '112.80.248.72'}, desc: '测试ip参数'},
      // p7   : {type: 'date', range: {min: '2014-05-06'}, desc: '测试类型date'},
      p7 : {type: 'date', range: {min: 1399335400001, max: '2018-01-05'}, desc: '测试类型date'},
      p8 : {type: 'letter', desc: '测试类型letter'},
      p9 : {type: 'email', desc: '测试类型email'},
      p10: {type: 'url', desc: '测试类型url'},
      p11: {type: 'null', desc: '测试类型null'}, // 不再支持此种参数，支持了也没有任何意义
      p12: {type: 'phone', desc: '测试类型phone,目前只支持中国大陆的手机号'},
      // 暂时不支持 区分 ?XXX= 的 XXX 是否有意义的情况（没有比较好的方式），默认此种情况下还是传来了空串 {XXX:''}
      // 出于前端的方面的一些考虑可能会出现传来多余无用参数的情况，这种情况之后有合适的想法再看有没有必要支持
      // p13  : {type: 'string', desc: '测试 ?XXX='},
      // p14  : {type: 'string', defValue: null, desc: '测试 ?XXX='},
      p15: {type: 'string', range: {min: 1, in: ['aaa', 'bbb'], reg: /aaa/}, desc: '测试 正则'},
      p16: {type: 'bool', desc: '测试类型bool'},
      p17: {type: 'string', trim: true, desc: '去掉无意义的首尾空格'}, //trim默认为false 不去除 ，设置为true就会自动去除
      p18: {type: 'string', trim: false, desc: '去掉无意义的首尾空格'},
      p19: {type: 'int', /*trim: true,*/ desc: '去掉无意义的首尾空格'},
      p20: {type: 'string', trim: false, desc: '测试相等参数(equals)1'},
      p21: {type: 'string', trim: false, desc: '测试相等参数(equals)2'},
      p22: {type: 'string', trim: false, desc: '测试N选M参数(choices)1'},
      p23: {type: 'string', trim: false, desc: '测试N选M参数(choices)2'},
      p24: {type: 'string', trim: false, desc: '测试N选M参数(choices)3'},
      p25: {type: 'int', trim: false, desc: '测试比较参数(compares)1'},
      p26: {type: 'int', trim: false, desc: '测试比较参数(compares)2'},
      p27: {type: 'int', trim: false, desc: '测试比较参数(compares)3'},

      p30: {type: 'int', trim: false, desc: '测试条件参数(cases)p30'},
      p31: {type: 'int', trim: false, desc: '测试条件参数(cases)p31'},
      p32: {type: 'int', trim: false, desc: '测试条件参数(cases)p32'},
      p33: {type: 'int', trim: false, desc: '测试条件参数(cases)p33'},
      p34: {type: 'int', trim: false, desc: '测试条件参数(cases)p34'},
      p35: {type: 'int', trim: false, desc: '测试条件参数(cases)p35'},
      p36: {type: 'int', trim: false, desc: '测试条件参数(cases)p36'},
      p37: {type: 'int', trim: false, desc: '测试条件参数(cases)p37'}
   }

   options = {
      choices : [
        // 'p22', 'p23', 'p24' 三选二[以上]
        {fields: ['p22', 'p23', 'p24'], count: 2, force: false},        
        // 'p22', 'p23', 'p24' 三选一
        {fields: ['p22', 'p23', 'p24'], force: true},             
        // 'p22', 'p23' 二选一
        ['p22', 'p23']
      ],
      // 'p20', 'p21' 两个值需要相等
      equals  : [['p20', 'p21']],
      // 'p25', 'p26', 'p27' 必须符合 'p25' <= 'p26' <= 'p27'
      compares: [['p25', 'p26', 'p27']],
      
      // 使用这个控制时候，相应的参数最好不要设置required属性
      // 这里关系分别表示
      // 当传了 p30 就必须传 p31 ,不能传p32
      // 当传了 p32 就必须传 p33 ,不能传p30
      // 当传了 p34 就必须传 p35
      // 当传了 p35 就不能传p36
      // 当传了 p35 并且 p35=5 就必须传 p37
      cases: [
        {when: ['p30'], then: ['p31'], not: ['p32']},
        {when: ['p32'], then: ['p33'], not: ['p30']},
        {when: ['p34'], then: ['p35']},
        {when: ['p35'], not: ['p36']},
        {when: [{field: 'p35', value: 5}], then: ['p37']}
      ]
   }
```

`json` `参数 `schema` 限制 使用 `ajv`
在线测试地址 `https://jsonschemalint.com/`
```js
// 一个较为详细的例子
schema = {
  $schema: 'http://json-schema.org/draft-06/schema#',
  title: 'book info',
  description: 'some information about book',
  type: 'object',
  properties: {
    id: {
      description: 'The unique identifier for a book',
      type: 'integer',
      minimum: 1
    },
    name: {
      type: 'string',
      pattern: '^#([0-9a-fA-F]{6}$',
      maxLength: 6,
      minLength: 6
    },
    price: {
      type: 'number',
      multipleOf: 0.5,
      maximum: 12.5,
      exclusiveMaximum: true,
      minimum: 2.5,
      exclusiveMinimum: true
    },
    tags: {
      type: 'array',
      items: [
        {
          type: 'string',
          minLength: 5
        },
        {
          type: 'number',
          minimum: 10
        }
      ],
      additionalItems: {
        type: 'string',
        minLength: 2
      },
      minItems: 1,
      maxItems: 5,
      uniqueItems: true
    }
  },
  minProperties: 1,
  maxProperties: 5,
  required: [
    id,
    name,
    price
  ]
}
```
`type` 常见取值有 `object` | `array` | `integer` | `number` | `null` | `boolean` | `string` 

（1）当 `type` 取值为`object`时，涉及的常用关键字：
> `properties`
>> 该关键字的值是一个对象。   
>> 用于指定 `JSON` 对象中的各种不同key应该满足的校验逻辑，如果待校验 `JSON` 对象中所有值都能够通过该关键字值中定义的对应key的校验逻辑，每个key对应的值，都是一个 `JSON Schema` ，则待校验 `JSON` 对象通过校验。从这里，我们可以看到，只要待校验 `JSON` 对象的所有key分别都通过对应的 `JSON Schema` 的校验检测，这个对象才算是通过校验。
> ---
> `required`
>> 该关键字的值是一个数组，而数组中的元素必须是字符串，而且必须是唯一的。
>> 该关键字限制了 `JSON` 对象中必须包含哪些一级key。如果一个 `JSON` 对象中含有 `required` 关键字所指定的所有一级key，则该 `JSON` 对象能够通过校验。
> ---
> `minProperties` 、`maxProperties`
>> 这两个关键字的值都是非负整数。   
>> 指定了待校验 `JSON` 对象中一级key的个数限制， `minProperties` 指定了待校验 `JSON` 对象可以接受的最少一级key的个数，而 `maxProperties` 指定了待校验 `JSON` 对象可以接受的最多一级key的个数。
>> 另外，需要注意的是，省略 `minProperties` 关键字和该关键字的值为0，具有相同效果。而，如果省略 `maxProperties` 关键字则表示对一级key的最大个数没有限制。

（2）当 `type` 取值为 `array` 时，涉及的常用关键字：
> `items`
>> 该关键字的值是一个有效的 `JSON Schema` 或者一组有效的 `JSON Schema` 。
> ---
> `minItems` 、 `maxItems`
>> 这两个关键字的值都是非负整数。
>> 指定了待校验 `JSON` 数组中元素的个数限制，`minItems` 指定了待校验 `JSON` 数组可以接受的最少元素个数，而 `maxItems` 指定了待校验 `JSON` 数组可以接受的最多元素个数。
> ---
> `uniqueItems`
>> 该关键字的值是一个布尔值，即 `boolean` （`true`、`false`）。
>> 当该关键字的值为 `true` 时，只有待校验 `JSON` 数组中的所有元素都具有唯一性时，才能通过校验。当该关键字的值为 `false` 时，任何待校验 `JSON` 数组都能通过校验。

（3）当 `type` 取值为 `integer` 或 `number` 时，涉及的常用关键字：
> `multipleOf`
>> 该关键字的值是一个大于0的 `number` ，即可以是大于0的int，也可以是大于0的float。
>> 只有待校验的值能够被该关键字的值整除，才算通过校验。
> ---
> `maximum` 、 `exclusiveMaximum`
>> `maximum` 的值是一个 `number`，即可以是 `int`，也可以是 `float`。规定了待校验元素可以通过校验的最大值。
>> `exclusiveMaximum` 的值是一个 `boolean`。当该关键字的值为 `true` 时，表示待校验元素必须小于 `maximum` 指定的值；当该关键字的值为 `false` 时，表示待校验元素可以小于或者等于 `maximum` 指定的值。
> ---
> `minimum` 、 `exclusiveMinimum`
>> 与 `maximum` 、 `exclusiveMaximum` 刚好相反

（4）当type取值为string时，涉及的常用关键字：
> `maxLength`
>> 该关键字的值是一个非负整数。
>> 该关键字规定了待校验 `JSON` 元素可以通过校验的最大长度，即待校验 `JSON` 元素的最大长度必须小于或者等于该关键字的值。
> ---
> `minLength`
>> 该关键字的值是一个非负整数。
>> 该关键字规定了待校验 `JSON` 元素可以通过校验的最小长度，即待校验 `JSON元素` 的最小长度必须大于或者等于该关键字的值。
> ---
> `pattern`
>> 该关键字的值是一个正则表达式。
>> 只有待校验 `JSON` 元素符合该关键字指定的正则表达式，才算通过校验。
> ---
> `format`
>> 该关键字的值只能是以下取值：
>> `date-time`（时间格式）、`email`（邮件格式）、`hostname`（网站地址格式）、`ipv4`、`ipv6`、`uri`、`uri-reference`、`uri-template`、`json-pointer`。
>> 如果待校验的JSON元素正好是一个邮箱地址，那么，我们就可以使用 `format` 关键字进行校验，而不必通过 `pattern` 关键字指定复杂的正则表达式进行校验。

（5）全类型可用，即不局限于某个 `type`，涉及的关键字：
> `enum`
>> 该关键字的值是一个数组，该数组至少要有一个元素，且数组内的每一个元素都是唯一的。
>> 如果待校验的 `JSON` 元素和数组中的某一个元素相同，则通过校验。否则，无法通过校验。
> ---
> `const`
>> 该关键字的值可以是任何值，包括 `null`。
>> 如果待校验的 `JSON` 元素的值和该关键字指定的值相同，则通过校验。否则，无法通过校验。
>> 省略该关键字则表示无须对待校验元素进行该项校验。
> ---
> `allOf`
>> 该关键字的值是一个非空数组，数组里面的每个元素都必须是一个有效的 `JSON Schema`。
>> 只有待校验 `JSON` 元素通过数组中所有的 `JSON Schema` 校验，才算真正通过校验。
> ---
> `anyOf`
>> 该关键字的值是一个非空数组，数组里面的每个元素都必须是一个有效的 `JSON Schema`。
>> 如果待校验 `JSON` 元素能够通过数组中的任何一个 `JSON Schema` 校验，就算通过校验。
> ---
> `oneOf`
>> 该关键字的值是一个非空数组，数组里面的每个元素都必须是一个有效的 `JSON Schema`。   
>> 如果待校验 `JSON` 元素能且只能通过数组中的某一个 `JSON Schema` 校验，才算真正通过校验。
>> 不能通过任何一个校验和能通过两个及以上的校验，都不算真正通过校验。
> ---
> `not`
>> 该关键字的值是一个 `JSON Schema`。
>> 只有待校验 `JSON` 元素不能通过该关键字指定的 `JSON Schema` 校验的时候，待校验元素才算通过校验。
> ---
> `default`
>> 该关键字的值是没有任何要求的。
>> 该关键字常常用来指定待校验 `JSON` 元素的默认值，当然，这个默认值最好是符合要求的，即能够通过相应的 `JSON Schema` 的校验。

（6）再说 `type` 关键字
> 需要特别注意的是，`type` 关键字的值可以是一个 `string`，也可以是一个数组。  
> 如果 `type` 的值是一个 `string`，则其值只能是以下几种：`null`、`boolean`、`object`、`array`、`number`、`string`、`integer`。  
> 如果 `type` 的值是一个数组，则数组中的元素都必须是 `string`，且其取值依旧被限定为以上几种。只要带校验JSON元素是其中的一种，则通过校验。

