# 命令行

## generate-dictionary

```
babel-plugin-i18n generate-dictionary <file> <language>
```

为指定文件或目录生成指定语言的字典文件。字典中的目标文本会预先用源文本填充。如果字典文件已经存在会被覆盖。

* `file`是源文件或目录。
* `language`是语言。

## update-dictionary

```
babel-plugin-i18n update-dictionary <file> <language>
```

为指定文件或目录更新指定语言的字典文件。字典根据文件当前内容生成，不保留源文本已经不存在的词条，保留旧词条的翻译，新词条的目标文本会预先用源文本填充。

* `file`是源文件或目录。
* `language`是语言。

## generate-report

```
babel-plugin-i18n generate-report <file> <language>
```

为指定文件或目录生成指定语言的翻译率报告。

* `file`是源文件或目录。
* `language`是语言。

## generate-dictionary-report

```
babel-plugin-i18n generate-dictionary-report <file> <language>
```

为指定文件或目录生成指定语言的字典诊断报告。

* `file`是源文件或目录。
* `language`是语言。
