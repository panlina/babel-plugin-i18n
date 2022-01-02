# babel-plugin-i18n

`babel-plugin-i18n`是一个基于规则的用于国际化的`babel`插件。

# 示例

假设现在有源代码`index.js`：

```js
alert(`你好，${name}`);
```

只要在`index.js`旁边添加`index.js.i18n.en-US.json`：

```json
{
	"你好，{}": "Hello, {}"
}
```

在项目根目录添加`i18n.config.js`：

```js
module.exports = {
	translator: { 'en-US': 'dictionary' }
};
```

引入运行时：

```js
require("@jacklu/babel-plugin-i18n/runtime");
```

引入webpack loader：

```js
{
	type: "javascript/auto",
	test: /i18n\.[a-zA-Z-]+\.json$/,
	loader: "@jacklu/babel-plugin-i18n/dictionary-loader"
}
```

初始化：

```js
i18n.language = localStorage.locale;
```

就可以在`localStorage.locale == 'en-US'`时显示英语版本。

详细用法请参考[文档](doc/index.md)。 
