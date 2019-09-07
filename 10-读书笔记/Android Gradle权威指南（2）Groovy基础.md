## 字符串

单引号标记的是纯粹的字符串常量，双引号则可以对字符串里的表达式做运算。

```Groovy
def name = "张三"

println '单引号的变量计算:${name}'
println "双引号的变量计算:${name}"

# 输出
单引号的变量计算:${name}
双引号的变量计算:张三
```

当只有一个变量的时候，花括号可以省略，如`$name`。

## 集合

### List

```Groovy
def numList = [1,2,3,4,5,6];  //定义一个List，类型是ArrayList

numList[1]  //访问第二个元素
numList[-1]  //访问最后一个元素
numList[-2]  //访问倒数第二个元素
numList[1..3]  //访问第二个到第四个元素

numList.each {  //遍历numList
    println it  //it变量就是正在迭代的元素
}
```

### Map

```Groovy
def map = ['width':1024,'height':768]; //定义一个Map

println map['width'] //取出key为width的值
println map.height //取出key为height的值

map.each { //遍历map
    println "Key:${it.key},Value:${it.value}" //it变量就是正在迭代的元素
}
```

### 方法

**括号是可以省略的**

```Groovy
// 定义一个方法
def method1(int a, int b) {
    println a + b
}

// 下面两种调用方法都可以
method1(1,2)
method1 1,2 //省略括号的方式
```

**return是可以不写的**

没有return时，会把方法执行过程中的最后一句代码作为其返回值。

```Groovy
// 定义一个方法
def method2(int a, int b) {
    if (a > b) {
        a
    } else {
        b
    }
}

// 调用该方法
def add1 = method2 1,2 //add1等于2
def add2 = method2 5,3 //add2等于5
```

**代码块是可以作为参数传递的**

以each方法为例：

```Groovy
// 最原始的写法
numList.each({
    println it
})

// 如果方法的最后一个参数是闭包，可以放到方法外面
numList.each() {
    println it
}

// 方法的括号可以省略
numList.each {
    println it
}
```

## 闭包

闭包本质是一种匿名函数或者匿名代码块，可能容易跟lambda概念混淆，但严格意义上来说，闭包应该是lambda的子集。

### 定义一个闭包

```Groovy
{parameters -> statements}
```

`parameters`参数和`->`符号可以被省略。

比如：

```Groovy
{x, y -> x + y} //当有两个参数，分别是x和y
{println it} //当只有一个参数，默认是it
```

### 闭包是一个对象

闭包在Groovy中是groovy.lang.Closure的实例。

在Groovy中可以这样声明一个闭包：

```Groovy
def closure = {println 'Hello World!'}
```

但是如果是类似Java这种强制声明对象类型的语言中，就会变成：

```Java
Closure closure = {println 'Hello World!'};
```

当然，在Java中不是这样的，只是打个比方，为了更好理解闭包是对象这个概念。

既然闭包是对象，那么现在看来作为方法的参数就是理所当然的事情。定义一个带闭包参数的方法：

```Groovy
def closureMethod(closure) {
    closure()
}
```

调用闭包方法：

```Groovy
closureMethod closure
closureMethod(closure)
closureMethod {
    println 'Hello World!'
}
```

直接调用闭包：

```Groovy
println closure() //结果：Hello World!
println closure.call() //结果：Hello World!
```

其实可以看到，闭包可以直接被调用

### 闭包参数

闭包与普通对象，如String、int的区别就是，闭包作为方法的参数之外，自身还可以接受入参。

```Groovy
// 只有一个参数的闭包

def customEach(closure) {
    for (int i in 1..10) {
        closure(i)
    }
}

customEach {
    println it
}
```

```Groovy
// 有多个参数的闭包

def eachMap(closure) {
    def map1 = ['name':'张荣', 'age':18]
    map1.each {
        closure(it.key, it.value)
    }
}

eachMap {
    k, v -> println "${k} is ${v}"
}
```