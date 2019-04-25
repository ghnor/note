# RxJava

[拆轮子系列：拆 RxJava](https://blog.piasy.com/2016/09/15/Understand-RxJava/index.html)

[友好 RxJava2.x 源码解析（一）基本订阅流程](https://juejin.im/post/5a209c876fb9a0452577e830)  
[友好 RxJava2.x 源码解析（二）线程切换](https://juejin.im/post/5a248206f265da432153ddbc)  
[友好 RxJava2.x 源码解析（三）zip 源码分析](https://juejin.im/post/5ac16a2d6fb9a028b617a82a)

[RxJava 沉思录（一）：你认为 RxJava 真的好用吗？](https://juejin.im/post/5b8f536c5188255c352d3528)  
[RxJava 沉思录（二）：空间维度](https://juejin.im/post/5b8f5470e51d450e3d2c8ddf)  
[RxJava 沉思录（三）：时间维度](https://juejin.im/post/5b8f5ea8f265da0a9223887e)  
[RxJava 沉思录（四）：总结](https://juejin.im/post/5b8f5f0ee51d450ea52f6a37)

[RxJava 源码解析之观察者模式](https://juejin.im/post/58dcc66444d904006dfd857a)

[Android Rxjava：图解不一样的诠释](https://juejin.im/post/5cb72999e51d456e5d3dac29#heading-13)

**reactiveX**

reactiveX是一个跨语言的标准、规范，即：响应式编程。

reactivex是最开始是一个在微软的计算机科学家发明的，是一个编程的框架，当时用的是.net语言，全称是reactive extensions也叫reactiveX或者RX。

核心其实是观察者模式，主要想解决问题是并行和异步。

**Rxjava**

rxjava的全称是reactivexjava，是jvm的reactivex的一个实现，是一个library，类似于 httpServlet、springmvc这种的对servlet的实现。

目前java语言实现rx的有jdk9的Flow api、rxjava(现在是2.0版)、Spring Framework 5的reactor。

## 常用操作符

[你一定会用到的 RxJava 操作符](https://blog.csdn.net/u014165119/article/details/52582782)  
[RxJava 常用操作符大全（一）](https://www.jianshu.com/p/7ef220559c67)  
[RxJava常用操作符学习](https://www.jianshu.com/p/9e6b972a378d)

* 创建Observable
  * from  
    转换集合为一个每次发射集合中一个元素的 Observable 对象。可用来遍历集合。
  * just  
    转换一个或多个 Object 为依次发射这些 Object 的 Observable 对象。
  * create  
    返回一个在被 OnSubscribe 订阅时执行特定方法的 Observable 对象。
  * interval  
    返回一个每隔指定的时间间隔就发射一个序列号的 Observable 对象，可用来做倒计时等操作。
  * timer  
    创建一个在指定延迟时间后发射一条数据（ 固定值：0 ）的 Observable 对象，可用来做定时操作。
  * range  
    创建一个发射指定范围内的连续整数的 Observable 对象。
* 重做
  * repeat  
    使Observable 对象在发出 onNext() 通知之后重复发射数据。重做结束才会发出 onComplete() 通知，若重做过程中出现异常则会中断并发出 onError() 通知。
  * repeatWhen
    使Observable 对象在发出 onNext() 通知之后有条件的重复发射数据。重做结束才会发出 onCompleted() 通知，若重做过程中出现异常则会中断并发出 onError() 通知。
* 重试
  * retry
    在执行 Observable对象的序列出现异常时，不直接发出 onError() 通知，而是重新订阅该 Observable对象，直到重做过程中未出现异常，则会发出 onNext() 和 onCompleted() 通知；若重做过程中也出现异常，则会继续重试，直到达到重试次数上限，超出次数后发出最新的 onError() 通知。
  * retryWhen
    有条件的执行重试。
* 变换
  * map  
    把源 Observable 发射的元素应用于指定的函数，并发送该函数的结果。
  * flatMap  
    转换源 Observable 对象为另一个 Observable 对象。
* 过滤
  * filter  
    只发射满足指定谓词的元素。
  * first  
    返回一个仅仅发射源 Observable 发射的第一个［满足指定谓词的］元素的 Observable，如果如果源 Observable 为空，则会抛出一个 NoSuchElementException。
  * last  
    返回一个仅仅发射源 Observable 发射的倒数第一个［满足指定谓词的］元素的 Observable，如果如果源 Observable 为空，则会抛出一个 NoSuchElementException。
  * skip  
    跳过前面指定数量或指定时间内的元素，只发射后面的元素。
  * skipLast  
    跳过前面指定数量或指定时间内的元素，只发射后面的元素。指定时间时会延迟源 Observable 发射的任何数据。
  * take  
    只发射前面指定数量或指定时间内的元素。
  * takeLast  
    只发射后面指定数量或指定时间内的元素。指定时间时会延迟源 Observable 发射的任何数据。
  * sample  
    定期发射 Observable 发射的最后一条数据。
  * elementAt  
    只发射指定索引的元素。
  * elementAtOrDefault  
    只发射指定索引的元素，若该索引对应的元素不存在，则发射默认值。
  * ignoreElements  
    不发射任何数据，直接发出 onCompleted() 通知。
  * distinct  
    过滤重复的元素，过滤规则是：只允许还没有发射过的元素通过。
  * debounce  
    源 Observable 每产生结果后，如果在规定的间隔时间内没有产生新的结果，则发射这个结果，否则会忽略这个结果。该操作符会过滤掉发射速率过快的数据项。