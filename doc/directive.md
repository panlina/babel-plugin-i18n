# 指令

`@jacklu/babel-plugin-i18n`支持在源代码中插入指令来实现对特定位置的源代码更具体的控制。

## i18n.ignore

逗号表达式`"i18n.ignore", expression`用来标记忽略`expression`的翻译。

这个指令的作用是防止不应被翻译的文本被翻译。
