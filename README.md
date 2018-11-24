# Valparams
web参数验证工具

[![NPM](https://nodei.co/npm/valparams.png?downloads=true)](https://nodei.co/npm/valparams/)  

[![NPM version](https://img.shields.io/npm/v/valparams.svg?style=flat-square)](https://npmjs.com/package/valparams)

## Install
```npm i valparams --save```

## How to use

### The basic usage
```js
const Valparams = require('valparams');
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
```

## API

See the [api](doc/api.md) document.

## example use

See the [wiki](doc/wiki.md) document.

## License

[ISC](LICENSE)
