# ThreadLocal

先想想ThreadLocal是为了解决什么问题设计出来的？

## 要解决什么问题

因为基于Java的内存模型，变量是内存共享，除非被进程隔离，不然不同线程都能读写同一个内存地址的变量。

所以想要去维护一个线程隔离的变量该如何去实现？

再看下，Java已经为我们设计好的ThreadLocal是怎样去使用的。

## 怎么用

继承的方式：

```java
public class MyThreadLocal extends ThreadLocal<String> {
    @Nullable
    @Override
    protected String initialValue() {
        return "线程隔离变量";
    }
}

public MyThreadLocal myThreadLocal = new MyThreadLocal();
```

非继承的方式：

```java
public ThreadLocal<String> myThreadLocal = new ThreadLocal<>();

myThreadLocal.set("线程隔离变量");
```

OK，用法非常简单。

## 要怎么去实现

首先Java中的线程其实就是Thread对象，那么

1、将这个线程本身作为key，需要线程隔离的变量作为value，存储在Map当中。不同线程在访问这个Map的时候，自身线程在Map中存储过，就put一个新的value。

    用ThreadLocal这样一个包装类去维护value的初始值、真正需要线程隔离的对象以及Map对象。
    
    因为是用全部线程共享的Map去维护需要线程隔离的变量，会涉及到锁竞争的问题。

2、反过来，将维护Map的任务交给Thread本身。将包装类ThreadLocal作为Map的key，需要线程隔离的变量作为value存储。

    能够避免锁竞争的问题。
    
    Map的数量也减少了，第一种方式Map的数量等于线程的数量，第二种方式Map的数量等于需要维护的线程隔离变量的数量。


## 内存泄漏的优化

把变量交给Thread自身维护提高了性能，带来另一个问题：

因为存储变量的Map的生命周期一定等于线程的生命周期，而变量的生命周期不一定等于线程的生命周期，势必引起内存泄漏的问题。

ThreadLocal里做了两点优化：

1、Map的key是作为弱引用存储；

2、因为是弱引用，势必存在key为null的一对键值对，所以ThreadLocal每次去读取和写入的时候，都会遍历这个Map，去移除key为null的内容。

---

[【不用背的原理】不用背的ThreadLocal原理](https://juejin.im/post/5d6d32dbe51d4561ac7bcd1b)

[Java并发编程：深入剖析ThreadLocal](https://www.cnblogs.com/dolphin0520/p/3920407.html)

---

ThreadLocal有一个内部类ThreadLocalMap，它以ThreadLocal为key。

在首次调用ThreadLocal的get()方法时，会初始化一个ThreadLocalMap并赋值给Thread类的成员变量threadLocals，之后每次都会先从Thread实例对象中拿到ThreadLocalMap，然后根据ThreadLocal的key去查找存储的value。

所以一个Thread中会有多个ThreadLocal，它保存各自的线程本地变量。

---

* ThreadLocal是一个关于创建线程局部变量的类。使用场景如下所示：

    * 实现单个线程单例以及单个线程上下文信息存储，比如交易id等。
    * 实现线程安全，非线程安全的对象使用ThreadLocal之后就会变得线程安全，因为每个线程都会有一个对应的实例。 承载一些线程相关的数据，避免在方法中来回传递参数。

* 当需要使用多线程时，有个变量恰巧不需要共享，此时就不必使用synchronized这么麻烦的关键字来锁住，每个线程都相当于在堆内存中开辟一个空间，线程中带有对共享变量的缓冲区，通过缓冲区将堆内存中的共享变量进行读取和操作，ThreadLocal相当于线程内的内存，一个局部变量。每次可以对线程自身的数据读取和操作，并不需要通过缓冲区与 主内存中的变量进行交互。并不会像synchronized那样修改主内存的数据，再将主内存的数据复制到线程内的工作内存。ThreadLocal可以让线程独占资源，存储于线程内部，避免线程堵塞造成CPU吞吐下降。
* 在每个Thread中包含一个ThreadLocalMap，ThreadLocalMap的key是ThreadLocal的对象，value是独享数据。