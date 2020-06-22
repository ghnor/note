# Handler相关

[Android消息机制的原理及源码解析](https://www.jianshu.com/p/f10cff5b4c25)  
[Handler 都没搞懂，拿什么去跳槽啊？](https://juejin.im/post/5c74b64a6fb9a049be5e22fc)  
[Android Handler 消息机制（解惑篇）](https://juejin.im/entry/57fb3c53128fe100546ea4f2)  
[Android 消息机制](https://blog.csdn.net/guolin_blog/article/details/9991569)  
[Android异步消息处理机制完全解析，带你从源码的角度彻底理解](https://blog.csdn.net/guolin_blog/article/details/9991569)  
[Android 异步消息处理机制 让你深入理解 Looper、Handler、Message三者关系](https://blog.csdn.net/lmj623565791/article/details/38377229/)  
[Android消息处理机制(Handler、Looper、MessageQueue与Message) ，这一篇文章就够了](https://blog.csdn.net/dfskhgalshgkajghljgh/article/details/52671248)

## Handler的延迟消息是如何实现的

[Handler.postDelayed()精确延迟指定时间的原理](http://www.dss886.com/2016/08/17/01/)

1. 首先计算延迟的时间和当前时间之和赋值给msg.when，同时将这个msg直接丢进messageQueue。循环到这个延迟消息时，调用native方法nativePollOnce()休眠线程并在目标时间重新唤醒线程。
2. 如果在循环中发现MessageQueue中已经没有其他消息或只有延迟的消息，那么在下一次执行enqueueMessage()方法时，会主动唤醒线程，处理message消息。

## Looper死循环为什么不会导致应用卡死

* 主线程的主要方法就是消息循环，一旦退出消息循环，那么你的应用也就退出了，Looer.loop()方法可能会引起主线程的阻塞，但只要它的消息循环没有被阻塞，能一直处理事件就不会产生ANR异常。
* 造成ANR的不是主线程阻塞，而是主线程的Looper消息处理过程发生了任务阻塞，无法响应手势操作，不能及时刷新UI。
* 阻塞与程序无响应没有必然关系，虽然主线程在没有消息可处理的时候是阻塞的，但是只要保证有消息的时候能够立刻处理，程序是不会无响应的。

Android中为什么主线程不会因为Looper.loop()里的死循环卡死？ - Gityuan的回答 - 知乎
https://www.zhihu.com/question/34652589/answer/90344494  

## 可以在子线程直接new一个Handler吗

不可以，因为在主线程中，Activity内部包含一个Looper对象，它会自动管理Looper，处理子线程中发送过来的消息。而对于子线程而言，没有任何对象帮助我们维护Looper对象，所以需要我们自己手动维护。所以要在子线程开启Handler要先创建Looper，并开启Looper循环。

```
Looper.prepare();

new Handler() {};

Looper.loop();
```

## Message可以如何创建？哪种效果更好，为什么？

* 直接生成实例Message m = new Message
* 通过Message m = Message.obtain
* 通过Message m = mHandler.obtainMessage

后两者效果更好，因为Android默认的消息池中消息数量是10，而后两者是直接在消息池中取出一个Message实例，这样做就可以避免多生成Message实例。

## Messagequeue 的数据结构是什么？为什么要用这个数据结构？