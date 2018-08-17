> [YAML 语言教程 @阮一峰](http://www.ruanyifeng.com/blog/2016/07/yaml.html?f=t)

## 语法

* 区分大小写

* 使用缩进表示层级关系

* 缩进时不允许使用Tab键，只允许使用空格

* 缩进的空格数目不重要，只要相同层级的元素左侧对齐即可

* `#`表示注释，从`#`开始处到行尾

## 数据结构

* 对象：键值对的集合，又称为映射（mapping）/ 哈希（hashes） / 字典（dictionary）

* 数组：一组按次序排列的值，又称为序列（sequence） / 列表（list）

* 纯量（scalars）：单个的、不可再分的值

## 对象

```yaml
animal: pets
```

## 数组

```yaml
- Cat
- Dog
- Goldfish
```

```
['Cat', 'DOg', 'Goldfish']
```

### 数组嵌套

```yaml
-
 - Cat
 - Dog
 - Goldfish
-
 - Oreo
 - Waffle
 - Macaroon
```

```
[
    ['Cat', 'DOg', 'Goldfish'], 
    ['Oreo', 'Waffle', 'Macaroon']
]
```

### 对象数组嵌套

```yaml
-
 YAML: yaml.org 
 Ruby: ruby-lang.org 
 Python: python.org 
 Perl: use.perl.org
```

```
[
    {
        YAML: 'yaml.org',
        Ruby: 'ruby-lang.org',
        Python: 'python.org',
        Perl: 'use.perl.org'
    }
]
```

### 复合结构

```yaml
languages:
 - Ruby
 - Perl
 - Python 
websites:
 YAML: yaml.org 
 Ruby: ruby-lang.org 
 Python: python.org 
 Perl: use.perl.org 
```

```
{ 
    languages: [ 'Ruby', 'Perl', 'Python' ],
    websites: 
    { 
        YAML: 'yaml.org', 
        Ruby: 'ruby-lang.org', 
        Python: 'python.org', 
        Perl: 'use.perl.org' 
    } 
}
```

## 纯量

* 字符串
* 布尔值
* 整数
* 浮点数
* Null
* 时间
* 日期

---

布尔值、整数、浮点数直接表示。

```yaml
Boolean: true
```

```yaml
Int: 11
```

```yaml
Float: 0.9
```

---

`Null`用`~`表示。

```yaml
Object: ~
```

---

时间、日期使用ISO8601格式。

```yaml
date: 2016-11-14 00:00:00
```

会被转为

```yaml
2016-11-14T00:00:00.000Z
```

---

使用两个感叹号，强制转换数据类型。

```yaml
e: !!str 123
f: !!str true
```

```
{ e: '123', f: 'true' }
```

### 字符串

字符串默认不需要使用引号。

```yaml
str: 这是一行字符串
```

如果字符串中间包含空格，则需要添加引号。

```yaml
str: 'xxx  xxxx'
```

---

字符串可以写成多行，从第二行开始，必须有一个单空格缩进。换行符会被转为空格。

```yaml
str: 这是一段
 多行
 字符串
```

```js
{ str: '这是一段 多行 字符串' }
```

---

多行字符串可以使用`|`保留换行符，也可以使用`>`折叠换行。

```yaml
this: |
  Foo
  Bar
that: >
  Foo
  Bar
```

```js
{ this: 'Foo\nBar\n', that: 'Foo Bar\n' }
```

`+`表示保留文字块末尾的换行，`-`表示删除字符串末尾的换行。

```yaml
s1: |
  Foo

s2: |+
  Foo

s3: |-
  Foo
```

```js
{ s1: 'Foo\n', s2: 'Foo\n\n\n', s3: 'Foo' }
```

---

字符串之中可以插入 HTML 标记。

```yaml
message: |

  <p style="color: red">
    段落
  </p>
```

```js
{ message: '\n<p style="color: red">\n  段落\n</p>\n' }
```

## 引用

锚点`&`和别名`*`，可以用来引用。

```yaml
defaults: &defaults
  adapter:  postgres
  host:     localhost

development:
  database: myapp_development
  <<: *defaults

test:
  database: myapp_test
  <<: *defaults
```

等同于：

```yaml
defaults:
  adapter:  postgres
  host:     localhost

development:
  database: myapp_development
  adapter:  postgres
  host:     localhost

test:
  database: myapp_test
  adapter:  postgres
  host:     localhost
```

`&`用来建立锚点（defaults），`<<`表示合并到当前数据，`*`用来引用锚点。

另一个例子：

```yaml
- &showell Steve 
- Clark 
- Brian 
- Oren 
- *showell 
```

转换为JS代码：

```js
[ 'Steve', 'Clark', 'Brian', 'Oren', 'Steve' ]
```

## 其他

介绍两个js和yaml数据转换的库。

* [js-yaml](https://www.npmjs.com/package/js-yaml)
* [yaml.js](https://www.npmjs.com/package/yamljs)