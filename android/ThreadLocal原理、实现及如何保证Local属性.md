# ThreadLocal原理、实现及如何保证Local属性

[Java并发编程：深入剖析ThreadLocal](https://www.cnblogs.com/dolphin0520/p/3920407.html)

ThreadLocal有一个内部类ThreadLocalMap，它以ThreadLocal为key。

在首次调用ThreadLocal的get()方法时，会初始化一个ThreadLocalMap并赋值给Thread类的成员变量threadLocals，之后每次都会先从Thread实例对象中拿到ThreadLocalMap，然后根据ThreadLocal的key去查找存储的value。

所以一个Thread中会有多个ThreadLocal，它保存各自的线程本地变量。