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

## Handler是如何实现线程切换的：ThreadLocal

```java
private static void prepare(boolean quitAllowed) {
    ...
    sThreadLocal.set(new Looper(quitAllowed));
}
```

```java
private Looper(boolean quitAllowed) {
    mQueue = new MessageQueue(quitAllowed);
    mThread = Thread.currentThread();
}
```

在Looper初始化的时候，将自己的实例交给ThreadLocal管理，每个线程都维护着一个Looper实例（每个都是独立的）。同时Looper在初始化自身时，实例化了MessageQueue作为自己的成员变量维护。

```java
public Handler(@NonNull Looper looper, @Nullable Callback callback, boolean async) {
    mLooper = looper;
    mQueue = looper.mQueue;
    mCallback = callback;
    mAsynchronous = async;
}
```

每次初始化Handler的时候，拿到对应的Looper，Looper可以由外部指定，也可以默认通过Looper.myLooper()从当前实例化Handler的线程中获取。切换到主线程就是主线程中的Looper取出消息并执行。

## 同步屏障

1. 加入同步屏障

  ```java
  mTraversalBarrier = mHandler.getLooper().getQueue().postSyncBarrier();
  ```

2. 移除同步屏障

  ```java
  mHandler.getLooper().getQueue().removeSyncBarrier(mTraversalBarrier);
  ```

3. 设置成异步消息

  ```java
  Message msg = Message.obtain(mHandler, this);
  msg.setAsynchronous(true);
  ```

>  加入同步屏障就是加入一个target为null的Message对象，同步屏障会根据时间顺序在合适的位置插入到MessageQueue。
>
> MessageQueue中遍历到同步屏障的Message之后，同步屏障后面的同步Message会跳过，优先执行异步Message。执行完一个异步Message，再去正常遍历MessageQueue中的全部Message。
>
> 如果同步屏障没有被移除，那么继续重复上面的步骤，找到异步Message并执行。
>
> 如果同步屏障已经被移除，那么就正常执行全部的Message。

```java
Message next() {
   	...
    for (;;) {
       	...

        synchronized (this) {
            // Try to retrieve the next message.  Return if found.
            final long now = SystemClock.uptimeMillis();
            Message prevMsg = null;
            // Message链表头部第一个mMessages
            Message msg = mMessages;
            // msg.target == null，同步屏障Message
            if (msg != null && msg.target == null) {
                // Stalled by a barrier.  Find the next asynchronous message in the queue.
                // 找到异步Message并赋值给msg，退出循环
                do {
                    prevMsg = msg;
                    msg = msg.next;
                } while (msg != null && !msg.isAsynchronous());
            }
            if (msg != null) {
                if (now < msg.when) {
                    // Next message is not ready.  Set a timeout to wake up when it is ready.
                    nextPollTimeoutMillis = (int) Math.min(msg.when - now, Integer.MAX_VALUE);
                } else {
                    // Got a message.
                    mBlocked = false;
                    if (prevMsg != null) {
                        // prevMsg不为空，表示存在同步屏障
                        // 下一次消息循环，会遍历原来的整个消息队列
                        prevMsg.next = msg.next;
                    } else {
                        // 不存在同步屏障，链表头部消息修改为下一条消息
                        mMessages = msg.next;
                    }
                    msg.next = null;
                    if (DEBUG) Log.v(TAG, "Returning message: " + msg);
                    msg.markInUse();
                    return msg;
                }
            } else {
                // No more messages.
                nextPollTimeoutMillis = -1;
            }

            ...
        }

        ...
    }
}
```

