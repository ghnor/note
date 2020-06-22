# Android中的多线程

## Android中还了解哪些方便线程切换的类

* **AsyncTask**：底层封装了线程池和Handler，便于执行后台任务以及在子线程中进行UI操作。
* **HandlerThread**：一种具有消息循环的线程，其内部可使用Handler。
* **IntentService**：是一种异步、会自动停止的服务，内部采用HandlerThread。

## 为什么不能在子线程更新UI

## 多线程在Android中的应用

## AsyncTask

* AsyncTask中有两个线程池（SerialExecutor和THREAD_POOL_EXECUTOR）和一个Handler（InternalHandler），其中线程池SerialExecutor用于任务的排队，而线程池THREAD_POOL_EXECUTOR用于真正地执行任务，InternalHandler用于将执行环境从线程池切换到主线程。
* sHandler是一个静态的Handler对象，为了能够将执行环境切换到主线程，这就要求sHandler这个对象必须在主线程创建。由于静态成员会在加载类的时候进行初始化，因此这就变相要求AsyncTask的类必须在主线程中加载，否则同一个进程中的AsyncTask都将无法正常工作。

## IntentService有什么用

IntentService可用于执行后台耗时的任务，当任务执行完成后会自动停止，同时由于IntentService是服务的原因，不同于普通Service，IntentService可自动创建子线程来执行任务，这导致它的优先级比单纯的线程要高，不容易被系统杀死，所以IntentService比较适合执行一些高优先级的后台任务。

## 直接在Activity中创建一个thread跟在service中创建一个thread之间的区别

* 在Activity中被创建：该Thread的就是为这个Activity服务的，完成这个特定的Activity交代的任务，主动通知该Activity一些消息和事件，Activity销毁后，该Thread也没有存活的意义了。
* 在Service中被创建：这是保证最长生命周期的Thread的唯一方式，只要整个Service不退出，Thread就可以一直在后台执行，一般在Service的onCreate()中创建，在onDestroy()中销毁。所以，在Service中创建的Thread，适合长期执行一些独立于APP的后台任务，比较常见的就是：在Service中保持与服务器端的长连接。

## Android中线程有没有上限

## Handler、Thread和HandlerThread的差别

* Handler：在android中负责发送和处理消息，通过它可以实现其他支线线程与主线程之间的消息通讯。
* Thread：Java进程中执行运算的最小单位，亦即执行处理机调度的基本单位。某一进程中一路单独运行的程序。
* HandlerThread：一个继承自Thread的类HandlerThread，Android中没有对Java中的Thread进行任何封装，而是提供了一个继承自Thread的类HandlerThread类，这个类对Java的Thread做了很多便利的封装。HandlerThread继承于Thread，所以它本质就是个Thread。与普通Thread的差别就在于，它在内部直接实现了Looper的实现，这是Handler消息机制必不可少的。有了自己的looper，可以让我们在自己的线程中分发和处理消息。如果不用HandlerThread的话，需要手动去调用Looper.prepare()和Looper.loop()这些方法。