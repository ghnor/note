# ThreadLocal

[Java并发编程：深入剖析ThreadLocal](https://www.cnblogs.com/dolphin0520/p/3920407.html)

ThreadLocal有一个内部类ThreadLocalMap，它以ThreadLocal为key。

在首次调用ThreadLocal的get()方法时，会初始化一个ThreadLocalMap并赋值给Thread类的成员变量threadLocals，之后每次都会先从Thread实例对象中拿到ThreadLocalMap，然后根据ThreadLocal的key去查找存储的value。

所以一个Thread中会有多个ThreadLocal，它保存各自的线程本地变量。

---

* ThreadLocal是一个关于创建线程局部变量的类。使用场景如下所示：

    * 实现单个线程单例以及单个线程上下文信息存储，比如交易id等。
    * 实现线程安全，非线程安全的对象使用ThreadLocal之后就会变得线程安全，因为每个线程都会有一个对应的实例。 承载一些线程相关的数据，避免在方法中来回传递参数。

* 当需要使用多线程时，有个变量恰巧不需要共享，此时就不必使用synchronized这么麻烦的关键字来锁住，每个线程都相当于在堆内存中开辟一个空间，线程中带有对共享变量的缓冲区，通过缓冲区将堆内存中的共享变量进行读取和操作，ThreadLocal相当于线程内的内存，一个局部变量。每次可以对线程自身的数据读取和操作，并不需要通过缓冲区与 主内存中的变量进行交互。并不会像synchronized那样修改主内存的数据，再将主内存的数据复制到线程内的工作内存。ThreadLocal可以让线程独占资源，存储于线程内部，避免线程堵塞造成CPU吞吐下降。
* 在每个Thread中包含一个ThreadLocalMap，ThreadLocalMap的key是ThreadLocal的对象，value是独享数据。