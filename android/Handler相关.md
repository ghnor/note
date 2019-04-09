# Handler相关

## Handler 机制和底层实现
## Handler的延迟消息是如何实现的

[Handler.postDelayed()精确延迟指定时间的原理](http://www.dss886.com/2016/08/17/01/)

1. 首先计算延迟的时间和当前时间之和赋值给msg.when，同时将这个msg直接丢进messageQueue。循环到这个延迟消息时，调用native方法nativePollOnce()休眠线程并在目标时间重新唤醒线程。
2. 如果在循环中发现MessageQueue中已经没有其他消息或只有延迟的消息，那么在下一次执行enqueueMessage()方法时，会主动唤醒线程，处理message消息。

## Handler、Thread、HandlerThread区别
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