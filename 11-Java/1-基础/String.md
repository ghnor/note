# String

## 对 String 的了解
## String 为什么要设计成不可变的
    
    需要综合内存,同步,数据结构以及安全等方面的考虑。再然后string不可变的设计不单单在于final关键字。因为string实现在一个char数组上，这个数组是可变的。所以还把内部的char数组作为私有常量，即private final。

    1. 字符串常量池的需要
    2. 保证hash值的唯一性

> [在java中String类为什么要设计成final？](https://www.zhihu.com/question/31345592)

## String,StringBuffer,StringBuilder的区别

  1. String是值不可变的，每次进行连接操作是都是返回一个新的String对象StringBuffer,StringBuilder是值可变的，操作是返回的是this这也就是为什么在进行大量字符串连接运算时，不推荐使用String，而推荐StringBuffer和StringBuilder。

  2. StringBuffer是线程同步的，安全性高，但执行效率低；StringBuilder是非线程同步的，安全性低，但执行效率高

## String a = "a"+"b"+"c" 在内存中创建几个对象？

这个问题涉及到了字符串常量池和字符串拼接

```
String a = "a"+"b"+"c"
```

通过编译器优化后，得到的效果是

```
String a = "abc"
```

此时，如果字符串常量池中存在 abc，则该语句并不会创建对象，只是讲字符串常量池中的引用返回而已。

如果字符串常量池中不存在 abc，则会创建并放入字符串常量池，并返回引用，此时会有一个对象进行创建。

[Java中的字符串常量池](https://droidyue.com/blog/2014/12/21/string-literal-pool-in-java/)  
[Java细节：字符串的拼接](https://droidyue.com/blog/2014/08/30/java-details-string-concatenation/)