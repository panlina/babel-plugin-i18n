# babel-plugin

`@jacklu/i18n`和`@jacklu/babel-plugin-i18n/import-dictionary`分别用来执行文本的转换和自动加载字典，在`.babelrc`中添加如下配置：

```json
{
  "plugins": ["@jacklu/babel-plugin-i18n/import-dictionary", "@jacklu/i18n"]
}
```

其中`@jacklu/babel-plugin-i18n/import-dictionary`是可选的。如果不使用这个插件，就由应用自己控制字典的加载。

比如：

```js
// 常规方式，由文件自己引入自己需要的字典
// index.js
import 'i18n.en-US.json';
import 'index.i18n.en-US.json`;

// 应用代码
// ...
```

```js
// 也可以由入口文件或某个文件引入所有字典
// index.js
var a = require.context('.', true, /i18n\.[a-zA-Z-]+\.json$/);
for (var k of a.keys()) a(k);

// 应用代码
// ...
```
