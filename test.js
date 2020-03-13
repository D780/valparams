'use strict';

const Valparams = require('./index');
// global.Valparams = Valparams;
// Valparams.locale('zh-cn');
// console.log(Valparams.locales());

function test(req, res, next) {
  // console.log(Valparams.localeData())
  let validater = Valparams.setParams(req,
    {
      p1 : {type: 'int', range: {min: 5}, defValue: 4,/*,allowEmptyStr: true, required: true*/},
      p2 : {type: 'string', range: {max: 5}, allowEmptyStr: true, trim:true, desc: '测试类型string'/*,  required: true*/},
      p3 : {type: 'string', desc: '测试类型Arr'},
      p4 : {alias:'p4alias',type: 'numberRange', desc: '测试范围参数'},
      p5 : {
        type    : 'json',
        range   : {
          schema: {
            type : 'array',
            items: {
              type: 'object',
              properties: {
                a: {type: ['number']},
                b: {type: ['number']}
              },
              required  : ['a']
            }
          }
        },
        required: false,
        desc    : '测试json参数'
        // desc : '测试json参数 schema限制 使用ajv处理，具体可以直接看其官网的说明，之后有空再整理一份比较常用的完整例子'
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
      p18: {type: 'string', trim: false, desc: '不去掉无意义的首尾空格'},
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
      p37: {type: 'int', trim: false, desc: '测试条件参数(cases)p37'},
      p38: {type: 'array', trim: false, desc: '测试数组array参数'},
      p39: {type: 'int', trim: false, desc: '测试条件参数(cases-choice)p39'},
      p40: {type: 'int', trim: false, desc: '测试条件参数(cases-choice)p40'},
      p41: {type: 'int', trim: false, desc: '测试条件参数(cases-choice)p41'},
      p42: {type: 'int', trim: false, desc: '测试条件参数(cases-choice)p42'},
      p43: {from: 'body', type: 'int', trim: false, desc: '测试条件参数(cases-choice)p43'},

      'x-csrf-token' : {from:'cookies', type: 'string', trim: false, desc: '测试cookies'},
      'signedkey1' : {from:'cookies', signed:true, type: 'string', trim: false, desc: '测试 signed cookies'},
      'signedkey2' : {from:'signedCookies', type: 'string', trim: false, desc: '测试signedCookies'},
    },
    {
      // // 'p22', 'p23', 'p24' 三选二
      choices : [{fields: ['p22', 'p23', 'p24'], count: 2, force: true}],
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
        // {when: ['p32'], then: ['p33'], not: ['p30']},
        {when: ['p34'], then: ['p35']},
        {when: ['p35'], not: ['p36']},
        {when: [{field: 'p35', value: 5}], then: ['p37']},
        // cases-choice（就是在 then 里面允许使用 choice， m 选 n），choice 格式跟 choices 的项一致
        // 但传了 p39='5' , 必须传 p43， p40 或 p41（二选一），不能传 p42
        {when: [{field: 'p39', value: 5}], then: [{choice: {fields:['p40', 'p41'],count:1,force:false}}, 'p43'], not:['p42']}
      ]
    }
  );
  if (validater.err && validater.err.length) {
    console.dir(validater.err, {depth: null});
  }
  else {
    console.dir(validater, {depth: null});
  }
}

test({
  method:'POST',
  params: {},
  query : {
    // p1 : null,
    // p1: '1067886786718678667',
    // p1: '10000000000000000',
    p2:null,
    // p3Arr: '233',
    // p4: '2',
    'p4>': '12',
    'p4<': ':55',
    'p4alias>': '10',
    'p4alias<': ':59',
    // p5 : '[{"ddd":1,"ao":1}]',
    p5 :  [ { a:5,ddd: 1, a1: 11 } ],
    // p5: '[33,"ghf",55]',
    // p5: '[{"a":33},{"b":"ghf"},{"a":"55"}]',
    // p6: '112.80.248.190',
    // p7: '1515151515221',
    // p7   : '1399335400000',
    // p7   : '1515110400000',
    p7   : new Date('2018-01-02'),
    // p9   : '1515110400000',
    // p15  : 'ccc'
    // p11: 'null',
    // p13:'',
    // p14:'',
    // p16:'false',
    p17  : '  233  ',
    p18  : '  233  ',
    // p19  : '',
    // p20: '525',
    // p21: '52',
    // p22: '55',
    p23: '66',
    p24: '77',
    p25: '15',
    p26: '26',
    // p27: '77'
    p30:'2',
    p31: '2',
    // p32: '2',
    // p33: '2',
    // // p34:'2',
    // p35: '5'
    // p36:'2',
    // p37:'2'
    p38:'2,2444,kk',
    p39:'5',
    p40:'5',
    // p41:'5',
    // p42:'5',
  },
  body  : {
    p17  : '  233  ',
    p43:'5'
  },
  cookies:{
    'x-csrf-token': 'XXXXX'
  },
  signedCookies:{
    'signedkey1': 'signedkeysignedkey1',
    'signedkey2': 'signedkeysignedkey2',
  }
});

//  ===============================

// async function test2(req, res, next) {
//   return Valparams.setParamsAsync(req, [
//       {key:'q1', from:'body', type: 'int', desc: ''},
//       {key:'q1', type: 'string', desc: ''},
//     ])
//     .then((ret) => {
//       console.log(ret);
//     })
//     .catch((err) => {
//       console.error(err);
//     });
// }

// test2({
//   method:'GET',
//   params: {},
//   query : {
//     q1:'testquery',
//   },
//   body  : {
//     q1:'222',
//   },
//   cookies:{
//     'x-csrf-token': 'XXXXX'
//   }
// });