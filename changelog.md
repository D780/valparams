# 3.8.4
- 增加 Array 数组类型的支持，可以识别 ,(英文逗号)分割的字符串数组 以及 post请求中直接传递的数组
# 3.8.0
- [lib/validators] 3.1.0->3.2.0  增加minmax默认最大值
# 3.7.0
- [lib/getparams]  3.6.0->3.7.0  增加参数关系限制 cases(条件控制) 支持定义 when then not 动态调整参数是否必填的情况
# 3.6.0
- [lib/getparams]  3.5.0->3.6.0 
- [lib/validators] 3.0.0->3.1.0
- 修正某些情况下中文的错误提示不正确
- 错误提示增加desc信息输出
- 增加参数allowEmptyStr，是否允许空串变量 默认不允许， 即 XXXX?YYY= 这种路由 YYY这个参数是否接受，默认这种情况认为没有传该参数
# 3.5.0
- 增加参数关系限制的支持
- [lib/getparams]  3.4.0->3.5.0 现支持 choices（参数N选M） equals（参数值需相等） compares（参数值需为递增关系）
# 3.4.0
- 模块改用类的形式实现，增加国际化支持，目前可选 'en'、'zh-cn'，优化错误日志输出，增加对JSONSchema的支持（ajv）
- [lib/locale]  0.0.0->1.0.0 
- [lib/locales] 0.0.0->1.0.0
- [lib/getparams]  3.3.0->3.4.0
- [lib/validators]  2.1.0->3.0.0
- [lib/type]  1.0.3->1.0.4 调整支持格式
# 3.3.0
- [lib/getparams]  3.2.0->3.3.0 增加参数trim，是否要去除得到的值得首尾空格
# 3.2.0
- [lib/getparams]  3.1.2->3.2.0 增加错误信息的检测返回
    调整规则 1 不管参数可选必选，除非有默认值，否则传了就应该符合我们设置的条件
            2 参数必选就必须传，默认值无效
- [lib/validators]  2.0.3->2.1.0 增加错误信息的检测返回,修复IP大小判断时的转换错误问题
# 3.1.5
- [FIXED]  修复raw的query或者body没有得到没有传但是有默认值的参数
# 3.1.4
- [lib/getparams]  3.1.1->3.1.2 value允许为null,取消不能为空串的限制,增加BOOL类型的转换
- [lib/type]  1.0.2->1.0.3 增加phone和bool两种类型
- [lib/validators]  2.0.2->2.0.3 增加phone和bool两种类型支持,修复仅设置min时,isLength参数max的处理问题null->undefined
# 3.1.3
- [lib/validators]  2.0.1->2.0.2 ip增加min和max的范围支持
# 3.1.2
- [lib/getparams]  3.1.0->3.1.1 must参数换成使用required,目前保持支持用must
# 3.1.1
- [async] 0.1.0 提供promise版本
- [sync]  3.0.0 原版移到sync 默认仍然是提供sync
- [lib/type]  1.0.0->1.0.2 增加range dateRange intRange floatRange numberRange
- [lib/getparams]  3.0.0->3.1.0 重构代码 增加XX>=[:]YY的参数支持如 p6>=:5 ->p6={$gte:5}
# 3.1.0
- [ADDED] setParamsAsync，提供promise版本的支持(async),原版不变
- 补全版本信息
# early
- 还没有changelog呢