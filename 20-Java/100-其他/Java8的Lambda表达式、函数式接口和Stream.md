[8000字长文让你彻底了解 Java 8 的 Lambda、函数式接口、Stream 用法和原理](https://juejin.im/post/5ee035e4f265da76c67ca979#heading-4)

[【java8新特性】方法引用](https://www.cnblogs.com/xiaoxi/p/7099667.html)

| 方法应用             |                          | 对应的Lambda表达式                     |
| -------------------- | ------------------------ | -------------------------------------- |
| 静态方法引用         | `Class::staticMethod`    | `args -> ClassName.staticMthond(args)` |
| 构造方法引用         | `Class::new`             | `args -> new Class(args)`              |
| 类的任意对象方法引用 | `Class::instanceMethod`  | `args -> Class.instanceMethod(args)`   |
| 类的特定对象方法引用 | `object::instanceMethod` | `args -> object.instanceMethod(args)`  |



