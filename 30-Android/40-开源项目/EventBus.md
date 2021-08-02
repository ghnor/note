# EventBus

[EventBus 3.0初探: 入门使用及其使用 完全解析](https://www.jianshu.com/p/acfe78296bb5)  
[EventBus 3.0进阶：源码及其设计模式 完全解析](https://www.jianshu.com/p/bda4ed3017ba)

* 三要素
  1. Event 事件。它可以是任意类型。
  2. Subscriber 事件订阅者。在EventBus3.0之前我们必须定义以onEvent开头的那几个方法，分别是onEvent、onEventMainThread、onEventBackgroundThread和onEventAsync，而在3.0之后事件处理的方法名可以随意取，不过需要加上注解@subscribe()，并且指定线程模型，默认是POSTING。
  3. Publisher 事件的发布者。我们可以在任意线程里发布事件，一般情况下，使用EventBus.getDefault()就可以得到一个EventBus对象，然后再调用post(Object)方法即可。
* 四种线程模型
  1. POSTING (默认) 表示事件处理函数的线程跟发布事件的线程在同一个线程。
  2. MAIN 表示事件处理函数的线程在主线程(UI)线程，因此在这里不能进行耗时操作。
  3. BACKGROUND 表示事件处理函数的线程在后台线程，因此不能进行UI操作。如果发布事件的线程是主线程(UI线程)，那么事件处理函数将会开启一个后台线程，如果果发布事件的线程是在后台线程，那么事件处理函数就使用该线程。
  4. ASYNC 表示无论事件发布的线程是哪一个，事件处理函数始终会新建一个子线程运行，同样不能进行UI操作。

### 3.0开始apt的优化点

在编译期已经收集了全部订阅的方法信息，生成为一个类，在eventBus初始化的时候实例化并执行，同时在运行期会收集实际每个执行过register的类对象。post事件之后，同时查找register过的对象集合和全部subscriber的方法集合，反射执行方法。

2.0则是在register的时候，反射去收集方法信息。