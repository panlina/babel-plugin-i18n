# dictionary-loader

`dictionary-loader`用来加载字典，在`webpack.config`中添加如下配置：

```js
webpackConfig.module.rules.push({
  type: 'javascript/auto',
  test: /i18n\.[a-zA-Z-]+\.json$/,
  loader: '@jacklu/babel-plugin-i18n/dictionary-loader'
});
```
