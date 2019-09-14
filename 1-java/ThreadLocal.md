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

    在设计上，因为需要维护value的初始值、真正需要线程隔离的对象以及Map对象，肯定需要一个包装类，其实真正的ThreadLocal就是这样一个包装类。

    想想看，因为是用全部线程共享的Map去维护需要线程隔离的变量，肯定涉及到锁竞争的问题

2、反过来，如果将维护Map的任务交给Thread本身呢。

Map去存储线程局部变量，创建一个类ThreadLocal，维护一个Map对象

假如在ThreadLocal出现之前，从零设计一个ThreadLocal

Java中的线程其实就是Thread对象，那给Thread类增加一个成员变量obj（类型是Object），直接将需要被线程隔离的变量赋值给该obj就可以了。

```java
Thread thread = Thread.currentThread();

# Set
String strS = new String("线程局部变量");
thread.obj = strS;

# Get
String strG = thread.obj;
```

很容易发现一个问题，要是有个多个变量都需要线程隔离呢。

那就交给Map对象去维护，key和value都是线程局部变量。同时将Thread类的成员变量obj改成map（类型是Map）。

```java
Thread thread = Thread.currentThread();

# Set
if (thread.map == null) {
    thread.map = new HashMap<>();
}
Map<Object, Object> map = thread.map;
String str = new String("线程局部变量");
map.put(str, str);
thread.map = map;

# Get
Map<Object, Object> map = thread.map;
String strG = map.get();
```

一是：

这么写不OO，代码会很分散，设计上来说这样是不及格的；

二是：

将线程隔离的变量本身作为key不可控，因为不同对象的equals方法是各自实现的。

比如示例中的String对象，equals方法是自己实现，想想看，str的值被线程A修改之后，再去set一次，map就存放了两份数据，明显不合理。

所以我们再设计一个包装类，实现equals方法，将包装类自身作为map的key去存储实际需要线程隔离的变量。

这个包装类实际上就是ThreadLocal。

```java
# Definition
public class ThreadLocalWrapper<T> {

    public void set(T t) {
        Thread thread = Thread.currentThread();
        if (thread.map == null) {
            thread.map = new HashMap<>();
        }
        Map<Object, Object> map = thread.map;
        map.put(this, t);
    }

    public T get() {
        Thread thread = Thread.currentThread();
        Map<Object, Object> map = thread.map;
        return (T) map.get(this);
    }
}

# Usage
ThreadLocalWrapper<String> wrapper = new ThreadLocalWrapper<>();
wrapper.set(new String("线程局部变量"));

wrapper.get();
```

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