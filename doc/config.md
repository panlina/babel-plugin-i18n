# 配置

在项目根目录放置`i18n.config.js`。

`translator`，是一个对象，设置所有语言和它们的翻译方式，属性名为语言，属性值可以取`'dictionary'`或一个函数，为`'dictionary'`时用字典翻译，为函数时用自定义翻译函数翻译，按字典的格式接受源文本，返回目标文本，详见[字典](dictionary.md)。

`include, exclude`，定义要国际化的源文件的glob，使用的是 https://github.com/isaacs/node-glob 的实现。

`explicit`，是否默认使用explicit模式。

`test`，implicit模式下的识别函数，接受字符串，返回该字符串中是否含有本地字符。

`instance`，定义i18n全局对象实例的名称。

## 示例

```js
module.exports = {
	include: "src/**/*.{js,jsx,ts,tsx}",
	translator: {
		'en-US': 'dictionary',
		'zh-TW': require('./zhTWTranslator')
	},
	instance: 'i18n'
};
```
